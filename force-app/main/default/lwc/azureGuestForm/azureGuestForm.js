import { LightningElement, track, api } from 'lwc';
import { loadAzureTheme } from 'c/azureThemeLoader';

export default class AzureGuestForm extends LightningElement {

    connectedCallback() {
        loadAzureTheme(this);
    }
    @track firstName = '';
    @track lastName = '';
    @track email = '';
    @track phone = '';
    @track country = '';
    @track requests = '';

    handleChange(event) {
        const field = event.currentTarget.dataset.field;
        this[field] = event.target.value;
        this.dispatchEvent(new CustomEvent('formchange', {
            detail: { firstName: this.firstName, lastName: this.lastName, email: this.email, phone: this.phone, country: this.country, requests: this.requests },
            bubbles: true, composed: true
        }));
    }

    @api getFormData() {
        return { firstName: this.firstName, lastName: this.lastName, email: this.email, phone: this.phone, country: this.country, requests: this.requests };
    }

    @api validate() {
        return this.firstName && this.lastName && this.email;
    }
}
