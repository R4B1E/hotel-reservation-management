import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { loadAzureTheme } from 'c/azureThemeLoader';
import basePath from '@salesforce/community/basePath';

export default class AzureHero extends NavigationMixin(LightningElement) {

    connectedCallback() {
        loadAzureTheme(this);
    }
    @api backgroundImage = '';
    @api location = 'Santorini, Greece';
    @api headlineItalic = 'Sanctuary of';
    @api headlineBold = 'Serenity';
    @api tagline = 'Where time stands still and the Aegean Sea whispers ancient secrets.';

    get heroStyle() {
        const bg = this.backgroundImage
            ? `url(${this.backgroundImage})`
            : 'linear-gradient(135deg, #1a1918 0%, #2e2b28 50%, #1a1918 100%)';
        return `background-image: ${bg};`;
    }

    handleExplore() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: { url: basePath + '/rooms' }
        });
    }

    handleStory() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: { url: basePath + '/story' }
        });
    }
}
