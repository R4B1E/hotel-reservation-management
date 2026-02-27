/**
 * @description Controller for Hotel Room operations — The Azure LWR Experience Cloud site.
 *
 * IMAGE STORAGE
 * ─────────────
 * Room images are stored as Salesforce Files (ContentDocument / ContentVersion)
 * linked to each Hotel_Room__c record via ContentDocumentLink.
 *
 * Primary_Image_URL__c holds a fallback/CDN URL for the hero image.
 * The getAvailableRooms and getRoomById methods also return a resolved
 * publicUrl from the first linked ContentVersion so the LWC can display
 * images without an additional query.
 *
 * To upload images:
 *   1. Open a Hotel_Room__c record in Salesforce
 *   2. Go to the Files related list → Upload Files
 *      (or use the data loader script in /scripts/upload-room-images.sh)
 *   3. Paste the resulting Content Public Link URL into Primary_Image_URL__c
 *      for use as fallback.
 */
public with sharing class HotelRoomController {
  @AuraEnabled(cacheable=true)
  public static List<RoomWrapper> getAvailableRooms(
    Integer guestCount,
    String category,
    Date checkIn,
    Date checkOut
  ) {
    String query =
      'SELECT Id, Name, Category__c, Price_Per_Night__c, Short_Description__c, ' +
      'Full_Description__c, Square_Meters__c, Max_Guests__c, Bed_Type__c, ' +
      'View_Type__c, Is_Featured__c, Primary_Image_URL__c, Tagline__c ' +
      'FROM Hotel_Room__c WHERE Is_Active__c = true';

    if (guestCount != null)
      query += ' AND Max_Guests__c >= :guestCount';
    if (String.isNotBlank(category) && category != 'All')
      query += ' AND Category__c = :category';
    query += ' ORDER BY Is_Featured__c DESC, Price_Per_Night__c ASC';

    List<Hotel_Room__c> rooms = Database.query(query);
    return wrapRooms(rooms);
  }

  @AuraEnabled(cacheable=true)
  public static RoomWrapper getRoomById(Id roomId) {
    Hotel_Room__c room = [
      SELECT
        Id,
        Name,
        Category__c,
        Price_Per_Night__c,
        Short_Description__c,
        Full_Description__c,
        Square_Meters__c,
        Max_Guests__c,
        Bed_Type__c,
        View_Type__c,
        Is_Featured__c,
        Primary_Image_URL__c,
        Tagline__c
      FROM Hotel_Room__c
      WHERE Id = :roomId
      LIMIT 1
    ];
    List<RoomWrapper> wrapped = wrapRooms(new List<Hotel_Room__c>{ room });
    return wrapped.isEmpty() ? null : wrapped[0];
  }

  @AuraEnabled(cacheable=true)
  public static List<Room_Amenity__c> getRoomAmenities(Id roomId) {
    return [
      SELECT
        Id,
        Name,
        Icon__c,
        Icon_Key__c,
        Category__c,
        Short_Description__c,
        Is_Highlight__c,
        Sort_Order__c
      FROM Room_Amenity__c
      WHERE Room__c = :roomId
      ORDER BY Sort_Order__c ASC NULLS LAST
    ];
  }

  @AuraEnabled(cacheable=true)
  public static List<String> getRoomCategories() {
    List<String> cats = new List<String>{ 'All' };
    for (AggregateResult ar : [
      SELECT Category__c cat
      FROM Hotel_Room__c
      WHERE Is_Active__c = TRUE
      GROUP BY Category__c
      ORDER BY Category__c
    ]) {
      cats.add((String) ar.get('cat'));
    }
    return cats;
  }

  // ── Private helpers ──────────────────────────────────────────

  private static List<RoomWrapper> wrapRooms(List<Hotel_Room__c> rooms) {
    // Collect room Ids to query linked files in bulk
    Set<Id> roomIds = new Map<Id, Hotel_Room__c>(rooms).keySet();

    Map<Id, List<String>> imageMap = new Map<Id, List<String>>();
    for (Id rid : roomIds) {
      imageMap.put(rid, new List<String>());
    }

    // STEP 1: Find all files linked to these specific Hotel Rooms.
    // We map the ContentDocumentId back to the RoomId(s) so we know which image belongs where.
    Map<Id, List<Id>> docIdToRoomIds = new Map<Id, List<Id>>();

    for (ContentDocumentLink cdl : [
      SELECT ContentDocumentId, LinkedEntityId
      FROM ContentDocumentLink
      WHERE LinkedEntityId IN :roomIds
    ]) {
      if (!docIdToRoomIds.containsKey(cdl.ContentDocumentId)) {
        docIdToRoomIds.put(cdl.ContentDocumentId, new List<Id>());
      }
      // Note: A single file could technically be linked to multiple rooms, so we use a list
      docIdToRoomIds.get(cdl.ContentDocumentId).add(cdl.LinkedEntityId);
    }

    // STEP 2: Only proceed if we actually found files attached to the rooms
    if (!docIdToRoomIds.isEmpty()) {
      // Query the distributions using the Document IDs we just collected
      // Notice how we use ContentVersion.FileType instead of ContentDocument.FileType!
      for (ContentDistribution cd : [
        SELECT ContentDocumentId, DistributionPublicUrl, ContentVersion.Title
        FROM ContentDistribution
        WHERE
          ContentDocumentId IN :docIdToRoomIds.keySet()
          AND ContentVersion.FileType IN ('JPG', 'PNG', 'WEBP', 'GIF')
        ORDER BY ContentVersion.Title ASC
      ]) {
        // STEP 3: Connect the dots! Use the map from Step 1 to assign URLs to the right Room
        List<Id> linkedRooms = docIdToRoomIds.get(cd.ContentDocumentId);

        for (Id roomId : linkedRooms) {
          if (imageMap.containsKey(roomId)) {
            imageMap.get(roomId).add(cd.DistributionPublicUrl);
          }
        }
      }
    }

    List<RoomWrapper> result = new List<RoomWrapper>();
    for (Hotel_Room__c r : rooms) {
      RoomWrapper w = new RoomWrapper();
      w.id = r.Id;
      w.name = r.Name;
      w.category = r.Category__c;
      w.pricePerNight = r.Price_Per_Night__c;
      w.shortDescription = r.Short_Description__c;
      w.fullDescription = r.Full_Description__c;
      w.squareMeters = r.Square_Meters__c;
      w.maxGuests = r.Max_Guests__c;
      w.bedType = r.Bed_Type__c;
      w.view = r.View_Type__c;
      w.isFeatured = r.Is_Featured__c;
      w.tagline = r.Tagline__c;

      // Prefer Salesforce Files; fall back to Primary_Image_URL__c
      List<String> imgs = imageMap.get(r.Id);
      if (imgs != null && !imgs.isEmpty()) {
        w.imageUrl = imgs[0];
        w.images = imgs;
      } else {
        w.imageUrl = r.Primary_Image_URL__c;
        w.images = String.isNotBlank(r.Primary_Image_URL__c)
          ? new List<String>{ r.Primary_Image_URL__c }
          : new List<String>();
      }
      result.add(w);
    }
    return result;
  }

  // ── Wrapper class sent to LWC ─────────────────────────────────
  public class RoomWrapper {
    @AuraEnabled
    public Id id;
    @AuraEnabled
    public String name;
    @AuraEnabled
    public String category;
    @AuraEnabled
    public Decimal pricePerNight;
    @AuraEnabled
    public String shortDescription;
    @AuraEnabled
    public String fullDescription;
    @AuraEnabled
    public Decimal squareMeters;
    @AuraEnabled
    public Decimal maxGuests;
    @AuraEnabled
    public String bedType;
    @AuraEnabled
    public String view;
    @AuraEnabled
    public Boolean isFeatured;
    @AuraEnabled
    public String tagline;
    @AuraEnabled
    public String imageUrl; // first image — used by room card
    @AuraEnabled
    public List<String> images; // all images — used by room detail gallery
  }
}
