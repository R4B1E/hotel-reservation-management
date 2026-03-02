public with sharing class HMSRoomController {

    @AuraEnabled(cacheable=true)
    public static List<RoomCardWrapper> getAllRooms(String search, String statusFilter, String hkFilter) {
        String query = 'SELECT Id, Name, Room_Number__c, Category__c, Room_Status__c, ' +
                       'Housekeeping_Status__c, Floor__c, Bed_Type__c, Max_Guests__c, ' +
                       'Price_Per_Night__c, Current_Reservation__c ' +
                       'FROM Hotel_Room__c WHERE Is_Active__c = true';

        if (String.isNotBlank(search)) {
            String s = '%' + String.escapeSingleQuotes(search) + '%';
            query += ' AND (Room_Number__c LIKE :s OR Name LIKE :s OR Category__c LIKE :s)';
        }
        if (String.isNotBlank(statusFilter) && statusFilter != 'All') {
            query += ' AND Room_Status__c = :statusFilter';
        }
        if (String.isNotBlank(hkFilter) && hkFilter != 'All') {
            query += ' AND Housekeeping_Status__c = :hkFilter';
        }
        query += ' ORDER BY Floor__c ASC NULLS LAST, Room_Number__c ASC';

        List<RoomCardWrapper> result = new List<RoomCardWrapper>();
        for (Hotel_Room__c r : Database.query(query)) {
            result.add(wrapRoom(r));
        }
        return result;
    }

    @AuraEnabled(cacheable=true)
    public static RoomStatsWrapper getRoomSummaryStats() {
        RoomStatsWrapper w = new RoomStatsWrapper();
        w.total = 0; w.vacant = 0; w.occupied = 0; w.clean = 0; w.dirty = 0;
        for (AggregateResult ar : [
            SELECT Room_Status__c st, COUNT(Id) cnt
            FROM Hotel_Room__c WHERE Is_Active__c = true GROUP BY Room_Status__c
        ]) {
            Integer cnt = (Integer) ar.get('cnt');
            w.total += cnt;
            String st = (String) ar.get('st');
            if (st == 'Available') w.vacant += cnt;
            else if (st == 'Occupied') w.occupied += cnt;
        }
        w.clean = [SELECT COUNT() FROM Hotel_Room__c WHERE Is_Active__c = true AND Housekeeping_Status__c = 'Clean'];
        w.dirty = [SELECT COUNT() FROM Hotel_Room__c WHERE Is_Active__c = true AND Housekeeping_Status__c = 'Dirty'];
        return w;
    }

    @AuraEnabled
    public static void updateRoomStatus(Id roomId, String status, String hkStatus) {
        Hotel_Room__c room = [SELECT Id FROM Hotel_Room__c WHERE Id = :roomId LIMIT 1];
        if (String.isNotBlank(status)) room.Room_Status__c = status;
        if (String.isNotBlank(hkStatus)) room.Housekeeping_Status__c = hkStatus;
        update room;
    }

    private static RoomCardWrapper wrapRoom(Hotel_Room__c r) {
        RoomCardWrapper w = new RoomCardWrapper();
        w.id = r.Id;
        w.name = r.Name;
        w.roomNumber = r.Room_Number__c;
        w.category = r.Category__c;
        w.roomStatus = r.Room_Status__c;
        w.hkStatus = r.Housekeeping_Status__c;
        w.floor = r.Floor__c != null ? Integer.valueOf(r.Floor__c) : null;
        w.bedType = r.Bed_Type__c;
        w.maxGuests = r.Max_Guests__c != null ? Integer.valueOf(r.Max_Guests__c) : null;
        w.pricePerNight = r.Price_Per_Night__c;
        w.isOccupied = r.Room_Status__c == 'Occupied';
        return w;
    }

    public class RoomCardWrapper {
        @AuraEnabled public Id id;
        @AuraEnabled public String name;
        @AuraEnabled public String roomNumber;
        @AuraEnabled public String category;
        @AuraEnabled public String roomStatus;
        @AuraEnabled public String hkStatus;
        @AuraEnabled public Integer floor;
        @AuraEnabled public String bedType;
        @AuraEnabled public Integer maxGuests;
        @AuraEnabled public Decimal pricePerNight;
        @AuraEnabled public Boolean isOccupied;
    }

    public class RoomStatsWrapper {
        @AuraEnabled public Integer total;
        @AuraEnabled public Integer vacant;
        @AuraEnabled public Integer occupied;
        @AuraEnabled public Integer clean;
        @AuraEnabled public Integer dirty;
    }
}
