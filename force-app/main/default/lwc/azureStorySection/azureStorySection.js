import { LightningElement, api } from 'lwc';
import { loadAzureTheme } from 'c/azureThemeLoader';

export default class AzureStorySection extends LightningElement {

    connectedCallback() {
        loadAzureTheme(this);
    }
    @api mainImageUrl = '';
    @api accentImageUrl = '';

    stats = [
        { value: '18', label: 'Unique Rooms & Suites' },
        { value: '4.97', label: 'Average Guest Rating' },
        { value: '37+', label: 'Years of Hospitality' },
        { value: '12', label: 'Awards Won' },
    ];

    get mainImageStyle() {
        return this.mainImageUrl
            ? `background-image: url(${this.mainImageUrl});`
            : 'background: linear-gradient(135deg, #2e2b28 0%, #3a3530 100%);';
    }

    get accentImageStyle() {
        return this.accentImageUrl
            ? `background-image: url(${this.accentImageUrl});`
            : 'background: linear-gradient(135deg, #c9a96e20 0%, #1a1918 100%);';
    }
}
