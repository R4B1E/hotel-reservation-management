import { LightningElement, api } from 'lwc';
import { loadAzureTheme } from 'c/azureThemeLoader';
export default class AzureModal extends LightningElement {

    connectedCallback() {
        loadAzureTheme(this);
    }
    @api title = '';
    @api size = 'md'; // sm | md | lg
    @api hideFooter = false;
    @api confirmLabel = 'Confirm';
    @api cancelLabel = 'Cancel';

    get modalClass() { return `modal-panel modal-panel--${this.size}`; }

    handleClose() { this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true })); }
    handleConfirm() { this.dispatchEvent(new CustomEvent('confirm', { bubbles: true, composed: true })); }
    handleOverlayClick() { this.handleClose(); }
    stopProp(e) { e.stopPropagation(); }
}
