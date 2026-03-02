import { LightningElement, wire, track } from 'lwc';
import { loadHmsTheme } from 'c/hmsThemeLoader';
import getAllRooms from '@salesforce/apex/HMSRoomController.getAllRooms';
import getRoomSummaryStats from '@salesforce/apex/HMSRoomController.getRoomSummaryStats';

export default class HmsRooms extends LightningElement {
    @track rooms = [];
    stats;
    searchTerm = '';
    statusFilter = 'All';
    hkFilter = 'All';
    isLoading = true;

    connectedCallback() {
        loadHmsTheme(this);
    }

    @wire(getAllRooms, { search: '$searchTerm', statusFilter: '$statusFilter', hkFilter: '$hkFilter' })
    wiredRooms({ data, error }) {
        if (data) { this.rooms = data; this.isLoading = false; }
        else if (error) { console.error(error); this.isLoading = false; }
    }

    @wire(getRoomSummaryStats)
    wiredStats({ data }) {
        if (data) this.stats = data;
    }

    get hasRooms() { return this.rooms && this.rooms.length > 0; }
    get roomCount() { return this.rooms ? this.rooms.length : 0; }
    get availableCount() { return this.stats ? this.stats.available : 0; }
    get occupiedCount() { return this.stats ? this.stats.occupied : 0; }
    get blockedCount() { return this.stats ? this.stats.blocked : 0; }

    get statusOptions() {
        return [
            { label: 'All Status', value: 'All' },
            { label: 'Available', value: 'Available' },
            { label: 'Occupied', value: 'Occupied' },
            { label: 'Blocked', value: 'Blocked' }
        ];
    }

    get hkOptions() {
        return [
            { label: 'All HK', value: 'All' },
            { label: 'Clean', value: 'Clean' },
            { label: 'Dirty', value: 'Dirty' },
            { label: 'In Progress', value: 'In Progress' }
        ];
    }

    handleSearch(event) {
        this.searchTerm = event.target.value;
    }

    handleStatusFilter(event) {
        this.statusFilter = event.target.value;
    }

    handleHkFilter(event) {
        this.hkFilter = event.target.value;
    }
}
