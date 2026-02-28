import { LightningElement, api } from 'lwc';
import { loadAzureTheme } from 'c/azureThemeLoader';
// TODO: Wire to Apex — submit reservation via ReservationController
// import createReservation from '@salesforce/apex/ReservationController.createReservation';
// Orchestrates checkout: collects data from c-azure-guest-form + c-azure-payment-form,
// then calls createReservation imperatively and navigates to confirmation page on success.

export default class AzureReservationSummary extends LightningElement {

    connectedCallback() {
        loadAzureTheme(this);
    }
    @api reservation = {
        roomName: 'Aegean Suite',
        category: 'Suite',
        imageUrl: '',
        pricePerNight: 850,
        nights: 4,
        adults: 2,
        children: 0,
        checkIn: new Date(),
        checkOut: new Date(Date.now() + 4 * 86400000)
    };

    get imageStyle() {
        return this.reservation?.imageUrl
            ? `background-image: url(${this.reservation.imageUrl});`
            : 'background: linear-gradient(135deg, #2e2b28, #1a1918);';
    }

    get checkInFormatted() { return this.formatDate(this.reservation.checkIn); }
    get checkOutFormatted() { return this.formatDate(this.reservation.checkOut); }

    formatDate(d) {
        if (!d) return '—';
        const date = d instanceof Date ? d : new Date(d);
        return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    }

    get nightsLabel() {
        return `${this.reservation.nights} Night${this.reservation.nights !== 1 ? 's' : ''}`;
    }

    get guestLabel() {
        const { adults = 2, children = 0 } = this.reservation;
        return `${adults} Adult${adults !== 1 ? 's' : ''}${children ? `, ${children} Child${children !== 1 ? 'ren' : ''}` : ''}`;
    }

    get subtotal() { return (this.reservation.pricePerNight * this.reservation.nights).toLocaleString(); }
    get taxes() { return Math.round(this.reservation.pricePerNight * this.reservation.nights * 0.12).toLocaleString(); }
    get total() { return Math.round(this.reservation.pricePerNight * this.reservation.nights * 1.12).toLocaleString(); }
}
