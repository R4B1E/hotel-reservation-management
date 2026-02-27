import { LightningElement, api } from 'lwc';
import { loadAzureTheme } from 'c/azureThemeLoader';
export default class AzureAmenityCard extends LightningElement {

    connectedCallback() {
        loadAzureTheme(this);
    }
    @api amenity = { icon: '◈', title: 'Infinity Pool', description: 'Suspended above the caldera, our heated infinity pool offers uninterrupted views at sunrise.' };
}
