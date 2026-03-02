@IsTest
private class HMSRoomControllerTest {

    @TestSetup
    static void setup() {
        Hotel_Room__c room = new Hotel_Room__c(
            Name = 'Room 101',
            Category__c = 'Regular',
            Price_Per_Night__c = 150,
            Is_Active__c = true,
            Room_Number__c = '101',
            Room_Status__c = 'Available',
            Housekeeping_Status__c = 'Clean',
            Floor__c = 1,
            Bed_Type__c = 'Queen',
            Max_Guests__c = 2
        );
        insert room;
    }

    @IsTest
    static void testGetAllRooms() {
        Test.startTest();
        List<HMSRoomController.RoomCardWrapper> rooms = HMSRoomController.getAllRooms(null, null, null);
        Test.stopTest();
        System.assert(!rooms.isEmpty());
    }

    @IsTest
    static void testGetAllRoomsWithFilters() {
        Test.startTest();
        List<HMSRoomController.RoomCardWrapper> rooms = HMSRoomController.getAllRooms('101', 'Available', 'Clean');
        Test.stopTest();
        System.assert(!rooms.isEmpty());
    }

    @IsTest
    static void testGetRoomSummaryStats() {
        Test.startTest();
        HMSRoomController.RoomStatsWrapper stats = HMSRoomController.getRoomSummaryStats();
        Test.stopTest();
        System.assert(stats.total >= 1);
    }

    @IsTest
    static void testUpdateRoomStatus() {
        Hotel_Room__c room = [SELECT Id FROM Hotel_Room__c LIMIT 1];
        Test.startTest();
        HMSRoomController.updateRoomStatus(room.Id, 'Occupied', 'Dirty');
        Test.stopTest();
        room = [SELECT Room_Status__c, Housekeeping_Status__c FROM Hotel_Room__c WHERE Id = :room.Id];
        System.assertEquals('Occupied', room.Room_Status__c);
        System.assertEquals('Dirty', room.Housekeeping_Status__c);
    }
}
