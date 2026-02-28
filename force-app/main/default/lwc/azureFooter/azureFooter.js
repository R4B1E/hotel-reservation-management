import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { loadAzureTheme } from 'c/azureThemeLoader';
import basePath from '@salesforce/community/basePath';

const PATH_MAP = {
    story:          '/story',
    rooms:          '/rooms',
    amenities:      '/amenities',
    location:       '/location',
    book:           '/rooms',
    myReservations: '/my-reservations',
    login:          '/login'
};

export default class AzureFooter extends NavigationMixin(LightningElement) {

    connectedCallback() {
        loadAzureTheme(this);
    }

    handleNav(event) {
        event.preventDefault();
        const page = event.currentTarget.dataset.page;
        const path = PATH_MAP[page];
        if (path !== undefined) {
            this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: basePath + path
                }
            });
        }
    }
}
