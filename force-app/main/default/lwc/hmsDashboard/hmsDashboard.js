import { LightningElement, wire } from 'lwc';
import { loadHmsTheme } from 'c/hmsThemeLoader';
import getDashboardKPIs from '@salesforce/apex/HMSDashboardController.getDashboardKPIs';
import getOccupancyHistory from '@salesforce/apex/HMSDashboardController.getOccupancyHistory';
import getRoomStatusBreakdown from '@salesforce/apex/HMSDashboardController.getRoomStatusBreakdown';
import getRecentReservations from '@salesforce/apex/HMSDashboardController.getRecentReservations';

export default class HmsDashboard extends LightningElement {
    kpis;
    occupancyBars = [];
    donutSegments = [];
    recentRes = [];
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

    @wire(getOccupancyHistory, { days: 14 })
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
            if (data.vacant) segments.push({ label: 'Available', value: data.vacant, color: this.getStatusColor('Available') });
            if (data.occupied) segments.push({ label: 'Occupied', value: data.occupied, color: this.getStatusColor('Occupied') });
            if (data.blocked) segments.push({ label: 'Blocked', value: data.blocked, color: this.getStatusColor('Blocked') });
            this.donutSegments = segments;
        }
    }

    @wire(getRecentReservations, { lim: 5 })
    wiredRecent({ data }) {
        if (data) {
            this.recentRes = data;
        }
    }

    get hasKpis() { return !!this.kpis; }

    get kpiCards() {
        if (!this.kpis) return [];
        const k = this.kpis;
        return [
            { key: 'occ', label: 'Occupancy Rate', value: k.occupancyPct + '%', subtext: k.occupiedRooms + '/' + k.totalRooms + ' rooms', accentColor: 'var(--hms-accent)', trend: k.occupancyPct > 70 ? 'up' : 'neutral', trendValue: '' },
            { key: 'arr', label: 'Arrivals Today', value: String(k.arrivalsToday), subtext: 'Expected check-ins', accentColor: 'var(--hms-green)' },
            { key: 'dep', label: 'Departures Today', value: String(k.dueOutToday), subtext: 'Expected check-outs', accentColor: 'var(--hms-orange)' },
            { key: 'rev', label: 'Revenue (MTD)', value: '$' + (k.revenueMTD || 0).toLocaleString(), subtext: 'Month to date', accentColor: 'var(--hms-gold)' },
            { key: 'adr', label: 'ADR', value: '$' + (k.adr || 0), subtext: 'Avg daily rate', accentColor: 'var(--hms-purple)' }
        ];
    }

    getStatusColor(status) {
        const map = { 'Available': 'var(--hms-green)', 'Occupied': 'var(--hms-accent)', 'Blocked': 'var(--hms-red)' };
        return map[status] || 'var(--hms-text3)';
    }
}
