import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { loadAzureTheme } from 'c/azureThemeLoader';
import { refreshApex } from '@salesforce/apex';
import basePath from '@salesforce/community/basePath';
import getMyReservations from '@salesforce/apex/ReservationController.getMyReservations';
import cancelReservation from '@salesforce/apex/ReservationController.cancelReservation';

export default class AzureMyReservations extends NavigationMixin(LightningElement) {

    @track activeTab = 'upcoming';
    @track isLoading = true;
    @track reservations = [];
    @track error = null;
    _wiredResult;

    connectedCallback() {
        loadAzureTheme(this);
    }

    @wire(getMyReservations)
    wiredReservations(result) {
        this._wiredResult = result;
        this.isLoading = false;
        if (result.data) {
            this.reservations = result.data.map(r => ({
                id: r.Id,
                roomName: r.Room__r ? r.Room__r.Name : '',
                confirmationNumber: r.Confirmation_Number__c,
                status: r.Status__c === 'Confirmed' ? 'Upcoming' : r.Status__c,
                checkIn: r.Check_In_Date__c,
                checkOut: r.Check_Out_Date__c,
                nights: r.Nights__c,
                total: r.Total__c,
                imageUrl: (r.Room__r && r.Room__r.Primary_Image_URL__c) || ''
            }));
            this.error = null;
        } else if (result.error) {
            this.error = result.error;
            this.reservations = [];
        }
    }

    get upcomingTabClass() { return `tab-btn${this.activeTab === 'upcoming' ? ' tab-btn--active' : ''}`; }
    get pastTabClass() { return `tab-btn${this.activeTab === 'past' ? ' tab-btn--active' : ''}`; }

    get displayedReservations() {
        return this.reservations.filter(r =>
            this.activeTab === 'upcoming' ? r.status === 'Upcoming' : r.status !== 'Upcoming'
        );
    }

    get noReservations() { return this.displayedReservations.length === 0; }

    handleTab(event) { this.activeTab = event.currentTarget.dataset.tab; }

    handleModify(event) {
        console.log('Modify', event.detail.id);
    }

    handleCancel(event) {
        const reservationId = event.detail.id;
        cancelReservation({ reservationId })
            .then(() => refreshApex(this._wiredResult))
            .catch(err => {
                this.dispatchEvent(new CustomEvent('showtoast', {
                    detail: { type: 'error', message: err.body ? err.body.message : 'Unable to cancel reservation.' },
                    bubbles: true, composed: true
                }));
            });
    }

    handleRebook() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: { url: basePath + '/rooms' }
        });
    }
}
