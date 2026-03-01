import { LightningElement, track } from 'lwc';
import { loadAzureTheme } from 'c/azureThemeLoader';

export default class AzureBookingBar extends LightningElement {

    connectedCallback() {
        loadAzureTheme(this);
    }
    @track checkIn = null;
    @track checkOut = null;
    @track adults = 2;
    @track children = 0;
    @track guestDropdownOpen = false;
    @track showDatePicker = false;
    @track datePickerMode = 'checkin';

    get checkInDisplay() {
        return this.checkIn ? this.formatDate(this.checkIn) : 'Select date';
    }

    get checkOutDisplay() {
        return this.checkOut ? this.formatDate(this.checkOut) : 'Select date';
    }

    get guestSummary() {
        const g = this.adults + this.children;
        return `${this.adults} Adult${this.adults !== 1 ? 's' : ''}${this.children > 0 ? `, ${this.children} Child${this.children !== 1 ? 'ren' : ''}` : ''}`;
    }

    get chevronIcon() {
        return this.guestDropdownOpen ? '\u25B2' : '\u25BC';
    }

    get datePickerMinDate() {
        if (this.datePickerMode === 'checkout' && this.checkIn) {
            return this.checkIn.toISOString();
        }
        return null;
    }

    formatDate(d) {
        return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    }

    handleCheckIn() {
        this.datePickerMode = 'checkin';
        this.showDatePicker = true;
    }

    handleCheckOut() {
        this.datePickerMode = 'checkout';
        this.showDatePicker = true;
    }

    handleDateSelected(event) {
        const { date, mode } = event.detail;
        if (mode === 'checkin') {
            this.checkIn = new Date(date);
            // If check-out is before the new check-in, clear it
            if (this.checkOut && this.checkOut <= this.checkIn) {
                this.checkOut = null;
            }
        } else {
            this.checkOut = new Date(date);
        }
        this.showDatePicker = false;
    }

    handleDatePickerClose() {
        this.showDatePicker = false;
    }

    toggleGuestDropdown(event) {
        event.stopPropagation();
        this.guestDropdownOpen = !this.guestDropdownOpen;
    }

    incrementAdults(e) { e.stopPropagation(); this.adults = Math.min(this.adults + 1, 8); }
    decrementAdults(e) { e.stopPropagation(); this.adults = Math.max(this.adults - 1, 1); }
    incrementChildren(e) { e.stopPropagation(); this.children = Math.min(this.children + 1, 6); }
    decrementChildren(e) { e.stopPropagation(); this.children = Math.max(this.children - 1, 0); }

    handleSearch() {
        this.dispatchEvent(new CustomEvent('search', {
            detail: { checkIn: this.checkIn, checkOut: this.checkOut, adults: this.adults, children: this.children },
            bubbles: true, composed: true
        }));
    }
}
