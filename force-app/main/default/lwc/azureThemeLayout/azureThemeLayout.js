import { LightningElement } from 'lwc';
import { loadAzureTheme } from 'c/azureThemeLoader';

/**
 * @slot header
 * @slot {default}
 * @slot footer
 */
export default class AzureThemeLayout extends LightningElement {
    connectedCallback() {
        loadAzureTheme(this);
    }
}
