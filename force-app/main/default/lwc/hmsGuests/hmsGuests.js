import { LightningElement, wire, track } from 'lwc';
import { loadHmsTheme } from 'c/hmsThemeLoader';
import getGuests from '@salesforce/apex/HMSGuestController.getGuests';

export default class HmsGuests extends LightningElement {
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
            this.guests = data.guests || [];
            this.isLoading = false;
        } else if (error) {
            console.error(error);
            this.isLoading = false;
        }
    }

    get hasGuests() { return this.guests && this.guests.length > 0; }
    get guestCount() { return this.guests ? this.guests.length : 0; }

    get filterOptions() {
        return [
            { label: 'All Guests', value: 'All' },
            { label: 'VIP Only', value: 'VIP' },
            { label: 'In-House', value: 'In-House' }
        ];
    }

    handleSearch(event) {
        this.searchTerm = event.target.value;
    }

    handleFilter(event) {
        this.typeFilter = event.target.value;
    }
}
