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
        return `background:
        linear-gradient(160deg, rgba(26,23,20,0.55) 0%, rgba(80,55,30,0.3) 50%, rgba(26,23,20,0.7) 100%),
        url(${this.backgroundImage}) center/cover no-repeat;`
    }
}
