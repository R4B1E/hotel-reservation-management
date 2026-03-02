@IsTest
private class HMSCalendarControllerTest {

    @TestSetup
    static void setup() {
        Hotel_Room__c room = new Hotel_Room__c(
            Name = 'Cal Room', Category__c = 'Duplex', Price_Per_Night__c = 200,
            Is_Active__c = true, Room_Number__c = '1001', Room_Status__c = 'Available',
            Housekeeping_Status__c = 'Clean', Floor__c = 1
        );
        insert room;

        insert new Reservation__c(
            Room__c = room.Id, Check_In_Date__c = Date.today(),
            Check_Out_Date__c = Date.today().addDays(3),
            Adults__c = 2, Children__c = 0,
            Guest_First_Name__c = 'Cal', Guest_Last_Name__c = 'Test',
            Guest_Email__c = 'cal@test.com', Status__c = 'Confirmed',
            Nights__c = 3, Room_Rate__c = 200, Subtotal__c = 600,
            Taxes__c = 72, Total__c = 672, Confirmation_Number__c = 'CAL-001'
        );
    }

    @IsTest
    static void testGetRoomCalendarData() {
        Test.startTest();
        List<HMSCalendarController.CalendarSectionWrapper> data = HMSCalendarController.getRoomCalendarData(Date.today(), Date.today().addDays(10));
        Test.stopTest();
        System.assert(!data.isEmpty());
    }

    @IsTest
    static void testGetRoomCalendarDataNulls() {
        Test.startTest();
        List<HMSCalendarController.CalendarSectionWrapper> data = HMSCalendarController.getRoomCalendarData(null, null);
        Test.stopTest();
        System.assertNotEquals(null, data);
    }

    @IsTest
    static void testGetCalendarStats() {
        Test.startTest();
        HMSCalendarController.CalendarStatsWrapper stats = HMSCalendarController.getCalendarStats();
        Test.stopTest();
        System.assert(stats.total >= 1);
    }
}
