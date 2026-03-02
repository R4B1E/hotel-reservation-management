import { LightningElement, api, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { loadAzureTheme } from 'c/azureThemeLoader';
import basePath from '@salesforce/community/basePath';
import getAvailableRooms from '@salesforce/apex/HotelRoomController.getAvailableRooms';
import getRoomCategories from '@salesforce/apex/HotelRoomController.getRoomCategories';

export default class AzureRoomGrid extends NavigationMixin(LightningElement) {

    @api guestCount = null;
    @api checkIn = null;
    @api checkOut = null;

    @track rooms = [];
    @track allCategories = [];
    @track activeFilter = 'All';
    @track isLoading = true;
    @track error = null;

    connectedCallback() {
        loadAzureTheme(this);
    }

    get activeCategory() {
        return this.activeFilter === 'All' ? null : this.activeFilter;
    }

    @wire(getRoomCategories)
    wiredCategories({ data, error }) {
        if (data) {
            this.allCategories = data;
        } else if (error) {
            this.error = error;
        }
    }

    @wire(getAvailableRooms, {
        guestCount: '$guestCount',
        category: '$activeCategory',
        checkIn: '$checkIn',
        checkOut: '$checkOut'
    })
    wiredRooms({ data, error }) {
        this.isLoading = false;
        if (data) {
            this.rooms = data;
            this.error = null;
        } else if (error) {
            this.error = error;
            this.rooms = [];
        }
    }

    get categories() {
        return this.allCategories.map(c => ({
            value: c,
            label: c,
            cssClass: `filter-btn${this.activeFilter === c ? ' filter-btn--active' : ''}`
        }));
    }

    get filteredRooms() {
        return this.rooms;
    }

    get noResults() { return !this.isLoading && this.filteredRooms.length === 0; }

    handleFilter(event) {
        this.activeFilter = event.currentTarget.dataset.value;
    }

    handleRoomSelect(event) {
        const roomId = event.detail.roomId;
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: basePath + '/room-detail?roomId=' + roomId
            }
        });
    }
}
