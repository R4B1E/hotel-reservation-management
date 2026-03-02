import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class HmsReportCard extends NavigationMixin(LightningElement) {
    @api report; // { id, name, description, iconName, color }

    get iconStyle() {
        const c = this.report && this.report.color ? this.report.color : 'var(--hms-accent)';
        return `background: ${c}; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; color: #fff;`;
    }

    handleRun() {
        if (this.report && this.report.id) {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: this.report.id,
                    objectApiName: 'Report',
                    actionName: 'view'
                }
            });
        }
    }
}
