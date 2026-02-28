import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { loadAzureTheme } from 'c/azureThemeLoader';
import basePath from '@salesforce/community/basePath';

const PATH_MAP = {
    home:      '/',
    story:     '/story',
    rooms:     '/rooms',
    amenities: '/amenities',
    location:  '/location',
    login:     '/login',
    book:      '/rooms'
};

export default class AzureNavbar extends NavigationMixin(LightningElement) {
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

    handleNav(event) {
        event.preventDefault();
        const page = event.currentTarget.dataset.page;
        const path = PATH_MAP[page];
        if (path !== undefined) {
            this.menuOpen = false;
            this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: basePath + path
                }
            });
        }
    }
}
