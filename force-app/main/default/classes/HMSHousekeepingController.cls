public with sharing class HMSHousekeepingController {

    @AuraEnabled(cacheable=true)
    public static List<StaffOnDutyWrapper> getStaffOnDuty() {
        List<StaffOnDutyWrapper> result = new List<StaffOnDutyWrapper>();
        String[] colors = new String[]{'#ec4899','#3b82f6','#10b981','#f59e0b','#8b5cf6'};
        Integer ci = 0;

        // Get total tasks per staff
        Map<Id, StaffOnDutyWrapper> staffMap = new Map<Id, StaffOnDutyWrapper>();
        for (AggregateResult ar : [
            SELECT Assigned_To__c uid, Assigned_To__r.Name uname, COUNT(Id) total
            FROM Housekeeping_Task__c
            WHERE Assigned_To__c != null AND Due_Date__c = TODAY
            GROUP BY Assigned_To__c, Assigned_To__r.Name
        ]) {
            StaffOnDutyWrapper w = new StaffOnDutyWrapper();
            w.userId = (Id) ar.get('uid');
            w.name = (String) ar.get('uname');
            w.totalTasks = (Integer) ar.get('total');
            w.completedTasks = 0;
            staffMap.put(w.userId, w);
        }

        // Get completed tasks per staff
        for (AggregateResult ar : [
            SELECT Assigned_To__c uid, COUNT(Id) done
            FROM Housekeeping_Task__c
            WHERE Assigned_To__c != null AND Due_Date__c = TODAY AND Status__c = 'Completed'
            GROUP BY Assigned_To__c
        ]) {
            Id uid = (Id) ar.get('uid');
            if (staffMap.containsKey(uid)) {
                staffMap.get(uid).completedTasks = (Integer) ar.get('done');
            }
        }

        for (StaffOnDutyWrapper w : staffMap.values()) {
            w.pct = w.totalTasks > 0 ? Math.round((Decimal.valueOf(w.completedTasks) / w.totalTasks) * 100) : 0;
            w.color = colors[Math.mod(ci, colors.size())];
            w.initials = getInitials(w.name);
            w.avatarStyle = 'background-color: ' + w.color + ';';
            w.progressStyle = 'width: ' + w.pct + '%; background-color: ' + w.color + ';';
            ci++;
            result.add(w);
        }
        return result;
    }

    @AuraEnabled(cacheable=true)
    public static List<HKRoomWrapper> getHousekeepingRooms(String status, String staff, String floor) {
        String query = 'SELECT Id, Room_Number__c, Category__c, Floor__c, ' +
                       'Housekeeping_Status__c, Room_Status__c, Last_Cleaned__c, ' +
                       'Assigned_Housekeeper__c, Assigned_Housekeeper__r.Name ' +
                       'FROM Hotel_Room__c WHERE Is_Active__c = true';

        if (String.isNotBlank(status) && status != 'All') {
            query += ' AND Housekeeping_Status__c = :status';
        }
        if (String.isNotBlank(staff) && staff != 'All') {
            Id staffId = Id.valueOf(staff);
            query += ' AND Assigned_Housekeeper__c = :staffId';
        }
        if (String.isNotBlank(floor) && floor != 'All') {
            Integer floorNum = Integer.valueOf(floor);
            query += ' AND Floor__c = :floorNum';
        }
        query += ' ORDER BY Floor__c ASC NULLS LAST, Room_Number__c ASC';

        List<HKRoomWrapper> result = new List<HKRoomWrapper>();
        for (Hotel_Room__c r : Database.query(query)) {
            HKRoomWrapper w = new HKRoomWrapper();
            w.id = r.Id;
            w.roomNumber = r.Room_Number__c;
            w.category = r.Category__c;
            w.floor = r.Floor__c != null ? Integer.valueOf(r.Floor__c) : null;
            w.hkStatus = r.Housekeeping_Status__c;
            w.roomStatus = r.Room_Status__c;
            w.lastCleaned = r.Last_Cleaned__c;
            w.assigneeName = r.Assigned_Housekeeper__r != null ? r.Assigned_Housekeeper__r.Name : 'Unassigned';
            w.isPriority = r.Room_Status__c == 'Occupied' && r.Housekeeping_Status__c == 'Dirty';
            w.isDirty = r.Housekeeping_Status__c == 'Dirty';
            w.isInProgress = r.Housekeeping_Status__c == 'In Progress';
            result.add(w);
        }
        return result;
    }

    @AuraEnabled(cacheable=true)
    public static HKStatsWrapper getHousekeepingStats() {
        HKStatsWrapper w = new HKStatsWrapper();
        w.dirty = [SELECT COUNT() FROM Hotel_Room__c WHERE Is_Active__c = true AND Housekeeping_Status__c = 'Dirty'];
        w.clean = [SELECT COUNT() FROM Hotel_Room__c WHERE Is_Active__c = true AND Housekeeping_Status__c = 'Clean'];
        w.inProgress = [SELECT COUNT() FROM Hotel_Room__c WHERE Is_Active__c = true AND Housekeeping_Status__c = 'In Progress'];
        w.inspecting = [SELECT COUNT() FROM Hotel_Room__c WHERE Is_Active__c = true AND Housekeeping_Status__c = 'Inspecting'];
        w.maintenance = [SELECT COUNT() FROM Hotel_Room__c WHERE Is_Active__c = true AND Housekeeping_Status__c = 'Maintenance'];
        return w;
    }

    @AuraEnabled
    public static void updateHousekeepingStatus(Id roomId, String status) {
        Hotel_Room__c room = [SELECT Id FROM Hotel_Room__c WHERE Id = :roomId LIMIT 1];
        room.Housekeeping_Status__c = status;
        if (status == 'Clean') room.Last_Cleaned__c = DateTime.now();
        update room;
    }

    @AuraEnabled
    public static void assignStaff(Id roomId, Id userId) {
        Hotel_Room__c room = [SELECT Id FROM Hotel_Room__c WHERE Id = :roomId LIMIT 1];
        room.Assigned_Housekeeper__c = userId;
        update room;
    }

    @AuraEnabled
    public static Id createHousekeepingTask(Id roomId, Id assignedTo, String taskType, String priority, String notes) {
        Housekeeping_Task__c t = new Housekeeping_Task__c(
            Room__c = roomId,
            Assigned_To__c = assignedTo,
            Task_Type__c = taskType,
            Priority__c = priority != null ? priority : 'Normal',
            Notes__c = notes,
            Status__c = 'Pending',
            Due_Date__c = Date.today()
        );
        insert t;
        return t.Id;
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

    public class StaffOnDutyWrapper {
        @AuraEnabled public Id userId;
        @AuraEnabled public String name;
        @AuraEnabled public Integer totalTasks;
        @AuraEnabled public Integer completedTasks;
        @AuraEnabled public Integer pct;
        @AuraEnabled public String color;
        @AuraEnabled public String initials;
        @AuraEnabled public String avatarStyle;
        @AuraEnabled public String progressStyle;
    }

    public class HKRoomWrapper {
        @AuraEnabled public Id id;
        @AuraEnabled public String roomNumber;
        @AuraEnabled public String category;
        @AuraEnabled public Integer floor;
        @AuraEnabled public String hkStatus;
        @AuraEnabled public String roomStatus;
        @AuraEnabled public DateTime lastCleaned;
        @AuraEnabled public String assigneeName;
        @AuraEnabled public Boolean isPriority;
        @AuraEnabled public Boolean isDirty;
        @AuraEnabled public Boolean isInProgress;
    }

    public class HKStatsWrapper {
        @AuraEnabled public Integer dirty;
        @AuraEnabled public Integer clean;
        @AuraEnabled public Integer inProgress;
        @AuraEnabled public Integer inspecting;
        @AuraEnabled public Integer maintenance;
    }
}
