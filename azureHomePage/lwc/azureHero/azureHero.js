import { LightningElement, api } from 'lwc';

export default class AzureHero extends LightningElement {
    @api eyebrow    = 'Santorini, Greece';
    @api titleItalic = 'Sanctuary of';
    @api titleMain   = 'Serenity';
    @api subtitle    = 'Where time stands still and the Aegean Sea whispers ancient secrets…';
    backgroundImage = 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=1800&q=80';
    get backgroundStyle()
    {
        // return `background: url(${this.backgroundImage});`;
        
    }
}
