/**
 * @description Controller for Guest Profile management
 */
public with sharing class GuestProfileController {

    /**
     * @description Returns the Contact record for the currently logged-in community user
     */
    @AuraEnabled(cacheable=true)
    public static Contact getGuestProfile() {
        Id userId = UserInfo.getUserId();
        User u = [SELECT ContactId FROM User WHERE Id = :userId LIMIT 1];

        return [
            SELECT Id, FirstName, LastName, Email, Phone, MailingCountry,
                   Guest_Tier__c, Member_Since__c, Total_Stays__c, Total_Nights__c,
                   Guest_Preferences__c
            FROM Contact
            WHERE Id = :u.ContactId
            LIMIT 1
        ];
    }

    /**
     * @description Updates the guest profile
     */
    @AuraEnabled
    public static void updateGuestProfile(
        String firstName,
        String lastName,
        String phone,
        String country
    ) {
        Id userId = UserInfo.getUserId();
        User u = [SELECT ContactId FROM User WHERE Id = :userId LIMIT 1];

        Contact c = new Contact(
            Id = u.ContactId,
            FirstName = firstName,
            LastName = lastName,
            Phone = phone,
            MailingCountry = country
        );
        update c;
    }
}
