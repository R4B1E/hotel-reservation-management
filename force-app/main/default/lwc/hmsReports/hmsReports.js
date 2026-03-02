import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { loadHmsTheme } from 'c/hmsThemeLoader';
import getReportCards from '@salesforce/apex/HMSReportController.getReportCards';

export default class HmsReports extends NavigationMixin(LightningElement) {
    reports = [];
    isLoading = true;

    connectedCallback() {
        loadHmsTheme(this);
    }

    @wire(getReportCards)
    wiredReports({ data, error }) {
        if (data) {
            this.reports = data;
            this.isLoading = false;
        } else if (error) {
            console.error(error);
            this.isLoading = false;
        }
    }

    get hasReports() { return this.reports && this.reports.length > 0; }

    handleCreateReport() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Report',
                actionName: 'home'
            }
        });
    }
}
