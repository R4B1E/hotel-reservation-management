import { LightningElement, track } from 'lwc';
import { loadAzureTheme } from 'c/azureThemeLoader';

const MOCK_RESERVATIONS = [
    { id:'1', roomName:'Aegean Suite', confirmationNumber:'AZR-20241024-001', status:'Upcoming', checkIn: new Date(2025,0,15), checkOut: new Date(2025,0,19), nights:4, total:3570, imageUrl:'' },
    { id:'2', roomName:'Caldera View Room', confirmationNumber:'AZR-20240810-002', status:'Completed', checkIn: new Date(2024,7,10), checkOut: new Date(2024,7,14), nights:4, total:2088, imageUrl:'' },
    { id:'3', roomName:'The Azure Penthouse', confirmationNumber:'AZR-20240501-003', status:'Completed', checkIn: new Date(2024,4,1), checkOut: new Date(2024,4,5), nights:4, total:9677, imageUrl:'' },
];

export default class AzureMyReservations extends LightningElement {

    connectedCallback() {
        loadAzureTheme(this);
    }
    @track activeTab = 'upcoming';
    @track isLoading = false;

    get upcomingTabClass() { return `tab-btn${this.activeTab === 'upcoming' ? ' tab-btn--active' : ''}`; }
    get pastTabClass() { return `tab-btn${this.activeTab === 'past' ? ' tab-btn--active' : ''}`; }

    get displayedReservations() {
        return MOCK_RESERVATIONS.filter(r => this.activeTab === 'upcoming' ? r.status === 'Upcoming' : r.status !== 'Upcoming');
    }

    get noReservations() { return this.displayedReservations.length === 0; }

    handleTab(event) { this.activeTab = event.currentTarget.dataset.tab; }
    handleModify(event) { console.log('Modify', event.detail.id); }
    handleCancel(event) { console.log('Cancel', event.detail.id); }
    handleRebook(event) { console.log('Rebook', event.detail.id); }
}
