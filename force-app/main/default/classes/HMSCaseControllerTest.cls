@IsTest
private class HMSCaseControllerTest {

    @TestSetup
    static void setup() {
        Contact c = new Contact(FirstName = 'Case', LastName = 'Guest', Email = 'case@test.com');
        insert c;
        insert new Case(
            Subject = 'AC not working', Status = 'New', Priority = 'High',
            Type = 'Mechanical', ContactId = c.Id, Origin = 'Hotel Console'
        );
    }

    @IsTest
    static void testGetCasesByStatus() {
        Test.startTest();
        Map<String, List<HMSCaseController.CaseCardWrapper>> result = HMSCaseController.getCasesByStatus();
        Test.stopTest();
        System.assert(!result.get('New').isEmpty());
    }

    @IsTest
    static void testGetCasesList() {
        Test.startTest();
        List<HMSCaseController.CaseCardWrapper> result = HMSCaseController.getCasesList(null, null);
        Test.stopTest();
        System.assert(!result.isEmpty());
    }

    @IsTest
    static void testGetCasesListWithFilters() {
        Test.startTest();
        List<HMSCaseController.CaseCardWrapper> result = HMSCaseController.getCasesList('AC', 'New');
        Test.stopTest();
        System.assert(!result.isEmpty());
    }

    @IsTest
    static void testGetCaseStats() {
        Test.startTest();
        HMSCaseController.CaseStatsWrapper stats = HMSCaseController.getCaseStats();
        Test.stopTest();
        System.assert(stats.total >= 1);
    }

    @IsTest
    static void testCreateCase() {
        Contact c = [SELECT Id FROM Contact LIMIT 1];
        Test.startTest();
        Id newId = HMSCaseController.createCase('Test case', 'Description', 'Medium', 'Mechanical', c.Id);
        Test.stopTest();
        System.assertNotEquals(null, newId);
    }

    @IsTest
    static void testUpdateCaseStatus() {
        Case cs = [SELECT Id FROM Case LIMIT 1];
        Test.startTest();
        HMSCaseController.updateCaseStatus(cs.Id, 'Working');
        Test.stopTest();
        cs = [SELECT Status FROM Case WHERE Id = :cs.Id];
        System.assertEquals('Working', cs.Status);
    }
}
