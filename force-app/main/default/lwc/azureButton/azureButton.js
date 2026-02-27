import { LightningElement, api } from 'lwc';
import { loadAzureTheme } from 'c/azureThemeLoader';

export default class AzureButton extends LightningElement {

    connectedCallback() {
        loadAzureTheme(this);
    }
    @api label = 'Book Now';
    @api variant = 'primary'; // primary | secondary | ghost | dark
    @api type = 'button';
    @api disabled = false;
    @api showArrow = false;
    @api iconLeft = '';
    @api size = 'md'; // sm | md | lg

    get computedClass() {
        return `azure-btn azure-btn--${this.variant} azure-btn--${this.size}${this.disabled ? ' azure-btn--disabled' : ''}`;
    }

    handleClick(event) {
        if (!this.disabled) {
            this.dispatchEvent(new CustomEvent('buttonclick', { bubbles: true, composed: true }));
        }
    }
}
