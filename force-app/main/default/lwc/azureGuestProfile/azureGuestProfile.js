import { LightningElement, track, wire } from 'lwc';
import { loadAzureTheme } from 'c/azureThemeLoader';
import getGuestProfile from '@salesforce/apex/GuestProfileController.getGuestProfile';
import updateGuestProfile from '@salesforce/apex/GuestProfileController.updateGuestProfile';

export default class AzureGuestProfile extends LightningElement {

    @track guest = {};
    @track formData = {};
    @track isLoading = true;

    connectedCallback() {
        loadAzureTheme(this);
    }

    @wire(getGuestProfile)
    wiredProfile({ data, error }) {
        this.isLoading = false;
        if (data) {
            this.guest = {
                firstName: data.FirstName,
                lastName: data.LastName,
                tier: data.Guest_Tier__c || 'Guest',
                totalNights: data.Total_Nights__c || 0,
                totalStays: data.Total_Stays__c || 0,
                memberYear: data.Member_Since__c
                    ? new Date(data.Member_Since__c).getFullYear()
                    : new Date().getFullYear(),
                preferences: data.Guest_Preferences__c
                    ? data.Guest_Preferences__c.split(';')
                    : []
            };
        }
    }

    get initials() { return `${this.guest.firstName?.[0] || ''}${this.guest.lastName?.[0] || ''}`; }
    get memberSince() { return this.guest.memberYear; }

    handleFormChange(event) { this.formData = event.detail; }

    handleSave() {
        const { firstName, lastName, phone, country } = this.formData;
        updateGuestProfile({ firstName, lastName, phone, country })
            .then(() => {
                this.dispatchEvent(new CustomEvent('showtoast', {
                    detail: { type: 'success', message: 'Profile updated successfully.' },
                    bubbles: true, composed: true
                }));
            })
            .catch(err => {
                this.dispatchEvent(new CustomEvent('showtoast', {
                    detail: { type: 'error', message: err.body ? err.body.message : 'Unable to update profile.' },
                    bubbles: true, composed: true
                }));
            });
    }
}
