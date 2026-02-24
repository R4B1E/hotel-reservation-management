import { LightningElement, track } from 'lwc';

export default class AzureNav extends LightningElement {
    @track scrolled = false;
    @track menuOpen = false;

    navLinks = [
        { label: 'Story',     href: '#heritage' },
        { label: 'Rooms',     href: '#rooms' },
        { label: 'Amenities', href: '#amenities' },
        { label: 'Location',  href: '#location' },
    ];

    connectedCallback() {
        this._handleScroll = () => {
            this.scrolled = window.scrollY > 60;
        };
        window.addEventListener('scroll', this._handleScroll, { passive: true });
    }

    disconnectedCallback() {
        window.removeEventListener('scroll', this._handleScroll);
    }

    get navClass() {
        return this.scrolled ? 'nav-wrapper scrolled' : 'nav-wrapper';
    }

    toggleMenu() {
        this.menuOpen = !this.menuOpen;
    }
}
