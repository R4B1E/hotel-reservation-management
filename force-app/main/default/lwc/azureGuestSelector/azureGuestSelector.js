import { LightningElement, track } from 'lwc';
import { loadAzureTheme } from 'c/azureThemeLoader';
export default class AzureGuestSelector extends LightningElement {

    connectedCallback() {
        loadAzureTheme(this);
    }
    @track adults = 2;
    @track children = 0;
    @track open = false;

    get guestSummary() {
        return `${this.adults} Adult${this.adults !== 1 ? 's' : ''}${this.children > 0 ? `, ${this.children} Child${this.children !== 1 ? 'ren' : ''}` : ''}`;
    }
    get chevron() { return this.open ? '▲' : '▼'; }

    toggleDropdown() { this.open = !this.open; }

    inc(e) {
        const t = e.currentTarget.dataset.type;
        if (t === 'adults') this.adults = Math.min(this.adults + 1, 8);
        else this.children = Math.min(this.children + 1, 6);
    }

    dec(e) {
        const t = e.currentTarget.dataset.type;
        if (t === 'adults') this.adults = Math.max(this.adults - 1, 1);
        else this.children = Math.max(this.children - 1, 0);
    }

    handleApply() {
        this.open = false;
        this.dispatchEvent(new CustomEvent('guestchange', { detail: { adults: this.adults, children: this.children }, bubbles: true, composed: true }));
    }
}
