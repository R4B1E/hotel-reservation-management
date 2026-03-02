public with sharing class HMSReportController {

    @AuraEnabled(cacheable=true)
    public static List<ReportCardWrapper> getReportCards() {
        List<ReportCardWrapper> cards = new List<ReportCardWrapper>();

        cards.add(buildCard('Occupancy Report', 'Daily, weekly, monthly room occupancy rates and trends across all room types.', '#3b82f6', 'standard:dashboard'));
        cards.add(buildCard('Revenue Summary', 'Total revenue breakdown by room type, rate plan, and booking source.', '#10b981', 'standard:report'));
        cards.add(buildCard('Guest Analytics', 'Guest demographics, nationality breakdown, repeat visitor rates and spend.', '#ec4899', 'standard:people'));
        cards.add(buildCard('Room Performance', 'Revenue per available room (RevPAR), average daily rate (ADR) and occupancy.', '#8b5cf6', 'standard:home'));
        cards.add(buildCard('Housekeeping Log', 'Room cleaning status, turnaround times and housekeeper performance.', '#f59e0b', 'standard:task'));
        cards.add(buildCard('Arrival / Departure', 'Daily arrivals and departures forecast for the next 30 days.', '#06b6d4', 'standard:event'));
        cards.add(buildCard('Payment Report', 'Payments received, outstanding balances, and method breakdown.', '#f97316', 'standard:currency'));
        cards.add(buildCard('VIP & Loyalty Report', 'VIP guest frequency, total spend, and loyalty tier progression.', '#fbbf24', 'standard:reward'));
        cards.add(buildCard('Booking Channels', 'Reservations and revenue split by OTA, direct, walk-in, and corporate.', '#34d399', 'standard:channel_programs'));

        return cards;
    }

    @AuraEnabled
    public static Id getReportIdByDevName(String devName) {
        List<Report> reports = [SELECT Id FROM Report WHERE DeveloperName = :devName LIMIT 1];
        return reports.isEmpty() ? null : reports[0].Id;
    }

    private static ReportCardWrapper buildCard(String name, String description, String color, String icon) {
        ReportCardWrapper c = new ReportCardWrapper();
        c.name = name;
        c.description = description;
        c.color = color;
        c.icon = icon;
        c.lastRun = 'N/A';
        return c;
    }

    public class ReportCardWrapper {
        @AuraEnabled public String name;
        @AuraEnabled public String description;
        @AuraEnabled public String color;
        @AuraEnabled public String icon;
        @AuraEnabled public String lastRun;
    }
}
