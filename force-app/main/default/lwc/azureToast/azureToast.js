import { LightningElement, api, track } from 'lwc';
import { loadAzureTheme } from 'c/azureThemeLoader';

export default class AzureToast extends LightningElement {

    connectedCallback() {
        loadAzureTheme(this);
        this._docHandler = (e) => {
            const { type, title, message } = e.detail || {};
            this.type = type || 'info';
            this.title = title || '';
            this.message = message || '';
            this.show();
        };
        document.addEventListener('showtoast', this._docHandler);
    }

    disconnectedCallback() {
        document.removeEventListener('showtoast', this._docHandler);
    }

    @api type = 'success';
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
        const icons = { success: '\u2713', error: '\u2715', info: '\u2139', warning: '\u26A0' };
        return icons[this.type] || '\u2139';
    }

    handleClose() {
        this.visible = false;
        if (this._timer) clearTimeout(this._timer);
    }
}
