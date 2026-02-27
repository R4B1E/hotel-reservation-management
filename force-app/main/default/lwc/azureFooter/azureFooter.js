import { LightningElement } from 'lwc';
import { loadAzureTheme } from 'c/azureThemeLoader';
export default class AzureFooter extends LightningElement {

    connectedCallback() {
        loadAzureTheme(this);
    }}
