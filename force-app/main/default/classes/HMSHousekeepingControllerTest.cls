@IsTest
private class HMSHousekeepingControllerTest {

    @TestSetup
    static void setup() {
        Hotel_Room__c room = new Hotel_Room__c(
            Name = 'HK Room', Category__c = 'Regular', Price_Per_Night__c = 100,
            Is_Active__c = true, Room_Number__c = '201', Room_Status__c = 'Available',
            Housekeeping_Status__c = 'Dirty', Floor__c = 2
        );
        insert room;
    }

    @IsTest
    static void testGetStaffOnDuty() {
        Test.startTest();
        List<HMSHousekeepingController.StaffOnDutyWrapper> staff = HMSHousekeepingController.getStaffOnDuty();
        Test.stopTest();
        System.assertNotEquals(null, staff);
    }

    @IsTest
    static void testGetHousekeepingRooms() {
        Test.startTest();
        List<HMSHousekeepingController.HKRoomWrapper> rooms = HMSHousekeepingController.getHousekeepingRooms(null, null, null);
        Test.stopTest();
        System.assert(!rooms.isEmpty());
    }

    @IsTest
    static void testGetHousekeepingRoomsFiltered() {
        Test.startTest();
        List<HMSHousekeepingController.HKRoomWrapper> rooms = HMSHousekeepingController.getHousekeepingRooms('Dirty', 'All', '2');
        Test.stopTest();
        System.assert(!rooms.isEmpty());
    }

    @IsTest
    static void testGetHousekeepingStats() {
        Test.startTest();
        HMSHousekeepingController.HKStatsWrapper stats = HMSHousekeepingController.getHousekeepingStats();
        Test.stopTest();
        System.assert(stats.dirty >= 1);
    }

    @IsTest
    static void testUpdateHousekeepingStatus() {
        Hotel_Room__c room = [SELECT Id FROM Hotel_Room__c LIMIT 1];
        Test.startTest();
        HMSHousekeepingController.updateHousekeepingStatus(room.Id, 'Clean');
        Test.stopTest();
        room = [SELECT Housekeeping_Status__c, Last_Cleaned__c FROM Hotel_Room__c WHERE Id = :room.Id];
        System.assertEquals('Clean', room.Housekeeping_Status__c);
        System.assertNotEquals(null, room.Last_Cleaned__c);
    }

    @IsTest
    static void testAssignStaff() {
        Hotel_Room__c room = [SELECT Id FROM Hotel_Room__c LIMIT 1];
        User u = [SELECT Id FROM User WHERE IsActive = true LIMIT 1];
        Test.startTest();
        HMSHousekeepingController.assignStaff(room.Id, u.Id);
        Test.stopTest();
        room = [SELECT Assigned_Housekeeper__c FROM Hotel_Room__c WHERE Id = :room.Id];
        System.assertEquals(u.Id, room.Assigned_Housekeeper__c);
    }

    @IsTest
    static void testCreateHousekeepingTask() {
        Hotel_Room__c room = [SELECT Id FROM Hotel_Room__c LIMIT 1];
        Test.startTest();
        Id taskId = HMSHousekeepingController.createHousekeepingTask(room.Id, null, 'Standard Cleaning', 'Normal', 'Test notes');
        Test.stopTest();
        System.assertNotEquals(null, taskId);
    }
}
