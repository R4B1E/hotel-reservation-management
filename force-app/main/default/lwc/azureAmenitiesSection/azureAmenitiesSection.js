import { LightningElement } from 'lwc';
import { loadAzureTheme } from 'c/azureThemeLoader';
export default class AzureAmenitiesSection extends LightningElement {

    connectedCallback() {
        loadAzureTheme(this);
    }
    amenities = [
        { id:'1', icon:'◈', title:'Infinity Pool', description:'Suspended above the caldera, our heated infinity pool offers uninterrupted views from sunrise to sunset.' },
        { id:'2', icon:'◈', title:'Spa & Wellness', description:'Ancient Aegean rituals meet modern therapy in our full-service spa carved into the volcanic rock.' },
        { id:'3', icon:'◈', title:'Private Dining', description:'Your terrace, your menu. Our executive chef curates personalized meals under the stars.' },
        { id:'4', icon:'◈', title:'Wine Cellar', description:'Over 400 labels from the Aegean islands and beyond, guided by our resident sommelier.' },
        { id:'5', icon:'◈', title:'Concierge', description:'From private yacht charters to volcanic hikes at dawn — we arrange the extraordinary.' },
        { id:'6', icon:'◈', title:'Sunset Lounge', description:'A curated cocktail program inspired by the colors of the Santorini sunset.' },
        { id:'7', icon:'◈', title:'Yoga Deck', description:'Morning yoga at the edge of the caldera, guided by certified instructors from across the island.' },
        { id:'8', icon:'◈', title:'Transfers', description:'Seamless arrival and departure by private speedboat or luxury vehicle.' },
    ];
}
