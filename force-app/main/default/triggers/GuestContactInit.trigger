/**
 * @description Initializes custom guest fields when a Contact is created
 *              as part of a Person Account during self-registration.
 */
trigger GuestContactInit on Contact (before insert) {
    for (Contact c : Trigger.new) {
        // Only set defaults if the fields are blank (i.e., new registration)
        if (c.Guest_Tier__c == null) {
            c.Guest_Tier__c = 'Guest';
        }
        if (c.Member_Since__c == null) {
            c.Member_Since__c = Date.today();
        }
        if (c.Total_Stays__c == null) {
            c.Total_Stays__c = 0;
        }
        if (c.Total_Nights__c == null) {
            c.Total_Nights__c = 0;
        }
    }
}
