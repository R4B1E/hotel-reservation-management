import { LightningElement, api, track } from 'lwc';

const COUNTRIES = [
    'France','United Kingdom','United States','Germany','Italy','Spain',
    'Switzerland','Netherlands','Belgium','Greece','UAE','Saudi Arabia',
    'Russia','China','Japan','Australia','Canada','Brazil','South Africa',
    'Morocco','Other'
];

const ARRIVAL_TIMES = [
    'Before 12:00 (Early check-in requested)',
    '12:00 – 14:00','14:00 – 16:00','16:00 – 18:00',
    '18:00 – 20:00','20:00 – 22:00','After 22:00 (Late arrival)',
];

export default class AzureGuestForm extends LightningElement {
    @api guestData;

    @track errors = {};
    @track touched = {};
    @track showErrorSummary = false;

    countries    = COUNTRIES;
    arrivalTimes = ARRIVAL_TIMES;

    // ─── Field class helpers ───────────────────────────────────
    get firstNameCls() { return this._fieldCls('firstName'); }
    get lastNameCls()  { return this._fieldCls('lastName'); }
    get emailCls()     { return this._fieldCls('email'); }

    _fieldCls(f) {
        if (this.errors[f] && this.touched[f]) return 'field-wrap error';
        if (!this.errors[f] && this.touched[f] && this.guestData[f]) return 'field-wrap valid';
        return 'field-wrap';
    }

    // ─── Input / blur handlers ─────────────────────────────────
    handleInput(e) {
        const field = e.currentTarget.dataset.field;
        const value = e.target.value;
        this._emit({ [field]: value });
        if (this.touched[field]) this._validate({ ...this.guestData, [field]: value });
    }

    handleBlur(e) {
        const field = e.currentTarget.dataset.field;
        this.touched = { ...this.touched, [field]: true };
        this._validate(this.guestData);
    }

    handleNewsletter(e) {
        this._emit({ newsletter: e.target.checked });
    }

    _emit(patch) {
        this.dispatchEvent(new CustomEvent('guestchange', {
            bubbles: true, composed: true, detail: patch
        }));
    }

    // ─── Validation ────────────────────────────────────────────
    _validate(data) {
        const errs = {};
        if (!data.firstName?.trim())  errs.firstName = 'First name is required.';
        if (!data.lastName?.trim())   errs.lastName  = 'Last name is required.';
        if (!data.email?.trim()) {
            errs.email = 'Email address is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errs.email = 'Please enter a valid email address.';
        }
        this.errors = errs;
        return Object.keys(errs).length === 0;
    }

    // ─── Next step ─────────────────────────────────────────────
    handleNext() {
        // Touch all required fields
        this.touched = { firstName: true, lastName: true, email: true };
        const valid = this._validate(this.guestData);
        this.showErrorSummary = !valid;

        if (valid) {
            this.showErrorSummary = false;
            this.dispatchEvent(new CustomEvent('next', { bubbles: true, composed: true }));
        } else {
            // Scroll to first error
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(() => {
                const el = this.template.querySelector('.field-wrap.error');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }
}
