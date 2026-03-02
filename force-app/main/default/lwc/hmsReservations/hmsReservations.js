import { LightningElement, wire, track } from 'lwc';
import { loadHmsTheme } from 'c/hmsThemeLoader';
import { refreshApex } from '@salesforce/apex';
import getReservations from '@salesforce/apex/HMSReservationController.getReservations';
import getReservationDetail from '@salesforce/apex/HMSReservationController.getReservationDetail';
import checkInGuest from '@salesforce/apex/HMSReservationController.checkInGuest';
import checkOutGuest from '@salesforce/apex/HMSReservationController.checkOutGuest';

export default class HmsReservations extends LightningElement {
    @track reservations = [];
    selectedDetail;
    selectedId;
    searchTerm = '';
    activeFilter = 'All';
    isLoading = true;
    showNewModal = false;
    _wiredResult;

    connectedCallback() {
        loadHmsTheme(this);
    }

    @wire(getReservations, { search: '$searchTerm', filter: '$activeFilter', lim: 50, offset: 0 })
    wiredReservations(result) {
        this._wiredResult = result;
        if (result.data) {
            this.reservations = (result.data.reservations || []).map(r => ({
                ...r,
                isSelected: r.id === this.selectedId
            }));
            this.isLoading = false;
            if (!this.selectedId && this.reservations.length > 0) {
                this.selectReservation(this.reservations[0].id);
            }
        } else if (result.error) {
            console.error(result.error);
            this.isLoading = false;
        }
    }

    get hasList() { return this.reservations && this.reservations.length > 0; }
    get hasDetail() { return !!this.selectedDetail; }
    get listCount() { return this.reservations ? this.reservations.length : 0; }

    get filterButtons() {
        const filters = ['All', 'Arrivals', 'Departures', 'In-House'];
        return filters.map(f => ({
            label: f, value: f,
            className: `filter-btn${this.activeFilter === f ? ' filter-btn--active' : ''}`
        }));
    }

    handleSearch(event) {
        this.searchTerm = event.target.value;
    }

    handleFilterClick(event) {
        this.activeFilter = event.currentTarget.dataset.filter;
    }

    handleReservationSelect(event) {
        this.selectReservation(event.detail.id);
    }

    async selectReservation(id) {
        this.selectedId = id;
        this.reservations = this.reservations.map(r => ({
            ...r,
            isSelected: r.id === id
        }));
        try {
            this.selectedDetail = await getReservationDetail({ resId: id });
        } catch (error) {
            console.error('Detail error', error);
        }
    }

    async handleCheckIn(event) {
        try {
            await checkInGuest({ resId: event.detail.id });
            await this.selectReservation(event.detail.id);
            return refreshApex(this._wiredResult);
        } catch (error) {
            console.error('Check-in error', error);
        }
    }

    async handleCheckOut(event) {
        try {
            await checkOutGuest({ resId: event.detail.id });
            await this.selectReservation(event.detail.id);
            return refreshApex(this._wiredResult);
        } catch (error) {
            console.error('Check-out error', error);
        }
    }

    handleNewReservation() {
        this.showNewModal = true;
    }

    handleCloseModal() {
        this.showNewModal = false;
    }

    async handleReservationCreated() {
        this.showNewModal = false;
        return refreshApex(this._wiredResult);
    }
}
