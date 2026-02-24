import { LightningElement, track } from 'lwc';

const fmt = d => d.toISOString().split('T')[0];

export default class AzureBookingBar extends LightningElement {
    @track checkIn;
    @track checkOut;
    @track checkOutMin;
    @track selectedGuests = '2a0c';
    @track availabilityMsg = '';

    guestOptions = [
        { value: '1a0c', label: '1 Adult, 0 Children' },
        { value: '2a0c', label: '2 Adults, 0 Children' },
        { value: '2a1c', label: '2 Adults, 1 Child' },
        { value: '2a2c', label: '2 Adults, 2 Children' },
        { value: '3a0c', label: '3 Adults, 0 Children' },
    ];

    connectedCallback() {
        const today = new Date();
        const ci = new Date(today); ci.setDate(ci.getDate() + 1);
        const co = new Date(today); co.setDate(co.getDate() + 4);
        this.checkIn     = fmt(ci);
        this.checkOut    = fmt(co);
        this.checkOutMin = fmt(new Date(ci.getTime() + 86400000));
    }

    handleCheckIn(e) {
        this.checkIn = e.target.value;
        const ci = new Date(this.checkIn);
        const minCo = new Date(ci.getTime() + 86400000);
        this.checkOutMin = fmt(minCo);
        if (new Date(this.checkOut) <= ci) {
            this.checkOut = fmt(minCo);
        }
    }

    handleCheckOut(e) {
        this.checkOut = e.target.value;
    }

    handleGuests(e) {
        this.selectedGuests = e.target.value;
    }

    checkAvailability() {
        this.availabilityMsg = `Searching availability for ${this.checkIn} → ${this.checkOut}…`;
        setTimeout(() => {
            this.availabilityMsg = '✓ Rooms available for your dates. Scroll down to select.';
        }, 1200);

        // Dispatch event for parent / Experience Cloud to handle
        this.dispatchEvent(new CustomEvent('checkavailability', {
            bubbles: true,
            composed: true,
            detail: {
                checkIn: this.checkIn,
                checkOut: this.checkOut,
                guests: this.selectedGuests
            }
        }));
    }
}
