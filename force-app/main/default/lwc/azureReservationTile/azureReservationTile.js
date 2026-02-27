import { LightningElement, api } from 'lwc';
import { loadAzureTheme } from 'c/azureThemeLoader';

export default class AzureReservationTile extends LightningElement {

    connectedCallback() {
        loadAzureTheme(this);
    }
    @api reservation = {
        id: '1', roomName: 'Aegean Suite', confirmationNumber: 'AZR-001',
        status: 'Upcoming', checkIn: new Date(), checkOut: new Date(Date.now() + 4*86400000),
        nights: 4, total: 3570, imageUrl: ''
    };

    get tileClass() { return `reservation-tile reservation-tile--${(this.reservation.status || 'upcoming').toLowerCase()}`; }
    get imageStyle() { return this.reservation.imageUrl ? `background-image: url(${this.reservation.imageUrl});` : 'background: linear-gradient(135deg, #2e2b28, #1a1918);'; }

    formatDate(d) {
        const date = d instanceof Date ? d : new Date(d);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    get checkInDisplay() { return this.formatDate(this.reservation.checkIn); }
    get checkOutDisplay() { return this.formatDate(this.reservation.checkOut); }
    get totalFormatted() { return this.reservation.total?.toLocaleString(); }
    get isUpcoming() { return this.reservation.status === 'Upcoming'; }

    get statusClass() {
        const s = (this.reservation.status || '').toLowerCase();
        return `tile-status tile-status--${s}`;
    }

    handleModify() { this.dispatchEvent(new CustomEvent('modify', { detail: { id: this.reservation.id }, bubbles: true, composed: true })); }
    handleCancel() { this.dispatchEvent(new CustomEvent('cancel', { detail: { id: this.reservation.id }, bubbles: true, composed: true })); }
    handleRebook() { this.dispatchEvent(new CustomEvent('rebook', { detail: { id: this.reservation.id }, bubbles: true, composed: true })); }
}
