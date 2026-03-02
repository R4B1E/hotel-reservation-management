public with sharing class HMSCalendarController {

    @AuraEnabled(cacheable=true)
    public static List<CalendarSectionWrapper> getRoomCalendarData(Date startDate, Date endDate) {
        if (startDate == null) startDate = Date.today();
        if (endDate == null) endDate = startDate.addDays(10);

        Map<String, List<Hotel_Room__c>> sectionMap = new Map<String, List<Hotel_Room__c>>();
        for (Hotel_Room__c r : [
            SELECT Id, Name, Room_Number__c, Category__c, View_Type__c
            FROM Hotel_Room__c WHERE Is_Active__c = true
            ORDER BY Category__c ASC, Room_Number__c ASC
        ]) {
            String cat = r.Category__c != null ? r.Category__c : 'Other';
            if (!sectionMap.containsKey(cat)) sectionMap.put(cat, new List<Hotel_Room__c>());
            sectionMap.get(cat).add(r);
        }

        Set<Id> roomIds = new Set<Id>();
        for (List<Hotel_Room__c> rooms : sectionMap.values()) {
            for (Hotel_Room__c r : rooms) roomIds.add(r.Id);
        }

        Map<Id, List<BookingWrapper>> bookingMap = new Map<Id, List<BookingWrapper>>();
        for (Reservation__c res : [
            SELECT Id, Room__c, Guest_First_Name__c, Guest_Last_Name__c,
                   Check_In_Date__c, Check_Out_Date__c, Status__c
            FROM Reservation__c
            WHERE Room__c IN :roomIds
            AND Status__c NOT IN ('Cancelled', 'No Show')
            AND Check_In_Date__c <= :endDate
            AND Check_Out_Date__c >= :startDate
            ORDER BY Check_In_Date__c ASC
        ]) {
            if (!bookingMap.containsKey(res.Room__c)) bookingMap.put(res.Room__c, new List<BookingWrapper>());
            BookingWrapper bw = new BookingWrapper();
            bw.id = res.Id;
            bw.guestName = ((res.Guest_First_Name__c != null ? res.Guest_First_Name__c : '') + ' ' + (res.Guest_Last_Name__c != null ? res.Guest_Last_Name__c : '')).trim();
            bw.checkIn = res.Check_In_Date__c;
            bw.checkOut = res.Check_Out_Date__c;
            bw.status = res.Status__c;
            bw.color = getBookingColor(res.Status__c);
            bw.startDay = startDate.daysBetween(res.Check_In_Date__c < startDate ? startDate : res.Check_In_Date__c);
            Date effectiveEnd = res.Check_Out_Date__c > endDate ? endDate : res.Check_Out_Date__c;
            Date effectiveStart = res.Check_In_Date__c < startDate ? startDate : res.Check_In_Date__c;
            bw.span = effectiveStart.daysBetween(effectiveEnd);
            if (bw.span < 1) bw.span = 1;
            bookingMap.get(res.Room__c).add(bw);
        }

        List<CalendarSectionWrapper> result = new List<CalendarSectionWrapper>();
        for (String cat : sectionMap.keySet()) {
            CalendarSectionWrapper sw = new CalendarSectionWrapper();
            sw.section = cat;
            sw.rooms = new List<CalendarRoomWrapper>();
            Integer vacantCount = 0;
            Integer occupiedCount = 0;
            for (Hotel_Room__c r : sectionMap.get(cat)) {
                CalendarRoomWrapper crw = new CalendarRoomWrapper();
                crw.id = r.Id;
                crw.roomNumber = r.Room_Number__c != null ? r.Room_Number__c : r.Name;
                crw.tags = new List<String>();
                if (r.View_Type__c != null) crw.tags.add(r.View_Type__c);
                crw.bookings = bookingMap.containsKey(r.Id) ? bookingMap.get(r.Id) : new List<BookingWrapper>();
                if (crw.bookings.isEmpty()) vacantCount++; else occupiedCount++;
                sw.rooms.add(crw);
            }
            sw.vacantCount = vacantCount;
            sw.occupiedCount = occupiedCount;
            result.add(sw);
        }
        return result;
    }

    @AuraEnabled(cacheable=true)
    public static CalendarStatsWrapper getCalendarStats() {
        CalendarStatsWrapper w = new CalendarStatsWrapper();
        w.total = [SELECT COUNT() FROM Hotel_Room__c WHERE Is_Active__c = true];
        w.vacant = [SELECT COUNT() FROM Hotel_Room__c WHERE Is_Active__c = true AND Room_Status__c = 'Available'];
        w.occupied = [SELECT COUNT() FROM Hotel_Room__c WHERE Is_Active__c = true AND Room_Status__c = 'Occupied'];
        w.blocked = [SELECT COUNT() FROM Hotel_Room__c WHERE Is_Active__c = true AND Room_Status__c = 'Blocked'];
        w.dueOut = [SELECT COUNT() FROM Reservation__c WHERE Check_Out_Date__c = TODAY AND Status__c = 'Checked In'];
        w.dirty = [SELECT COUNT() FROM Hotel_Room__c WHERE Is_Active__c = true AND Housekeeping_Status__c = 'Dirty'];
        return w;
    }

    private static String getBookingColor(String status) {
        if (status == 'Confirmed') return 'green';
        if (status == 'Pending') return 'orange';
        if (status == 'Checked In') return 'blue';
        if (status == 'Checked Out') return 'purple';
        return 'green';
    }

    public class CalendarSectionWrapper {
        @AuraEnabled public String section;
        @AuraEnabled public List<CalendarRoomWrapper> rooms;
        @AuraEnabled public Integer vacantCount;
        @AuraEnabled public Integer occupiedCount;
    }

    public class CalendarRoomWrapper {
        @AuraEnabled public Id id;
        @AuraEnabled public String roomNumber;
        @AuraEnabled public List<String> tags;
        @AuraEnabled public List<BookingWrapper> bookings;
    }

    public class BookingWrapper {
        @AuraEnabled public Id id;
        @AuraEnabled public String guestName;
        @AuraEnabled public Date checkIn;
        @AuraEnabled public Date checkOut;
        @AuraEnabled public String status;
        @AuraEnabled public String color;
        @AuraEnabled public Integer startDay;
        @AuraEnabled public Integer span;
    }

    public class CalendarStatsWrapper {
        @AuraEnabled public Integer total;
        @AuraEnabled public Integer vacant;
        @AuraEnabled public Integer occupied;
        @AuraEnabled public Integer blocked;
        @AuraEnabled public Integer dueOut;
        @AuraEnabled public Integer dirty;
    }
}
