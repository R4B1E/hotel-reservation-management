import { LightningElement, api } from 'lwc';
import { loadAzureTheme } from 'c/azureThemeLoader';
// TODO: Wire to Apex — load confirmation details from Reservation__c
// After checkout, navigate here with confirmationNumber in page state.
// import getReservationByConfirmation from '@salesforce/apex/ReservationController.getReservationByConfirmation';
// Usage: @wire(getReservationByConfirmation, { confirmationNumber: '$confirmationNumber' })

export default class AzureConfirmation extends LightningElement {

    connectedCallback() {
        loadAzureTheme(this);
    }
    @api confirmationNumber = 'AZR-20241024-001';
    @api guestEmail = 'guest@example.com';
    @api roomName = 'Aegean Suite';
    @api checkIn = new Date();
    @api checkOut = new Date(Date.now() + 4 * 86400000);
    @api guestCount = '2 Adults';

    get checkInDisplay() { return this.formatDate(this.checkIn); }
    get checkOutDisplay() { return this.formatDate(this.checkOut); }

    formatDate(d) {
        const date = d instanceof Date ? d : new Date(d);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
    }

    handleViewReservations() {
        this.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'my-reservations' }, bubbles: true, composed: true }));
    }

    handleHome() {
        this.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'home' }, bubbles: true, composed: true }));
    }
}
