import { LightningElement, api, track } from 'lwc';
import { loadAzureTheme } from 'c/azureThemeLoader';
export default class AzureToast extends LightningElement {

    connectedCallback() {
        loadAzureTheme(this);
    }
    @api type = 'success'; // success | error | info | warning
    @api title = '';
    @api message = '';
    @api duration = 4000;
    @track visible = false;

    _timer = null;

    @api show() {
        this.visible = true;
        if (this._timer) clearTimeout(this._timer);
        this._timer = setTimeout(() => { this.visible = false; }, this.duration);
    }

    get toastClass() { return `azure-toast azure-toast--${this.type}`; }

    get icon() {
        const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
        return icons[this.type] || 'ℹ';
    }

    handleClose() {
        this.visible = false;
        if (this._timer) clearTimeout(this._timer);
    }
}
