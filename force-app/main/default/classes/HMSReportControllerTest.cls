@IsTest
private class HMSReportControllerTest {

    @IsTest
    static void testGetReportCards() {
        Test.startTest();
        List<HMSReportController.ReportCardWrapper> cards = HMSReportController.getReportCards();
        Test.stopTest();
        System.assertEquals(9, cards.size());
        System.assertEquals('Occupancy Report', cards[0].name);
    }

    @IsTest
    static void testGetReportIdByDevName() {
        Test.startTest();
        Id reportId = HMSReportController.getReportIdByDevName('NonExistent_Report_XYZ');
        Test.stopTest();
        System.assertEquals(null, reportId);
    }
}
