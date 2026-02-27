import { LightningElement, api } from 'lwc';
import { loadAzureTheme } from 'c/azureThemeLoader';

export default class AzureRoomCard extends LightningElement {

    connectedCallback() {
        loadAzureTheme(this);
    }
    @api room = {
        id: '1',
        name: 'Aegean Suite',
        category: 'Suite',
        pricePerNight: 850,
        shortDescription: 'A panoramic haven with infinite sea views and curated Cycladean design.',
        topAmenities: ['Sea View', 'Private Pool', 'King Bed'],
        imageUrl: '',
        squareMeters: 95,
        isFeatured: false
    };

    get imageStyle() {
        const url = this.room?.imageUrl || '';
        return url
            ? `background-image: url(${url});`
            : `background: linear-gradient(135deg, #2e2b28, #1a1918);`;
    }

    handleClick() {
        this.dispatchEvent(new CustomEvent('roomselect', {
            detail: { roomId: this.room?.id },
            bubbles: true, composed: true
        }));
    }
}
