import { LightningElement, track } from 'lwc';
import { loadAzureTheme } from 'c/azureThemeLoader';
// TODO: Wire to Apex — replace hardcoded guest with live Contact data
// import getGuestProfile from '@salesforce/apex/GuestProfileController.getGuestProfile';
// import updateGuestProfile from '@salesforce/apex/GuestProfileController.updateGuestProfile';
// Usage: @wire(getGuestProfile) wiredProfile({ data, error }) { ... }
// Usage (imperative): updateGuestProfile({ firstName, lastName, phone, country }) for handleSave

export default class AzureGuestProfile extends LightningElement {

    connectedCallback() {
        loadAzureTheme(this);
    }
    @track guest = {
        firstName: 'Elena',
        lastName: 'Vassilou',
        tier: 'Platinum Guest',
        totalNights: 28,
        totalStays: 7,
        memberYear: 2018,
        preferences: ['Sea View', 'Private Pool', 'Early Check-in', 'Vegan Menu']
    };

    @track formData = {};

    get initials() { return `${this.guest.firstName?.[0] || ''}${this.guest.lastName?.[0] || ''}`; }
    get memberSince() { return this.guest.memberYear; }

    handleFormChange(event) { this.formData = event.detail; }

    handleSave() {
        this.dispatchEvent(new CustomEvent('showtoast', {
            detail: { type: 'success', message: 'Profile updated successfully.' },
            bubbles: true, composed: true
        }));
    }
}
