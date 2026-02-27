import { LightningElement, track, api } from 'lwc';
import { loadAzureTheme } from 'c/azureThemeLoader';

export default class AzurePaymentForm extends LightningElement {

    connectedCallback() {
        loadAzureTheme(this);
    }
    @track cardName = '';
    @track cardNumber = '';
    @track expiry = '';
    @track cvv = '';

    handleChange(event) {
        const field = event.currentTarget.dataset.field;
        this[field] = event.target.value;
    }

    formatCardNumber(event) {
        let val = event.target.value.replace(/\D/g, '').substring(0, 16);
        event.target.value = val.replace(/(.{4})/g, '$1 ').trim();
    }

    @api validate() {
        return this.cardName && this.cardNumber.length >= 16 && this.expiry && this.cvv;
    }
}
