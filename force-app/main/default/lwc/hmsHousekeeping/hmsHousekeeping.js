import { LightningElement, wire, track } from 'lwc';
import { loadHmsTheme } from 'c/hmsThemeLoader';
import { refreshApex } from '@salesforce/apex';
import getStaffOnDuty from '@salesforce/apex/HMSHousekeepingController.getStaffOnDuty';
import getHousekeepingRooms from '@salesforce/apex/HMSHousekeepingController.getHousekeepingRooms';
import getHousekeepingStats from '@salesforce/apex/HMSHousekeepingController.getHousekeepingStats';
import updateHousekeepingStatus from '@salesforce/apex/HMSHousekeepingController.updateHousekeepingStatus';

export default class HmsHousekeeping extends LightningElement {
    @track staff = [];
    @track rooms = [];
    stats;
    statusFilter = 'All';
    staffFilter = 'All';
    floorFilter = 'All';
    isLoading = true;
    _wiredRooms;

    connectedCallback() { loadHmsTheme(this); }

    @wire(getStaffOnDuty)
    wiredStaff({ data }) { if (data) this.staff = data; }

    @wire(getHousekeepingRooms, { status: '$statusFilter', staff: '$staffFilter', floor: '$floorFilter' })
    wiredRooms(result) {
        this._wiredRooms = result;
        if (result.data) { this.rooms = result.data; this.isLoading = false; }
        else if (result.error) { console.error(result.error); this.isLoading = false; }
    }

    @wire(getHousekeepingStats)
    wiredStats({ data }) { if (data) this.stats = data; }

    get hasRooms() { return this.rooms && this.rooms.length > 0; }
    get hasStaff() { return this.staff && this.staff.length > 0; }
    get dirtyCount() { return this.stats ? this.stats.dirty : 0; }
    get cleanCount() { return this.stats ? this.stats.clean : 0; }
    get progressCount() { return this.stats ? this.stats.inProgress : 0; }

    get statusOptions() {
        return [
            { label: 'All Status', value: 'All' },
            { label: 'Dirty', value: 'Dirty' },
            { label: 'Clean', value: 'Clean' },
            { label: 'In Progress', value: 'In Progress' },
            { label: 'Inspecting', value: 'Inspecting' }
        ];
    }

    handleStatusFilter(event) { this.statusFilter = event.target.value; }
    handleFloorFilter(event) { this.floorFilter = event.target.value; }

    async handleMarkCleanBtn(event) {
        const roomId = event.currentTarget.dataset.id;
        try {
            await updateHousekeepingStatus({ roomId, status: 'Clean' });
            return refreshApex(this._wiredRooms);
        } catch (e) { console.error(e); }
    }

    async handleStartCleaningBtn(event) {
        const roomId = event.currentTarget.dataset.id;
        try {
            await updateHousekeepingStatus({ roomId, status: 'In Progress' });
            return refreshApex(this._wiredRooms);
        } catch (e) { console.error(e); }
    }
}
