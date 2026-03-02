public with sharing class HMSDashboardController {

    @AuraEnabled(cacheable=true)
    public static DashboardKPIWrapper getDashboardKPIs() {
        DashboardKPIWrapper kpi = new DashboardKPIWrapper();
        kpi.totalRooms = [SELECT COUNT() FROM Hotel_Room__c WHERE Is_Active__c = true];
        kpi.occupiedRooms = [SELECT COUNT() FROM Hotel_Room__c WHERE Is_Active__c = true AND Room_Status__c = 'Occupied'];
        kpi.arrivalsToday = [SELECT COUNT() FROM Reservation__c WHERE Check_In_Date__c = TODAY AND Status__c = 'Confirmed'];
        kpi.dueOutToday = [SELECT COUNT() FROM Reservation__c WHERE Check_Out_Date__c = TODAY AND Status__c = 'Checked In'];
        kpi.dirtyRooms = [SELECT COUNT() FROM Hotel_Room__c WHERE Is_Active__c = true AND Housekeeping_Status__c = 'Dirty'];
        kpi.occupancyPct = kpi.totalRooms > 0 ? Math.round((Decimal.valueOf(kpi.occupiedRooms) / kpi.totalRooms) * 100) : 0;

        // Revenue MTD
        AggregateResult[] revAr = [SELECT SUM(Total__c) rev FROM Reservation__c WHERE Check_In_Date__c >= THIS_MONTH AND Status__c IN ('Confirmed','Checked In','Checked Out','Completed')];
        kpi.revenueMTD = revAr[0].get('rev') != null ? (Decimal) revAr[0].get('rev') : 0;

        // ADR (Average Daily Rate)
        Integer paidNights = [SELECT COUNT() FROM Reservation__c WHERE Check_In_Date__c >= THIS_MONTH AND Status__c IN ('Confirmed','Checked In','Checked Out','Completed')];
        kpi.adr = paidNights > 0 ? (kpi.revenueMTD / paidNights).setScale(0) : 0;

        return kpi;
    }

    @AuraEnabled(cacheable=true)
    public static List<OccupancyDayWrapper> getOccupancyHistory(Integer days) {
        if (days == null || days <= 0) days = 10;
        List<OccupancyDayWrapper> result = new List<OccupancyDayWrapper>();
        Integer totalRooms = [SELECT COUNT() FROM Hotel_Room__c WHERE Is_Active__c = true];
        if (totalRooms == 0) return result;

        Date startDate = Date.today().addDays(-(days - 1));
        Map<Date, Integer> countMap = new Map<Date, Integer>();
        for (AggregateResult ar : [
            SELECT Check_In_Date__c dt, COUNT(Id) cnt
            FROM Reservation__c
            WHERE Status__c IN ('Confirmed', 'Checked In', 'Checked Out', 'Completed')
            AND Check_In_Date__c >= :startDate
            AND Check_In_Date__c <= TODAY
            GROUP BY Check_In_Date__c
        ]) {
            countMap.put((Date) ar.get('dt'), (Integer) ar.get('cnt'));
        }

        for (Integer i = 0; i < days; i++) {
            Date d = startDate.addDays(i);
            OccupancyDayWrapper dw = new OccupancyDayWrapper();
            dw.dayDate = d;
            dw.label = DateTime.newInstance(d, Time.newInstance(0,0,0,0)).format('MMM d');
            Integer cnt = countMap.containsKey(d) ? countMap.get(d) : 0;
            dw.occupied = cnt;
            dw.pct = Math.round((Decimal.valueOf(cnt) / totalRooms) * 100);
            result.add(dw);
        }
        return result;
    }

    @AuraEnabled(cacheable=true)
    public static RoomStatusBreakdownWrapper getRoomStatusBreakdown() {
        RoomStatusBreakdownWrapper w = new RoomStatusBreakdownWrapper();
        w.total = 0; w.vacant = 0; w.occupied = 0; w.blocked = 0; w.dirty = 0;
        for (AggregateResult ar : [
            SELECT Room_Status__c st, COUNT(Id) cnt
            FROM Hotel_Room__c WHERE Is_Active__c = true GROUP BY Room_Status__c
        ]) {
            String st = (String) ar.get('st');
            Integer cnt = (Integer) ar.get('cnt');
            w.total += cnt;
            if (st == 'Available') w.vacant += cnt;
            else if (st == 'Occupied') w.occupied += cnt;
            else if (st == 'Blocked') w.blocked += cnt;
        }
        w.dirty = [SELECT COUNT() FROM Hotel_Room__c WHERE Is_Active__c = true AND Housekeeping_Status__c = 'Dirty'];
        return w;
    }

    @AuraEnabled(cacheable=true)
    public static List<ReservationSummaryWrapper> getRecentReservations(Integer lim) {
        if (lim == null || lim <= 0) lim = 5;
        List<ReservationSummaryWrapper> result = new List<ReservationSummaryWrapper>();
        for (Reservation__c r : [
            SELECT Id, Guest_First_Name__c, Guest_Last_Name__c,
                   Room__r.Room_Number__c, Room__r.Category__c,
                   Check_In_Date__c, Check_Out_Date__c, Status__c, Total__c
            FROM Reservation__c
            ORDER BY CreatedDate DESC
            LIMIT :lim
        ]) {
            ReservationSummaryWrapper sw = new ReservationSummaryWrapper();
            sw.id = r.Id;
            sw.guestName = (r.Guest_First_Name__c != null ? r.Guest_First_Name__c : '') + ' ' + (r.Guest_Last_Name__c != null ? r.Guest_Last_Name__c : '');
            sw.guestName = sw.guestName.trim();
            sw.roomInfo = (r.Room__r.Room_Number__c != null ? r.Room__r.Room_Number__c : '') + ' · ' + (r.Room__r.Category__c != null ? r.Room__r.Category__c : '');
            sw.dates = formatDateRange(r.Check_In_Date__c, r.Check_Out_Date__c);
            sw.status = r.Status__c;
            sw.total = r.Total__c;
            result.add(sw);
        }
        return result;
    }

    @AuraEnabled(cacheable=true)
    public static List<OccupancyByTypeWrapper> getOccupancyByRoomType() {
        List<OccupancyByTypeWrapper> result = new List<OccupancyByTypeWrapper>();
        Map<String, Integer> totalMap = new Map<String, Integer>();
        Map<String, Integer> occMap = new Map<String, Integer>();

        for (AggregateResult ar : [
            SELECT Category__c cat, COUNT(Id) cnt
            FROM Hotel_Room__c WHERE Is_Active__c = true GROUP BY Category__c
        ]) {
            totalMap.put((String) ar.get('cat'), (Integer) ar.get('cnt'));
        }
        for (AggregateResult ar : [
            SELECT Category__c cat, COUNT(Id) cnt
            FROM Hotel_Room__c WHERE Is_Active__c = true AND Room_Status__c = 'Occupied' GROUP BY Category__c
        ]) {
            occMap.put((String) ar.get('cat'), (Integer) ar.get('cnt'));
        }

        String[] colors = new String[]{'#3b82f6','#6366f1','#10b981','#f59e0b','#ec4899','#8b5cf6'};
        Integer ci = 0;
        for (String cat : totalMap.keySet()) {
            OccupancyByTypeWrapper ow = new OccupancyByTypeWrapper();
            ow.category = cat;
            ow.total = totalMap.get(cat);
            ow.occupied = occMap.containsKey(cat) ? occMap.get(cat) : 0;
            ow.pct = ow.total > 0 ? Math.round((Decimal.valueOf(ow.occupied) / ow.total) * 100) : 0;
            ow.color = colors[Math.mod(ci, colors.size())];
            ci++;
            result.add(ow);
        }
        return result;
    }

    private static String formatDateRange(Date d1, Date d2) {
        if (d1 == null || d2 == null) return '';
        String s1 = DateTime.newInstance(d1, Time.newInstance(0,0,0,0)).format('MMM d');
        String s2 = DateTime.newInstance(d2, Time.newInstance(0,0,0,0)).format('d');
        return s1 + '–' + s2;
    }

    public class DashboardKPIWrapper {
        @AuraEnabled public Integer totalRooms;
        @AuraEnabled public Integer occupiedRooms;
        @AuraEnabled public Integer arrivalsToday;
        @AuraEnabled public Integer dueOutToday;
        @AuraEnabled public Integer dirtyRooms;
        @AuraEnabled public Integer occupancyPct;
        @AuraEnabled public Decimal revenueMTD;
        @AuraEnabled public Decimal adr;
    }

    public class OccupancyDayWrapper {
        @AuraEnabled public Date dayDate;
        @AuraEnabled public String label;
        @AuraEnabled public Integer occupied;
        @AuraEnabled public Integer pct;
    }

    public class RoomStatusBreakdownWrapper {
        @AuraEnabled public Integer total;
        @AuraEnabled public Integer vacant;
        @AuraEnabled public Integer occupied;
        @AuraEnabled public Integer blocked;
        @AuraEnabled public Integer dirty;
    }

    public class ReservationSummaryWrapper {
        @AuraEnabled public Id id;
        @AuraEnabled public String guestName;
        @AuraEnabled public String roomInfo;
        @AuraEnabled public String dates;
        @AuraEnabled public String status;
        @AuraEnabled public Decimal total;
    }

    public class OccupancyByTypeWrapper {
        @AuraEnabled public String category;
        @AuraEnabled public Integer total;
        @AuraEnabled public Integer occupied;
        @AuraEnabled public Integer pct;
        @AuraEnabled public String color;
    }
}
