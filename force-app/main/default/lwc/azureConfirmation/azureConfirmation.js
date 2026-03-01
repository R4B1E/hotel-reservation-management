import { LightningElement, track, wire } from 'lwc';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import { loadAzureTheme } from 'c/azureThemeLoader';
import basePath from '@salesforce/community/basePath';
import getReservationByConfirmation from '@salesforce/apex/ReservationController.getReservationByConfirmation';

export default class AzureConfirmation extends NavigationMixin(LightningElement) {

    @track confirmationNumber;
    @track reservation = {};
    @track isLoading = true;

    connectedCallback() {
        loadAzureTheme(this);
    }

    @wire(CurrentPageReference)
    handlePageRef(pageRef) {
        if (pageRef?.state?.confirmationNumber) {
            this.confirmationNumber = pageRef.state.confirmationNumber;
        }
    }

    @wire(getReservationByConfirmation, { confirmationNumber: '$confirmationNumber' })
    wiredReservation({ data, error }) {
        if (data) {
            this.reservation = data;
            this.isLoading = false;
        } else if (error) {
            this.isLoading = false;
        }
    }

    get guestEmail() { return this.reservation.Guest_Email__c || ''; }
    get roomName() { return this.reservation.Room__r ? this.reservation.Room__r.Name : ''; }
    get checkIn() { return this.reservation.Check_In_Date__c; }
    get checkOut() { return this.reservation.Check_Out_Date__c; }

    get guestCount() {
        const adults = this.reservation.Adults__c || 0;
        const children = this.reservation.Children__c || 0;
        let label = `${adults} Adult${adults !== 1 ? 's' : ''}`;
        if (children) label += `, ${children} Child${children !== 1 ? 'ren' : ''}`;
        return label;
    }

    get checkInDisplay() { return this.formatDate(this.checkIn); }
    get checkOutDisplay() { return this.formatDate(this.checkOut); }

    formatDate(d) {
        if (!d) return '';
        const date = d instanceof Date ? d : new Date(d);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
    }

    handleViewReservations() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: { url: basePath + '/my-reservations' }
        });
    }

    handleHome() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: { url: basePath + '/' }
        });
    }
}
