@IsTest
private class HMSDashboardControllerTest {

    @TestSetup
    static void setup() {
        Hotel_Room__c room = new Hotel_Room__c(
            Name = 'Test Room 101',
            Category__c = 'Regular',
            Price_Per_Night__c = 100,
            Is_Active__c = true,
            Room_Number__c = '101',
            Room_Status__c = 'Available',
            Housekeeping_Status__c = 'Clean'
        );
        insert room;

        Reservation__c res = new Reservation__c(
            Room__c = room.Id,
            Check_In_Date__c = Date.today(),
            Check_Out_Date__c = Date.today().addDays(3),
            Adults__c = 2,
            Children__c = 0,
            Guest_First_Name__c = 'Test',
            Guest_Last_Name__c = 'Guest',
            Guest_Email__c = 'test@example.com',
            Status__c = 'Confirmed',
            Nights__c = 3,
            Room_Rate__c = 100,
            Subtotal__c = 300,
            Taxes__c = 36,
            Total__c = 336,
            Confirmation_Number__c = 'TST-001'
        );
        insert res;
    }

    @IsTest
    static void testGetDashboardKPIs() {
        Test.startTest();
        HMSDashboardController.DashboardKPIWrapper kpi = HMSDashboardController.getDashboardKPIs();
        Test.stopTest();
        System.assertNotEquals(null, kpi);
        System.assert(kpi.totalRooms >= 1);
    }

    @IsTest
    static void testGetOccupancyHistory() {
        Test.startTest();
        List<HMSDashboardController.OccupancyDayWrapper> days = HMSDashboardController.getOccupancyHistory(10);
        Test.stopTest();
        System.assertNotEquals(null, days);
        System.assertEquals(10, days.size());
    }

    @IsTest
    static void testGetOccupancyHistoryNull() {
        Test.startTest();
        List<HMSDashboardController.OccupancyDayWrapper> days = HMSDashboardController.getOccupancyHistory(null);
        Test.stopTest();
        System.assertEquals(10, days.size());
    }

    @IsTest
    static void testGetRoomStatusBreakdown() {
        Test.startTest();
        HMSDashboardController.RoomStatusBreakdownWrapper bd = HMSDashboardController.getRoomStatusBreakdown();
        Test.stopTest();
        System.assertNotEquals(null, bd);
        System.assert(bd.total >= 1);
    }

    @IsTest
    static void testGetRecentReservations() {
        Test.startTest();
        List<HMSDashboardController.ReservationSummaryWrapper> res = HMSDashboardController.getRecentReservations(5);
        Test.stopTest();
        System.assert(!res.isEmpty());
    }

    @IsTest
    static void testGetRecentReservationsNull() {
        Test.startTest();
        List<HMSDashboardController.ReservationSummaryWrapper> res = HMSDashboardController.getRecentReservations(null);
        Test.stopTest();
        System.assertNotEquals(null, res);
    }

    @IsTest
    static void testGetOccupancyByRoomType() {
        Test.startTest();
        List<HMSDashboardController.OccupancyByTypeWrapper> types = HMSDashboardController.getOccupancyByRoomType();
        Test.stopTest();
        System.assertNotEquals(null, types);
    }
}
