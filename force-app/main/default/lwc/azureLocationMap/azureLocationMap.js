import { LightningElement } from 'lwc';
import { loadAzureTheme } from 'c/azureThemeLoader';

export default class AzureLocationMap extends LightningElement {

    connectedCallback() {
        loadAzureTheme(this);
    }
    mapMarkers = [{
        location: { Latitude: 36.4618, Longitude: 25.3753 },
        title: 'The Azure',
        description: 'Sanctuary of Serenity — Oia, Santorini',
        icon: 'standard:location'
    }];
}
