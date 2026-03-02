import { LightningElement, wire, track } from 'lwc';
import { loadHmsTheme } from 'c/hmsThemeLoader';
import { NavigationMixin } from 'lightning/navigation';
import getGuests from '@salesforce/apex/HMSGuestController.getGuests';

export default class HmsGuests extends NavigationMixin(LightningElement) {
    @track guests = [];
    searchTerm = '';
    typeFilter = 'All';
    isLoading = true;

    connectedCallback() {
        loadHmsTheme(this);
    }

    @wire(getGuests, { search: '$searchTerm', typeFilter: '$typeFilter', lim: 50, offset: 0 })
    wiredGuests({ data, error }) {
        if (data) {
            this.guests = (data.guests || []).map(g => ({
                ...g,
                formattedSpent: g.totalSpent != null ? '$' + Number(g.totalSpent).toLocaleString('en-US', { minimumFractionDigits: 0 }) : '$0',
                stays: g.stays != null ? g.stays : '--',
                lastStay: g.lastStay != null ? g.lastStay : '--',
                isActive: g.totalSpent != null && g.totalSpent > 0
            }));
            this.isLoading = false;
        } else if (error) {
            console.error(error);
            this.isLoading = false;
        }
    }

    get hasGuests() { return this.guests && this.guests.length > 0; }
    get guestCount() { return this.guests ? this.guests.length : 0; }

    handleSearch(event) {
        this.searchTerm = event.target.value;
    }

    handleGuestClick(event) {
        const guestId = event.currentTarget.dataset.id;
        if (guestId) {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: { recordId: guestId, objectApiName: 'Contact', actionName: 'view' }
            });
        }
    }

    handleNewGuest() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: { objectApiName: 'Contact', actionName: 'new' }
        });
    }

    handleExport() {
        // Export functionality placeholder
    }
}
