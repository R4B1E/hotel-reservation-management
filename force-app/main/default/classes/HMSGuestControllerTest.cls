@IsTest
private class HMSGuestControllerTest {

    @TestSetup
    static void setup() {
        // Create Account with Guest record type
        Id guestRtId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Guest')?.getRecordTypeId();
        Account acc = new Account(Name = 'Thompson (Guest)', RecordTypeId = guestRtId);
        insert acc;

        Contact c = new Contact(
            AccountId = acc.Id,
            FirstName = 'Marcus',
            LastName = 'Thompson',
            Email = 'marcus@test.com',
            Phone = '+15551234567',
            VIP_Status__c = true,
            Nationality__c = 'US'
        );
        insert c;
    }

    @IsTest
    static void testGetGuests() {
        Test.startTest();
        HMSGuestController.GuestListResult result = HMSGuestController.getGuests(null, null, null, null);
        Test.stopTest();
        System.assert(!result.guests.isEmpty());
    }

    @IsTest
    static void testGetGuestsWithSearch() {
        Test.startTest();
        HMSGuestController.GuestListResult result = HMSGuestController.getGuests('Marcus', 'VIP', 10, 0);
        Test.stopTest();
        System.assert(!result.guests.isEmpty());
    }

    @IsTest
    static void testGetGuestDetail() {
        Contact c = [SELECT Id FROM Contact WHERE LastName = 'Thompson' LIMIT 1];
        Test.startTest();
        HMSGuestController.GuestRowWrapper guest = HMSGuestController.getGuestDetail(c.Id);
        Test.stopTest();
        System.assertEquals('Marcus', guest.firstName);
        System.assertEquals(true, guest.isVip);
    }

    @IsTest
    static void testCreateGuest() {
        Test.startTest();
        Id newId = HMSGuestController.createGuest('Linda', 'Kim', 'linda@test.com', '+8201234', 'KR', false);
        Test.stopTest();
        System.assertNotEquals(null, newId);
    }

    @IsTest
    static void testUpdateGuest() {
        Contact c = [SELECT Id FROM Contact WHERE LastName = 'Thompson' LIMIT 1];
        Test.startTest();
        HMSGuestController.updateGuest(c.Id, '{"firstName":"Updated","email":"updated@test.com"}');
        Test.stopTest();
        c = [SELECT FirstName, Email FROM Contact WHERE Id = :c.Id];
        System.assertEquals('Updated', c.FirstName);
        System.assertEquals('updated@test.com', c.Email);
    }
}
