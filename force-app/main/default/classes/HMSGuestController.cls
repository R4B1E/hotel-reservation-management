public with sharing class HMSGuestController {

    @AuraEnabled(cacheable=true)
    public static GuestListResult getGuests(String search, String typeFilter, Integer lim, Integer offset) {
        if (lim == null || lim <= 0) lim = 50;
        if (offset == null || offset < 0) offset = 0;

        String query = 'SELECT Id, FirstName, LastName, Email, Phone, ' +
                       'VIP_Status__c, Nationality__c, Total_Stays__c, Total_Spent__c, ' +
                       'Member_Since__c, Guest_Tier__c ' +
                       'FROM Contact WHERE Id != null';

        if (String.isNotBlank(search)) {
            String s = '%' + String.escapeSingleQuotes(search) + '%';
            query += ' AND (FirstName LIKE :s OR LastName LIKE :s OR Email LIKE :s)';
        }
        if (typeFilter == 'VIP') {
            query += ' AND VIP_Status__c = true';
        }
        query += ' ORDER BY LastName ASC, FirstName ASC LIMIT :lim OFFSET :offset';

        GuestListResult result = new GuestListResult();
        result.guests = new List<GuestRowWrapper>();
        result.totalCount = [SELECT COUNT() FROM Contact];

        for (Contact c : Database.query(query)) {
            result.guests.add(wrapGuest(c));
        }
        return result;
    }

    @AuraEnabled(cacheable=true)
    public static GuestRowWrapper getGuestDetail(Id contactId) {
        Contact c = [
            SELECT Id, FirstName, LastName, Email, Phone,
                   VIP_Status__c, Nationality__c, Total_Stays__c, Total_Spent__c,
                   Member_Since__c, Guest_Tier__c, Guest_Preferences__c
            FROM Contact WHERE Id = :contactId LIMIT 1
        ];
        return wrapGuest(c);
    }

    @AuraEnabled
    public static Id createGuest(String firstName, String lastName, String email, String phone, String nationality, Boolean isVip) {
        Contact c = new Contact(
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            Phone = phone,
            Nationality__c = nationality,
            VIP_Status__c = isVip != null ? isVip : false
        );
        insert c;
        return c.Id;
    }

    @AuraEnabled
    public static void updateGuest(Id contactId, String jsonData) {
        Map<String, Object> data = (Map<String, Object>) JSON.deserializeUntyped(jsonData);
        Contact c = [SELECT Id FROM Contact WHERE Id = :contactId LIMIT 1];
        if (data.containsKey('firstName')) c.FirstName = (String) data.get('firstName');
        if (data.containsKey('lastName')) c.LastName = (String) data.get('lastName');
        if (data.containsKey('email')) c.Email = (String) data.get('email');
        if (data.containsKey('phone')) c.Phone = (String) data.get('phone');
        if (data.containsKey('nationality')) c.Nationality__c = (String) data.get('nationality');
        if (data.containsKey('isVip')) c.VIP_Status__c = (Boolean) data.get('isVip');
        update c;
    }

    private static GuestRowWrapper wrapGuest(Contact c) {
        GuestRowWrapper w = new GuestRowWrapper();
        w.id = c.Id;
        w.firstName = c.FirstName;
        w.lastName = c.LastName;
        w.fullName = ((c.FirstName != null ? c.FirstName : '') + ' ' + (c.LastName != null ? c.LastName : '')).trim();
        w.email = c.Email;
        w.phone = c.Phone;
        w.isVip = c.VIP_Status__c;
        w.nationality = c.Nationality__c;
        w.totalStays = c.Total_Stays__c != null ? Integer.valueOf(c.Total_Stays__c) : 0;
        w.totalSpent = c.Total_Spent__c;
        w.guestTier = c.Guest_Tier__c;
        w.initials = (c.FirstName != null ? c.FirstName.substring(0, 1) : '') + (c.LastName != null ? c.LastName.substring(0, 1) : '');
        return w;
    }

    public class GuestListResult {
        @AuraEnabled public List<GuestRowWrapper> guests;
        @AuraEnabled public Integer totalCount;
    }

    public class GuestRowWrapper {
        @AuraEnabled public Id id;
        @AuraEnabled public String firstName;
        @AuraEnabled public String lastName;
        @AuraEnabled public String fullName;
        @AuraEnabled public String email;
        @AuraEnabled public String phone;
        @AuraEnabled public Boolean isVip;
        @AuraEnabled public String nationality;
        @AuraEnabled public Integer totalStays;
        @AuraEnabled public Decimal totalSpent;
        @AuraEnabled public String guestTier;
        @AuraEnabled public String initials;
    }
}
