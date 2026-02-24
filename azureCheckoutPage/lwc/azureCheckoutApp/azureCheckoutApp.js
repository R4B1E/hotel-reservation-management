import { LightningElement, track } from 'lwc';

// ─── Demo room (in real app, passed via URL state / parent event) ──
const DEMO_ROOM = {
    id: 'cliffside-suite',
    name: 'Cliffside Suite',
    category: 'Signature Suite',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=85',
    pricePerNight: 680,
    bed: 'King',
    view: 'Caldera',
    sqm: 95,
    amenities: ['Private Plunge Pool', 'Outdoor Terrace', 'Butler Service', 'Rain Shower'],
};

export default class AzureCheckoutApp extends LightningElement {

    // ─── Booking context ────────────────────────────────────────
    room     = DEMO_ROOM;
    checkIn  = '2025-10-24';
    checkOut = '2025-10-28';
    guests   = '2 Adults';

    // ─── Step state ─────────────────────────────────────────────
    @track currentStep = 1;
    @track confirmed   = false;
    @track confirmationCode = '';

    // ─── Guest form data ────────────────────────────────────────
    @track guestData = {
        firstName:   '',
        lastName:    '',
        email:       '',
        phone:       '',
        nationality: '',
        dob:         '',
        passportNum: '',
        arrivalTime: '',
        requests:    '',
        newsletter:  false,
    };

    // ─── Derived ────────────────────────────────────────────────
    get nights() {
        const ci = new Date(this.checkIn);
        const co = new Date(this.checkOut);
        return Math.max(1, Math.round((co - ci) / 86400000));
    }

    get isStep1() { return this.currentStep === 1; }
    get isStep2() { return this.currentStep === 2; }

    get steps() {
        return [
            { id: 1, num: '01', label: 'Your Details',  cls: this._stepCls(1) },
            { id: 2, num: '02', label: 'Payment',        cls: this._stepCls(2) },
            { id: 3, num: '03', label: 'Confirmation',   cls: this._stepCls(3) },
        ];
    }

    _stepCls(n) {
        if (n < this.currentStep)  return 'step done';
        if (n === this.currentStep) return 'step active';
        return 'step';
    }

    // ─── Handlers ───────────────────────────────────────────────
    handleGuestChange(e) {
        this.guestData = { ...this.guestData, ...e.detail };
    }

    goStep2() { this.currentStep = 2; this._scrollTop(); }
    goStep1() { this.currentStep = 1; this._scrollTop(); }

    handlePaymentSubmit() {
        // Simulate server call
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
            this.confirmationCode = 'AZR-' + Math.random().toString(36).substring(2,8).toUpperCase();
            this.confirmed = true;
            this.currentStep = 3;
            this._scrollTop();
        }, 1400);
    }

    _scrollTop() {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
    }
}
