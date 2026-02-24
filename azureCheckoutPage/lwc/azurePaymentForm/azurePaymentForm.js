import { LightningElement, track } from 'lwc';

const CARD_GRADIENTS = {
    visa:       'linear-gradient(135deg, #1a1714 0%, #2c2520 100%)',
    mastercard: 'linear-gradient(135deg, #1a1714 0%, #3d2b1a 100%)',
    amex:       'linear-gradient(135deg, #1a2a3a 0%, #2c3e50 100%)',
    default:    'linear-gradient(135deg, #2c2520 0%, #1a1714 100%)',
};

export default class AzurePaymentForm extends LightningElement {

    @track paymentMethod = 'card';
    @track saveCard      = false;
    @track showBilling   = false;
    @track submitting    = false;
    @track showErrorSummary = false;

    @track cardData = {
        number: '', holder: '', expiry: '', cvv: ''
    };

    @track errors = {};

    // ─── Tabs ──────────────────────────────────────────────────
    get isCard()        { return this.paymentMethod === 'card'; }
    get cardTabCls()    { return this.paymentMethod === 'card'     ? 'method-tab active' : 'method-tab'; }
    get transferTabCls(){ return this.paymentMethod === 'transfer' ? 'method-tab active' : 'method-tab'; }

    selectMethod(e) { this.paymentMethod = e.currentTarget.dataset.method; }

    // ─── Card preview ──────────────────────────────────────────
    get cardNetwork() {
        const n = this.cardData.number.replace(/\s/g, '');
        if (/^4/.test(n))       return 'visa';
        if (/^5[1-5]/.test(n)) return 'mastercard';
        if (/^3[47]/.test(n))  return 'amex';
        return 'default';
    }

    get cardNetworkLabel() {
        const map = { visa:'VISA', mastercard:'MC', amex:'AMEX', default:'' };
        return map[this.cardNetwork] || '';
    }

    get cardStyle() {
        return `background: ${CARD_GRADIENTS[this.cardNetwork]};`;
    }

    get maskedCardNumber() {
        const raw = this.cardData.number || '';
        return raw || '•••• •••• •••• ••••';
    }

    get cardHolderDisplay() {
        return this.cardData.holder || 'YOUR NAME';
    }

    // ─── Billing accordion ─────────────────────────────────────
    get billingLabel() { return this.showBilling ? '(same as above)' : '(click to add)'; }
    get billingIcon()  { return this.showBilling ? '▲' : '▼'; }
    toggleBilling()    { this.showBilling = !this.showBilling; }

    // ─── Input handlers ────────────────────────────────────────
    handleInput(e) {
        const field = e.currentTarget.dataset.field;
        this.cardData = { ...this.cardData, [field]: e.target.value };
    }

    handleCardNumber(e) {
        let val = e.target.value.replace(/\D/g, '').slice(0, 16);
        val = val.replace(/(.{4})/g, '$1 ').trim();
        this.cardData = { ...this.cardData, number: val };
        e.target.value = val;
    }

    handleExpiry(e) {
        let val = e.target.value.replace(/\D/g, '').slice(0, 4);
        if (val.length >= 3) val = val.slice(0,2) + '/' + val.slice(2);
        this.cardData = { ...this.cardData, expiry: val };
        e.target.value = val;
    }

    handleSaveCard(e) { this.saveCard = e.target.checked; }

    // ─── Validation ────────────────────────────────────────────
    _validate() {
        const errs = {};
        if (this.isCard) {
            const num = this.cardData.number.replace(/\s/g, '');
            if (!num || num.length < 13)    errs.number = 'Please enter a valid card number.';
            if (!this.cardData.holder?.trim()) errs.holder = 'Cardholder name is required.';
            if (!this.cardData.expiry || !/^\d{2}\/\d{2}$/.test(this.cardData.expiry)) {
                errs.expiry = 'Enter a valid expiry date (MM/YY).';
            }
            if (!this.cardData.cvv || this.cardData.cvv.length < 3) {
                errs.cvv = 'Enter a valid CVV.';
            }
        }
        this.errors = errs;
        return Object.keys(errs).length === 0;
    }

    handleBack() {
        this.dispatchEvent(new CustomEvent('back', { bubbles: true, composed: true }));
    }

    handleSubmit() {
        const valid = this._validate();
        this.showErrorSummary = !valid;
        if (!valid) return;

        this.submitting = true;
        this.dispatchEvent(new CustomEvent('paymentsubmit', {
            bubbles: true, composed: true,
            detail: {
                method: this.paymentMethod,
                last4: this.cardData.number.slice(-4),
                network: this.cardNetwork
            }
        }));
    }
}
