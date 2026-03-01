/**
 * @description Controller for Reservation operations in The Azure Experience Cloud site
 */
public with sharing class ReservationController {

    /**
     * @description Creates a new reservation record
     */
    @AuraEnabled
    public static String createReservation(
        Id roomId,
        Date checkIn,
        Date checkOut,
        Integer adults,
        Integer children,
        String guestFirstName,
        String guestLastName,
        String guestEmail,
        String guestPhone,
        String specialRequests
    ) {
        // Validate availability
        Integer conflicts = [
            SELECT COUNT()
            FROM Reservation__c
            WHERE Room__c = :roomId
            AND Status__c NOT IN ('Cancelled')
            AND (
                (Check_In_Date__c < :checkOut AND Check_Out_Date__c > :checkIn)
            )
        ];

        if (conflicts > 0) {
            throw new AuraHandledException('This room is not available for the selected dates. Please choose different dates.');
        }

        // Calculate pricing
        Hotel_Room__c room = [SELECT Price_Per_Night__c FROM Hotel_Room__c WHERE Id = :roomId LIMIT 1];
        Integer nights = checkIn.daysBetween(checkOut);
        Decimal subtotal = room.Price_Per_Night__c * nights;
        Decimal taxes = subtotal * 0.12;
        Decimal total = subtotal + taxes;

        // Link to logged-in user's Contact
        Id contactId = null;
        try {
            contactId = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1].ContactId;
        } catch (Exception e) {
            // Guest user may not have a Contact
        }

        // Create reservation
        Reservation__c res = new Reservation__c(
            Contact__c = contactId,
            Room__c = roomId,
            Check_In_Date__c = checkIn,
            Check_Out_Date__c = checkOut,
            Adults__c = adults,
            Children__c = children,
            Guest_First_Name__c = guestFirstName,
            Guest_Last_Name__c = guestLastName,
            Guest_Email__c = guestEmail,
            Guest_Phone__c = guestPhone,
            Special_Requests__c = specialRequests,
            Nights__c = nights,
            Room_Rate__c = room.Price_Per_Night__c,
            Subtotal__c = subtotal,
            Taxes__c = taxes,
            Total__c = total,
            Status__c = 'Confirmed',
            Confirmation_Number__c = generateConfirmationNumber()
        );

        insert res;
        return res.Confirmation_Number__c;
    }

    /**
     * @description Returns all reservations for the currently logged-in community user
     */
    @AuraEnabled(cacheable=true)
    public static List<Reservation__c> getMyReservations() {
        Id contactId = [
            SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1
        ].ContactId;

        return [
            SELECT Id, Name, Confirmation_Number__c, Room__r.Name, Room__r.Category__c,
                   Room__r.Primary_Image_URL__c, Check_In_Date__c, Check_Out_Date__c,
                   Nights__c, Adults__c, Children__c, Total__c, Status__c
            FROM Reservation__c
            WHERE Contact__c = :contactId
            ORDER BY Check_In_Date__c DESC
        ];
    }

    /**
     * @description Cancels a reservation by Id
     */
    @AuraEnabled
    public static void cancelReservation(Id reservationId) {
        Reservation__c res = [
            SELECT Id, Status__c, Check_In_Date__c
            FROM Reservation__c
            WHERE Id = :reservationId LIMIT 1
        ];

        // Only allow cancellation if check-in is more than 48 hours away
        if (res.Check_In_Date__c.addDays(-2) < Date.today()) {
            throw new AuraHandledException('Reservations cannot be cancelled within 48 hours of check-in.');
        }

        res.Status__c = 'Cancelled';
        update res;
    }

    /**
     * @description Returns a reservation by its confirmation number
     */
    @AuraEnabled(cacheable=true)
    public static Reservation__c getReservationByConfirmation(String confirmationNumber) {
        return [
            SELECT Id, Confirmation_Number__c, Room__r.Name, Room__r.Category__c,
                   Check_In_Date__c, Check_Out_Date__c, Adults__c, Children__c,
                   Guest_Email__c, Guest_First_Name__c, Total__c, Status__c
            FROM Reservation__c
            WHERE Confirmation_Number__c = :confirmationNumber
            LIMIT 1
        ];
    }

    private static String generateConfirmationNumber() {
        return 'AZR-' + String.valueOf(Date.today()).replace('-', '') + '-' +
               String.valueOf(Math.abs(Crypto.getRandomInteger())).substring(0, 3);
    }
}
