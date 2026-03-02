import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { loadHmsTheme } from 'c/hmsThemeLoader';
import getDashboardKPIs from '@salesforce/apex/HMSDashboardController.getDashboardKPIs';
import getOccupancyHistory from '@salesforce/apex/HMSDashboardController.getOccupancyHistory';
import getRoomStatusBreakdown from '@salesforce/apex/HMSDashboardController.getRoomStatusBreakdown';
import getRecentReservations from '@salesforce/apex/HMSDashboardController.getRecentReservations';
import getOccupancyByRoomType from '@salesforce/apex/HMSDashboardController.getOccupancyByRoomType';

export default class HmsDashboard extends NavigationMixin(LightningElement) {
    kpis;
    occupancyBars = [];
    donutSegments = [];
    recentRes = [];
    occupancyByType = [];
    isLoading = true;

    connectedCallback() {
        loadHmsTheme(this);
    }

    @wire(getDashboardKPIs)
    wiredKpis({ data, error }) {
        if (data) {
            this.kpis = data;
            this.isLoading = false;
        } else if (error) {
            console.error('Dashboard KPIs error:', error);
            this.isLoading = false;
        }
    }

    @wire(getOccupancyHistory, { days: 10 })
    wiredOccupancy({ data }) {
        if (data) {
            this.occupancyBars = data.map(d => ({
                label: d.label,
                value: d.pct
            }));
        }
    }

    @wire(getRoomStatusBreakdown)
    wiredBreakdown({ data }) {
        if (data) {
            const segments = [];
            if (data.vacant) segments.push({ label: 'Vacant', value: data.vacant, color: '#3b82f6' });
            if (data.occupied) segments.push({ label: 'Occupied', value: data.occupied, color: '#10b981' });
            if (data.blocked) segments.push({ label: 'Blocked', value: data.blocked, color: '#ef4444' });
            if (data.dirty) segments.push({ label: 'Dirty', value: data.dirty, color: '#f59e0b' });
            this.donutSegments = segments;
        }
    }

    @wire(getRecentReservations, { lim: 5 })
    wiredRecent({ data }) {
        if (data) {
            this.recentRes = data;
        }
    }

    @wire(getOccupancyByRoomType)
    wiredOccByType({ data }) {
        if (data) {
            this.occupancyByType = data.map(d => ({
                ...d,
                barStyle: `width:${d.pct}%;background:${d.color}`
            }));
        }
    }

    get hasKpis() { return !!this.kpis; }

    get kpiCards() {
        if (!this.kpis) return [];
        const k = this.kpis;
        return [
            { key: 'total', label: 'Total Rooms', value: String(k.totalRooms), subtext: 'All properties', accentColor: 'var(--hms-accent)' },
            { key: 'occ', label: 'Occupied', value: String(k.occupiedRooms), subtext: k.occupiedRooms + ' of ' + k.totalRooms + ' rooms', accentColor: 'var(--hms-green)', trend: 'up', trendValue: '' },
            { key: 'dep', label: 'Due Out Today', value: String(k.dueOutToday), subtext: 'Expected check-outs', accentColor: 'var(--hms-gold)' },
            { key: 'dirty', label: 'Dirty Rooms', value: String(k.dirtyRooms), subtext: 'Needs cleaning', accentColor: 'var(--hms-red)' },
            { key: 'pct', label: 'Occupancy %', value: k.occupancyPct + '%', subtext: 'Current occupancy rate', accentColor: 'var(--hms-purple)', trend: 'up', trendValue: '' }
        ];
    }

    handleNewReservation() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Reservation__c',
                actionName: 'new'
            }
        });
    }
}
