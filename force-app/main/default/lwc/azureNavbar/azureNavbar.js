import { LightningElement, track } from 'lwc';
import { loadAzureTheme } from 'c/azureThemeLoader';

export default class AzureNavbar extends LightningElement {
    @track isScrolled = false;
    @track menuOpen = false;

    connectedCallback() {
        loadAzureTheme(this);
        this.scrollHandler = () => {
            this.isScrolled = window.scrollY > 60;
        };
        window.addEventListener('scroll', this.scrollHandler, { passive: true });
    }

    disconnectedCallback() {
        window.removeEventListener('scroll', this.scrollHandler);
    }

    get headerClass() {
        return `azure-header${this.isScrolled ? ' azure-header--scrolled' : ''}`;
    }

    get mobileMenuClass() {
        return `mobile-menu${this.menuOpen ? ' mobile-menu--open' : ''}`;
    }

    get menuLine1() { return `hamburger-line${this.menuOpen ? ' line--top-open' : ''}`; }
    get menuLine2() { return `hamburger-line${this.menuOpen ? ' line--mid-open' : ''}`; }
    get menuLine3() { return `hamburger-line${this.menuOpen ? ' line--bot-open' : ''}`; }

    toggleMenu() {
        this.menuOpen = !this.menuOpen;
    }

    handleLogoClick(event) {
        event.preventDefault();
        this.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'home' }, bubbles: true, composed: true }));
    }
}
