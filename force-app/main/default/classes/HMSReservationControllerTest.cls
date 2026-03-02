@IsTest
private class HMSReservationControllerTest {

    @TestSetup
    static void setup() {
        Hotel_Room__c room = new Hotel_Room__c(
            Name = 'Test Room 308',
            Category__c = 'Regular',
            Price_Per_Night__c = 310,
            Is_Active__c = true,
            Room_Number__c = '308',
            Room_Status__c = 'Available',
            Housekeeping_Status__c = 'Clean',
            Floor__c = 3,
            Bed_Type__c = 'King',
            Max_Guests__c = 2
        );
        insert room;

        Reservation__c res = new Reservation__c(
            Room__c = room.Id,
            Check_In_Date__c = Date.today().addDays(5),
            Check_Out_Date__c = Date.today().addDays(9),
            Adults__c = 2, Children__c = 0,
            Guest_First_Name__c = 'Marcus', Guest_Last_Name__c = 'Thompson',
            Guest_Email__c = 'marcus@test.com', Guest_Phone__c = '+15551234',
            Status__c = 'Confirmed', Nights__c = 4,
            Room_Rate__c = 310, Subtotal__c = 1240, Taxes__c = 148.80, Total__c = 1388.80,
            Confirmation_Number__c = 'HMS-TEST-001',
            Payment_Status__c = 'Pending', Booking_Source__c = 'Direct Booking'
        );
        insert res;
    }

    @IsTest
    static void testGetReservations() {
        Test.startTest();
        HMSReservationController.ReservationListResult result = HMSReservationController.getReservations(null, null, null, null);
        Test.stopTest();
        System.assert(!result.reservations.isEmpty());
    }

    @IsTest
    static void testGetReservationsWithSearch() {
        Test.startTest();
        HMSReservationController.ReservationListResult result = HMSReservationController.getReservations('Marcus', 'All', 10, 0);
        Test.stopTest();
        System.assertNotEquals(null, result);
    }

    @IsTest
    static void testGetReservationDetail() {
        Reservation__c res = [SELECT Id FROM Reservation__c LIMIT 1];
        Test.startTest();
        HMSReservationController.ReservationDetailWrapper detail = HMSReservationController.getReservationDetail(res.Id);
        Test.stopTest();
        System.assertEquals('Marcus', detail.guestFirstName);
        System.assertEquals('308', detail.roomNumber);
    }

    @IsTest
    static void testCreateReservation() {
        Hotel_Room__c room = [SELECT Id FROM Hotel_Room__c LIMIT 1];
        String json = '{"roomId":"' + room.Id + '","checkIn":"' + Date.today().addDays(20) + '","checkOut":"' + Date.today().addDays(23) + '","guestFirstName":"Linda","guestLastName":"Kim","guestEmail":"linda@test.com","bookingSource":"Direct Booking","ratePlan":"BAR Weekend"}';
        Test.startTest();
        String confNum = HMSReservationController.createReservation(json);
        Test.stopTest();
        System.assert(confNum.startsWith('HMS-'));
    }

    @IsTest
    static void testCheckInGuest() {
        Reservation__c res = [SELECT Id FROM Reservation__c LIMIT 1];
        Test.startTest();
        HMSReservationController.checkInGuest(res.Id);
        Test.stopTest();
        res = [SELECT Status__c FROM Reservation__c WHERE Id = :res.Id];
        System.assertEquals('Checked In', res.Status__c);
    }

    @IsTest
    static void testCheckOutGuest() {
        Reservation__c res = [SELECT Id FROM Reservation__c LIMIT 1];
        res.Status__c = 'Checked In';
        res.Actual_Check_In__c = DateTime.now().addHours(-24);
        update res;
        Test.startTest();
        HMSReservationController.checkOutGuest(res.Id);
        Test.stopTest();
        res = [SELECT Status__c FROM Reservation__c WHERE Id = :res.Id];
        System.assertEquals('Checked Out', res.Status__c);
    }

    @IsTest
    static void testGetReservationActivity() {
        Reservation__c res = [SELECT Id FROM Reservation__c LIMIT 1];
        Test.startTest();
        List<HMSReservationController.ActivityWrapper> activities = HMSReservationController.getReservationActivity(res.Id);
        Test.stopTest();
        System.assertNotEquals(null, activities);
    }

    @IsTest
    static void testAddReservationNote() {
        Reservation__c res = [SELECT Id FROM Reservation__c LIMIT 1];
        Test.startTest();
        HMSReservationController.addReservationNote(res.Id, 'Test note body');
        Test.stopTest();
        List<Task> tasks = [SELECT Id FROM Task WHERE WhatId = :res.Id];
        System.assertEquals(1, tasks.size());
    }
}
