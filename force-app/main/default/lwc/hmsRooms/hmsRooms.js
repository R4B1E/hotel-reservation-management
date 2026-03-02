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
    viewMode = 'grid';

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
    get totalCount() { return this.stats ? this.stats.total : 0; }
    get vacantCount() { return this.stats ? this.stats.vacant : 0; }
    get occupiedCount() { return this.stats ? this.stats.occupied : 0; }
    get cleanCount() { return this.stats ? this.stats.clean : 0; }
    get dirtyCount() { return this.stats ? this.stats.dirty : 0; }

    get gridBtnClass() {
        return 'vt-btn' + (this.viewMode === 'grid' ? ' active' : '');
    }

    get listBtnClass() {
        return 'vt-btn' + (this.viewMode === 'list' ? ' active' : '');
    }

    handleSearch(event) {
        this.searchTerm = event.target.value;
    }

    handleGridView() {
        this.viewMode = 'grid';
    }

    handleListView() {
        this.viewMode = 'list';
    }
}
