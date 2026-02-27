import { LightningElement, api, track } from 'lwc';
import { loadAzureTheme } from 'c/azureThemeLoader';

export default class AzureAvailabilityResults extends LightningElement {

    connectedCallback() {
        loadAzureTheme(this);
    }
    @api rooms = [];
    @api checkIn = null;
    @api checkOut = null;
    @api guests = 2;
    @track sortKey = 'price-asc';

    get resultsSummary() {
        const n = this.rooms.length;
        return `${n} room${n !== 1 ? 's' : ''} available${this.checkIn && this.checkOut ? ` · ${this.nightCount} night${this.nightCount !== 1 ? 's' : ''}` : ''}`;
    }

    get nightCount() {
        if (!this.checkIn || !this.checkOut) return 0;
        return Math.round((new Date(this.checkOut) - new Date(this.checkIn)) / 86400000);
    }

    get sortedRooms() {
        const rooms = [...(this.rooms || [])];
        if (this.sortKey === 'price-asc') return rooms.sort((a,b) => a.pricePerNight - b.pricePerNight);
        if (this.sortKey === 'price-desc') return rooms.sort((a,b) => b.pricePerNight - a.pricePerNight);
        if (this.sortKey === 'size') return rooms.sort((a,b) => b.squareMeters - a.squareMeters);
        return rooms;
    }

    handleSort(e) { this.sortKey = e.target.value; }

    handleSelect(event) {
        this.dispatchEvent(new CustomEvent('roomselect', { detail: event.detail, bubbles: true, composed: true }));
    }
}
