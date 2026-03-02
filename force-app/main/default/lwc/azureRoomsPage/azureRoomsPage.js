import { LightningElement, track } from 'lwc';

export default class AzureRoomsPage extends LightningElement {
    @track guestCount = null;
    @track checkIn = null;
    @track checkOut = null;

    handleSearch(event) {
        const { checkIn, checkOut, adults, children } = event.detail;
        this.guestCount = (adults || 0) + (children || 0);
        this.checkIn = checkIn ? this.formatDate(checkIn) : null;
        this.checkOut = checkOut ? this.formatDate(checkOut) : null;
    }

    formatDate(d) {
        const dt = d instanceof Date ? d : new Date(d);
        return dt.getFullYear() + '-' +
            String(dt.getMonth() + 1).padStart(2, '0') + '-' +
            String(dt.getDate()).padStart(2, '0');
    }
}
