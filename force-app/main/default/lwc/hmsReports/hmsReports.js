import { LightningElement, wire } from 'lwc';
import { loadHmsTheme } from 'c/hmsThemeLoader';
import getReportCards from '@salesforce/apex/HMSReportController.getReportCards';

export default class HmsReports extends LightningElement {
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
}
