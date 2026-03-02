public with sharing class HMSReservationController {

    @AuraEnabled(cacheable=true)
    public static ReservationListResult getReservations(String search, String filter, Integer lim, Integer offset) {
        if (lim == null || lim <= 0) lim = 50;
        if (offset == null || offset < 0) offset = 0;

        String query = 'SELECT Id, Name, Confirmation_Number__c, Guest_First_Name__c, Guest_Last_Name__c, ' +
                       'Guest_Email__c, Room__r.Room_Number__c, Room__r.Category__c, ' +
                       'Check_In_Date__c, Check_Out_Date__c, Status__c, Total__c, ' +
                       'Contact__r.VIP_Status__c, Booking_Source__c ' +
                       'FROM Reservation__c WHERE Id != null';

        if (String.isNotBlank(search)) {
            String s = '%' + String.escapeSingleQuotes(search) + '%';
            query += ' AND (Guest_First_Name__c LIKE :s OR Guest_Last_Name__c LIKE :s OR Confirmation_Number__c LIKE :s OR Room__r.Room_Number__c LIKE :s)';
        }
        if (filter == 'Arrivals') {
            query += ' AND Check_In_Date__c = TODAY AND Status__c = \'Confirmed\'';
        } else if (filter == 'Departures') {
            query += ' AND Check_Out_Date__c = TODAY AND Status__c = \'Checked In\'';
        } else if (filter == 'In-House') {
            query += ' AND Status__c = \'Checked In\'';
        }
        query += ' ORDER BY Check_In_Date__c DESC LIMIT :lim OFFSET :offset';

        ReservationListResult result = new ReservationListResult();
        result.reservations = new List<ReservationSummary>();
        result.totalCount = [SELECT COUNT() FROM Reservation__c];

        for (Reservation__c r : Database.query(query)) {
            result.reservations.add(wrapResSummary(r));
        }
        return result;
    }

    @AuraEnabled(cacheable=true)
    public static ReservationDetailWrapper getReservationDetail(Id resId) {
        Reservation__c r = [
            SELECT Id, Name, Confirmation_Number__c, Guest_First_Name__c, Guest_Last_Name__c,
                   Guest_Email__c, Guest_Phone__c, Room__c, Room__r.Room_Number__c, Room__r.Category__c,
                   Room__r.Floor__c, Room__r.Bed_Type__c, Room__r.View_Type__c,
                   Room__r.Square_Meters__c, Room__r.Price_Per_Night__c,
                   Room__r.Housekeeping_Status__c, Room__r.Last_Cleaned__c,
                   Room__r.Assigned_Housekeeper__r.Name,
                   Check_In_Date__c, Check_Out_Date__c, Actual_Check_In__c, Actual_Check_Out__c,
                   Adults__c, Children__c, Nights__c, Status__c,
                   Room_Rate__c, Subtotal__c, Taxes__c, Total__c,
                   Payment_Status__c, Booking_Source__c, Rate_Plan__c,
                   Special_Requests__c, Contact__c, Contact__r.VIP_Status__c,
                   Contact__r.Nationality__c, Contact__r.Name
            FROM Reservation__c WHERE Id = :resId LIMIT 1
        ];

        ReservationDetailWrapper w = new ReservationDetailWrapper();
        w.id = r.Id;
        w.name = r.Name;
        w.confirmationNumber = r.Confirmation_Number__c;
        w.guestFirstName = r.Guest_First_Name__c;
        w.guestLastName = r.Guest_Last_Name__c;
        w.guestFullName = ((r.Guest_First_Name__c != null ? r.Guest_First_Name__c : '') + ' ' + (r.Guest_Last_Name__c != null ? r.Guest_Last_Name__c : '')).trim();
        w.guestEmail = r.Guest_Email__c;
        w.guestPhone = r.Guest_Phone__c;
        w.isVip = r.Contact__r != null ? r.Contact__r.VIP_Status__c : false;
        w.nationality = r.Contact__r != null ? r.Contact__r.Nationality__c : null;
        w.roomId = r.Room__c;
        w.roomNumber = r.Room__r.Room_Number__c;
        w.roomCategory = r.Room__r.Category__c;
        w.roomFloor = r.Room__r.Floor__c != null ? Integer.valueOf(r.Room__r.Floor__c) : null;
        w.roomBedType = r.Room__r.Bed_Type__c;
        w.roomView = r.Room__r.View_Type__c;
        w.roomSqm = r.Room__r.Square_Meters__c;
        w.roomRate = r.Room__r.Price_Per_Night__c;
        w.hkStatus = r.Room__r.Housekeeping_Status__c;
        w.lastCleaned = r.Room__r.Last_Cleaned__c;
        w.housekeeper = r.Room__r.Assigned_Housekeeper__r != null ? r.Room__r.Assigned_Housekeeper__r.Name : null;
        w.checkInDate = r.Check_In_Date__c;
        w.checkOutDate = r.Check_Out_Date__c;
        w.actualCheckIn = r.Actual_Check_In__c;
        w.actualCheckOut = r.Actual_Check_Out__c;
        w.adults = r.Adults__c != null ? Integer.valueOf(r.Adults__c) : 0;
        w.children = r.Children__c != null ? Integer.valueOf(r.Children__c) : 0;
        w.nights = r.Nights__c != null ? Integer.valueOf(r.Nights__c) : 0;
        w.status = r.Status__c;
        w.roomRatePerNight = r.Room_Rate__c;
        w.subtotal = r.Subtotal__c;
        w.taxes = r.Taxes__c;
        w.total = r.Total__c;
        w.paymentStatus = r.Payment_Status__c;
        w.bookingSource = r.Booking_Source__c;
        w.ratePlan = r.Rate_Plan__c;
        w.specialRequests = r.Special_Requests__c;
        return w;
    }

    @AuraEnabled
    public static String createReservation(String jsonData) {
        Map<String, Object> data = (Map<String, Object>) JSON.deserializeUntyped(jsonData);
        Id roomId = (Id) data.get('roomId');
        Date checkIn = Date.valueOf((String) data.get('checkIn'));
        Date checkOut = Date.valueOf((String) data.get('checkOut'));

        Integer conflicts = [
            SELECT COUNT() FROM Reservation__c
            WHERE Room__c = :roomId AND Status__c NOT IN ('Cancelled', 'Checked Out', 'Completed', 'No Show')
            AND Check_In_Date__c < :checkOut AND Check_Out_Date__c > :checkIn
        ];
        if (conflicts > 0) {
            throw new AuraHandledException('Room not available for selected dates.');
        }

        Hotel_Room__c room = [SELECT Price_Per_Night__c FROM Hotel_Room__c WHERE Id = :roomId LIMIT 1];
        Integer nights = checkIn.daysBetween(checkOut);
        Decimal subtotal = room.Price_Per_Night__c * nights;
        Decimal taxes = subtotal * 0.12;

        Reservation__c res = new Reservation__c(
            Room__c = roomId,
            Check_In_Date__c = checkIn,
            Check_Out_Date__c = checkOut,
            Adults__c = data.containsKey('adults') ? Integer.valueOf(data.get('adults')) : 2,
            Children__c = data.containsKey('children') ? Integer.valueOf(data.get('children')) : 0,
            Guest_First_Name__c = (String) data.get('guestFirstName'),
            Guest_Last_Name__c = (String) data.get('guestLastName'),
            Guest_Email__c = (String) data.get('guestEmail'),
            Guest_Phone__c = (String) data.get('guestPhone'),
            Special_Requests__c = (String) data.get('specialRequests'),
            Booking_Source__c = (String) data.get('bookingSource'),
            Rate_Plan__c = (String) data.get('ratePlan'),
            Nights__c = nights,
            Room_Rate__c = room.Price_Per_Night__c,
            Subtotal__c = subtotal,
            Taxes__c = taxes,
            Total__c = subtotal + taxes,
            Status__c = 'Confirmed',
            Payment_Status__c = 'Pending',
            Confirmation_Number__c = 'HMS-' + String.valueOf(Date.today()).replace('-', '') + '-' + String.valueOf(Math.abs(Crypto.getRandomInteger())).substring(0, 4)
        );
        insert res;
        return res.Confirmation_Number__c;
    }

    @AuraEnabled
    public static void checkInGuest(Id resId) {
        Reservation__c res = [SELECT Id, Status__c, Room__c FROM Reservation__c WHERE Id = :resId LIMIT 1];
        if (res.Status__c != 'Confirmed') {
            throw new AuraHandledException('Only confirmed reservations can be checked in.');
        }
        res.Status__c = 'Checked In';
        res.Actual_Check_In__c = DateTime.now();
        update res;

        Hotel_Room__c room = [SELECT Id FROM Hotel_Room__c WHERE Id = :res.Room__c LIMIT 1];
        room.Room_Status__c = 'Occupied';
        room.Current_Reservation__c = res.Id;
        update room;
    }

    @AuraEnabled
    public static void checkOutGuest(Id resId) {
        Reservation__c res = [SELECT Id, Status__c, Room__c FROM Reservation__c WHERE Id = :resId LIMIT 1];
        if (res.Status__c != 'Checked In') {
            throw new AuraHandledException('Only checked-in reservations can be checked out.');
        }
        res.Status__c = 'Checked Out';
        res.Actual_Check_Out__c = DateTime.now();
        update res;

        Hotel_Room__c room = [SELECT Id FROM Hotel_Room__c WHERE Id = :res.Room__c LIMIT 1];
        room.Room_Status__c = 'Available';
        room.Housekeeping_Status__c = 'Dirty';
        room.Current_Reservation__c = null;
        update room;
    }

    @AuraEnabled(cacheable=true)
    public static List<ActivityWrapper> getReservationActivity(Id resId) {
        List<ActivityWrapper> result = new List<ActivityWrapper>();
        for (Task t : [
            SELECT Id, Subject, Description, CreatedDate, CreatedBy.Name
            FROM Task WHERE WhatId = :resId ORDER BY CreatedDate DESC LIMIT 20
        ]) {
            ActivityWrapper a = new ActivityWrapper();
            a.id = t.Id;
            a.author = t.CreatedBy.Name;
            a.timestamp = t.CreatedDate;
            a.text = t.Description != null ? t.Description : t.Subject;
            a.initials = getInitials(t.CreatedBy.Name);
            result.add(a);
        }
        return result;
    }

    @AuraEnabled
    public static void addReservationNote(Id resId, String body) {
        Task t = new Task(
            WhatId = resId,
            Subject = 'Reservation Note',
            Description = body,
            Status = 'Completed',
            Priority = 'Normal',
            ActivityDate = Date.today()
        );
        insert t;
    }

    private static ReservationSummary wrapResSummary(Reservation__c r) {
        ReservationSummary s = new ReservationSummary();
        s.id = r.Id;
        s.confirmationNumber = r.Confirmation_Number__c;
        s.guestName = ((r.Guest_First_Name__c != null ? r.Guest_First_Name__c : '') + ' ' + (r.Guest_Last_Name__c != null ? r.Guest_Last_Name__c : '')).trim();
        s.roomInfo = (r.Room__r.Room_Number__c != null ? r.Room__r.Room_Number__c : '') + ' · ' + (r.Room__r.Category__c != null ? r.Room__r.Category__c : '');
        s.dates = formatDateRange(r.Check_In_Date__c, r.Check_Out_Date__c);
        s.status = r.Status__c;
        s.total = r.Total__c;
        s.isVip = r.Contact__r != null ? r.Contact__r.VIP_Status__c : false;
        s.initials = getInitials(s.guestName);
        return s;
    }

    private static String formatDateRange(Date d1, Date d2) {
        if (d1 == null || d2 == null) return '';
        return DateTime.newInstance(d1, Time.newInstance(0,0,0,0)).format('MMM d') + '–' +
               DateTime.newInstance(d2, Time.newInstance(0,0,0,0)).format('d');
    }

    private static String getInitials(String name) {
        if (String.isBlank(name)) return '?';
        String[] parts = name.trim().split('\\s+');
        String result = '';
        for (String p : parts) {
            if (String.isNotBlank(p)) result += p.substring(0, 1).toUpperCase();
        }
        return result.length() > 2 ? result.substring(0, 2) : result;
    }

    public class ReservationListResult {
        @AuraEnabled public List<ReservationSummary> reservations;
        @AuraEnabled public Integer totalCount;
    }

    public class ReservationSummary {
        @AuraEnabled public Id id;
        @AuraEnabled public String confirmationNumber;
        @AuraEnabled public String guestName;
        @AuraEnabled public String roomInfo;
        @AuraEnabled public String dates;
        @AuraEnabled public String status;
        @AuraEnabled public Decimal total;
        @AuraEnabled public Boolean isVip;
        @AuraEnabled public String initials;
    }

    public class ReservationDetailWrapper {
        @AuraEnabled public Id id;
        @AuraEnabled public String name;
        @AuraEnabled public String confirmationNumber;
        @AuraEnabled public String guestFirstName;
        @AuraEnabled public String guestLastName;
        @AuraEnabled public String guestFullName;
        @AuraEnabled public String guestEmail;
        @AuraEnabled public String guestPhone;
        @AuraEnabled public Boolean isVip;
        @AuraEnabled public String nationality;
        @AuraEnabled public Id roomId;
        @AuraEnabled public String roomNumber;
        @AuraEnabled public String roomCategory;
        @AuraEnabled public Integer roomFloor;
        @AuraEnabled public String roomBedType;
        @AuraEnabled public String roomView;
        @AuraEnabled public Decimal roomSqm;
        @AuraEnabled public Decimal roomRate;
        @AuraEnabled public String hkStatus;
        @AuraEnabled public DateTime lastCleaned;
        @AuraEnabled public String housekeeper;
        @AuraEnabled public Date checkInDate;
        @AuraEnabled public Date checkOutDate;
        @AuraEnabled public DateTime actualCheckIn;
        @AuraEnabled public DateTime actualCheckOut;
        @AuraEnabled public Integer adults;
        @AuraEnabled public Integer children;
        @AuraEnabled public Integer nights;
        @AuraEnabled public String status;
        @AuraEnabled public Decimal roomRatePerNight;
        @AuraEnabled public Decimal subtotal;
        @AuraEnabled public Decimal taxes;
        @AuraEnabled public Decimal total;
        @AuraEnabled public String paymentStatus;
        @AuraEnabled public String bookingSource;
        @AuraEnabled public String ratePlan;
        @AuraEnabled public String specialRequests;
    }

    public class ActivityWrapper {
        @AuraEnabled public Id id;
        @AuraEnabled public String author;
        @AuraEnabled public DateTime timestamp;
        @AuraEnabled public String text;
        @AuraEnabled public String initials;
    }
}
