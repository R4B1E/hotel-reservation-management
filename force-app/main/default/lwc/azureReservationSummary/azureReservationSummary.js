import { LightningElement, track, wire } from 'lwc';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import { loadAzureTheme } from 'c/azureThemeLoader';
import basePath from '@salesforce/community/basePath';
import createReservation from '@salesforce/apex/ReservationController.createReservation';

export default class AzureReservationSummary extends NavigationMixin(LightningElement) {

    @track reservation = {
        roomId: '',
        roomName: '',
        category: '',
        imageUrl: '',
        pricePerNight: 0,
        nights: 0,
        adults: 2,
        children: 0,
        checkIn: null,
        checkOut: null
    };
    @track guestData = {};
    @track isSubmitting = false;
    @track submitError = null;

    connectedCallback() {
        loadAzureTheme(this);
        this._formHandler = (e) => { this.guestData = e.detail; };
        document.addEventListener('formchange', this._formHandler);
    }

    disconnectedCallback() {
        document.removeEventListener('formchange', this._formHandler);
    }

    @wire(CurrentPageReference)
    handlePageRef(pageRef) {
        if (pageRef?.state) {
            const s = pageRef.state;
            const checkIn = s.checkIn ? new Date(s.checkIn) : new Date();
            const checkOut = s.checkOut ? new Date(s.checkOut) : new Date(Date.now() + 4 * 86400000);
            const nights = Math.max(1, Math.round((checkOut - checkIn) / 86400000));
            this.reservation = {
                roomId: s.roomId || '',
                roomName: s.roomName || '',
                category: s.category || '',
                imageUrl: s.imageUrl || '',
                pricePerNight: Number(s.pricePerNight) || 0,
                nights,
                adults: Number(s.adults) || 2,
                children: Number(s.children) || 0,
                checkIn,
                checkOut
            };
        }
    }

    get imageStyle() {
        return this.reservation?.imageUrl
            ? `background-image: url(${this.reservation.imageUrl});`
            : 'background: linear-gradient(135deg, #2e2b28, #1a1918);';
    }

    get checkInFormatted() { return this.formatDate(this.reservation.checkIn); }
    get checkOutFormatted() { return this.formatDate(this.reservation.checkOut); }

    formatDate(d) {
        if (!d) return '';
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

    get canSubmit() {
        return this.reservation.roomId && !this.isSubmitting;
    }

    get submitButtonLabel() {
        return this.isSubmitting ? 'Processing...' : 'Complete Booking';
    }

    get hasError() { return !!this.submitError; }

    handleCompleteBooking() {
        if (!this.reservation.roomId) return;

        if (!this.guestData.firstName || !this.guestData.lastName || !this.guestData.email) {
            this.submitError = 'Please fill in all required guest details.';
            return;
        }

        this.isSubmitting = true;
        this.submitError = null;

        const checkIn = this.reservation.checkIn instanceof Date
            ? this.reservation.checkIn.toISOString().split('T')[0]
            : this.reservation.checkIn;
        const checkOut = this.reservation.checkOut instanceof Date
            ? this.reservation.checkOut.toISOString().split('T')[0]
            : this.reservation.checkOut;

        createReservation({
            roomId: this.reservation.roomId,
            checkIn,
            checkOut,
            adults: this.reservation.adults,
            children: this.reservation.children,
            guestFirstName: this.guestData.firstName,
            guestLastName: this.guestData.lastName,
            guestEmail: this.guestData.email,
            guestPhone: this.guestData.phone || '',
            specialRequests: this.guestData.requests || ''
        })
            .then(confirmationNumber => {
                this[NavigationMixin.Navigate]({
                    type: 'standard__webPage',
                    attributes: {
                        url: basePath + '/confirmation?confirmationNumber=' + confirmationNumber
                    }
                });
            })
            .catch(err => {
                this.isSubmitting = false;
                this.submitError = err.body ? err.body.message : 'Unable to complete booking. Please try again.';
            });
    }
}
