public with sharing class HMSCaseController {

    @AuraEnabled(cacheable=true)
    public static Map<String, List<CaseCardWrapper>> getCasesByStatus() {
        Map<String, List<CaseCardWrapper>> result = new Map<String, List<CaseCardWrapper>>();
        result.put('New', new List<CaseCardWrapper>());
        result.put('Working', new List<CaseCardWrapper>());
        result.put('Escalated', new List<CaseCardWrapper>());
        result.put('Closed', new List<CaseCardWrapper>());

        for (Case c : [
            SELECT Id, CaseNumber, Subject, Status, Priority, Type, Reason,
                   Contact.Name, Contact.VIP_Status__c, Description,
                   Owner.Name, CreatedDate
            FROM Case
            ORDER BY CreatedDate DESC
            LIMIT 200
        ]) {
            CaseCardWrapper w = wrapCase(c);
            String bucket = c.Status;
            if (!result.containsKey(bucket)) result.put(bucket, new List<CaseCardWrapper>());
            result.get(bucket).add(w);
        }
        return result;
    }

    @AuraEnabled(cacheable=true)
    public static List<CaseCardWrapper> getCasesList(String search, String filter) {
        String query = 'SELECT Id, CaseNumber, Subject, Status, Priority, Type, Reason, ' +
                       'Contact.Name, Contact.VIP_Status__c, Description, ' +
                       'Owner.Name, CreatedDate ' +
                       'FROM Case WHERE Id != null';
        if (String.isNotBlank(search)) {
            String s = '%' + String.escapeSingleQuotes(search) + '%';
            query += ' AND (Subject LIKE :s OR CaseNumber LIKE :s OR Contact.Name LIKE :s)';
        }
        if (String.isNotBlank(filter) && filter != 'All') {
            query += ' AND Status = :filter';
        }
        query += ' ORDER BY CreatedDate DESC LIMIT 200';

        List<CaseCardWrapper> result = new List<CaseCardWrapper>();
        for (Case c : Database.query(query)) {
            result.add(wrapCase(c));
        }
        return result;
    }

    @AuraEnabled(cacheable=true)
    public static CaseStatsWrapper getCaseStats() {
        CaseStatsWrapper w = new CaseStatsWrapper();
        w.open = 0; w.working = 0; w.escalated = 0; w.closed = 0;
        for (AggregateResult ar : [
            SELECT Status st, COUNT(Id) cnt FROM Case GROUP BY Status
        ]) {
            String st = (String) ar.get('st');
            Integer cnt = (Integer) ar.get('cnt');
            if (st == 'New') w.open += cnt;
            else if (st == 'Working') w.working += cnt;
            else if (st == 'Escalated') w.escalated += cnt;
            else if (st == 'Closed') w.closed += cnt;
        }
        w.total = w.open + w.working + w.escalated + w.closed;
        return w;
    }

    @AuraEnabled
    public static Id createCase(String subject, String description, String priority, String caseType, Id contactId) {
        Case c = new Case(
            Subject = subject,
            Description = description,
            Priority = priority,
            Type = caseType,
            ContactId = contactId,
            Status = 'New',
            Origin = 'Hotel Console'
        );
        insert c;
        return c.Id;
    }

    @AuraEnabled
    public static void updateCaseStatus(Id caseId, String status) {
        Case c = [SELECT Id FROM Case WHERE Id = :caseId LIMIT 1];
        c.Status = status;
        update c;
    }

    private static CaseCardWrapper wrapCase(Case c) {
        CaseCardWrapper w = new CaseCardWrapper();
        w.id = c.Id;
        w.caseNumber = c.CaseNumber;
        w.subject = c.Subject;
        w.status = c.Status;
        w.priority = c.Priority;
        w.caseType = c.Type;
        w.reason = c.Reason;
        w.contactName = c.Contact != null ? c.Contact.Name : null;
        w.isVipGuest = c.Contact != null ? c.Contact.VIP_Status__c : false;
        w.ownerName = c.Owner != null ? c.Owner.Name : null;
        w.createdDate = c.CreatedDate;
        w.initials = getInitials(w.ownerName);
        return w;
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

    public class CaseCardWrapper {
        @AuraEnabled public Id id;
        @AuraEnabled public String caseNumber;
        @AuraEnabled public String subject;
        @AuraEnabled public String status;
        @AuraEnabled public String priority;
        @AuraEnabled public String caseType;
        @AuraEnabled public String reason;
        @AuraEnabled public String contactName;
        @AuraEnabled public Boolean isVipGuest;
        @AuraEnabled public String ownerName;
        @AuraEnabled public DateTime createdDate;
        @AuraEnabled public String initials;
    }

    public class CaseStatsWrapper {
        @AuraEnabled public Integer total;
        @AuraEnabled public Integer open;
        @AuraEnabled public Integer working;
        @AuraEnabled public Integer escalated;
        @AuraEnabled public Integer closed;
    }
}
