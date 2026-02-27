import { LightningElement, api } from 'lwc';
import { loadAzureTheme } from 'c/azureThemeLoader';

export default class AzureHero extends LightningElement {

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
        this.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'rooms' }, bubbles: true, composed: true }));
    }

    handleStory() {
        this.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'story' }, bubbles: true, composed: true }));
    }
}
