import { LightningElement, wire, track } from 'lwc';
import { loadHmsTheme } from 'c/hmsThemeLoader';
import { refreshApex } from '@salesforce/apex';
import getCasesByStatus from '@salesforce/apex/HMSCaseController.getCasesByStatus';
import getCaseStats from '@salesforce/apex/HMSCaseController.getCaseStats';
import updateCaseStatus from '@salesforce/apex/HMSCaseController.updateCaseStatus';

export default class HmsCases extends LightningElement {
    @track columns = [];
    stats;
    isLoading = true;
    viewMode = 'kanban'; // kanban or list
    _wiredResult;

    connectedCallback() {
        loadHmsTheme(this);
    }

    @wire(getCasesByStatus)
    wiredCases(result) {
        this._wiredResult = result;
        if (result.data) {
            this.columns = [
                { key: 'New', label: 'Open', cases: result.data['New'] || [], color: 'var(--hms-orange)', dotStyle: 'background-color: var(--hms-orange);', noCases: !(result.data['New'] && result.data['New'].length) },
                { key: 'Working', label: 'In Progress', cases: result.data['Working'] || [], color: 'var(--hms-accent)', dotStyle: 'background-color: var(--hms-accent);', noCases: !(result.data['Working'] && result.data['Working'].length) },
                { key: 'Escalated', label: 'Escalated', cases: result.data['Escalated'] || [], color: 'var(--hms-red)', dotStyle: 'background-color: var(--hms-red);', noCases: !(result.data['Escalated'] && result.data['Escalated'].length) },
                { key: 'Closed', label: 'Resolved', cases: result.data['Closed'] || [], color: 'var(--hms-green)', dotStyle: 'background-color: var(--hms-green);', noCases: !(result.data['Closed'] && result.data['Closed'].length) }
            ];
            this.isLoading = false;
        } else if (result.error) {
            console.error(result.error);
            this.isLoading = false;
        }
    }

    @wire(getCaseStats)
    wiredStats({ data }) {
        if (data) this.stats = data;
    }

    get isKanban() { return this.viewMode === 'kanban'; }
    get openCount() { return this.stats ? this.stats.open : 0; }
    get totalCount() { return this.stats ? this.stats.total : 0; }

    get kanbanClass() { return `view-btn${this.viewMode === 'kanban' ? ' view-btn--active' : ''}`; }
    get listClass() { return `view-btn${this.viewMode === 'list' ? ' view-btn--active' : ''}`; }

    handleViewToggle(event) {
        this.viewMode = event.currentTarget.dataset.view;
    }

    async handleStatusChange(event) {
        const { caseId, newStatus } = event.detail;
        try {
            await updateCaseStatus({ caseId, status: newStatus });
            return refreshApex(this._wiredResult);
        } catch (error) {
            console.error('Status update error', error);
        }
    }
}
