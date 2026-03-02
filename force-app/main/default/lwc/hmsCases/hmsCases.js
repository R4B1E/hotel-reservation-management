import { LightningElement, wire, track } from 'lwc';
import { loadHmsTheme } from 'c/hmsThemeLoader';
import { refreshApex } from '@salesforce/apex';
import getCasesByStatus from '@salesforce/apex/HMSCaseController.getCasesByStatus';
import getCaseStats from '@salesforce/apex/HMSCaseController.getCaseStats';
import updateCaseStatus from '@salesforce/apex/HMSCaseController.updateCaseStatus';
import createCase from '@salesforce/apex/HMSCaseController.createCase';

const STATUS_CONFIG = [
    { key: 'New',       label: 'Open',          color: 'var(--hms-red)',    borderColor: 'var(--hms-red)'    },
    { key: 'Working',   label: 'In Progress',   color: 'var(--hms-orange)', borderColor: 'var(--hms-orange)' },
    { key: 'Escalated', label: 'Pending Guest',  color: 'var(--hms-accent)', borderColor: 'var(--hms-accent)' },
    { key: 'Closed',    label: 'Resolved',       color: 'var(--hms-green)',  borderColor: 'var(--hms-green)'  }
];

const STATUS_LABEL_MAP = {
    'New': 'Open',
    'Working': 'In Progress',
    'Escalated': 'Pending',
    'Closed': 'Resolved'
};

const STATUS_BADGE_MAP = {
    'New': 'status-badge status-badge--open',
    'Working': 'status-badge status-badge--working',
    'Escalated': 'status-badge status-badge--escalated',
    'Closed': 'status-badge status-badge--resolved'
};

const CATEGORY_CLASS_MAP = {
    'Complaint': 'case-cat case-cat--complaint',
    'Maintenance': 'case-cat case-cat--maintenance',
    'Service Request': 'case-cat case-cat--service',
    'Billing': 'case-cat case-cat--billing',
    'General Request': 'case-cat case-cat--request'
};

const PRIORITY_BADGE_MAP = {
    'High': 'priority-badge priority-badge--high',
    'Medium': 'priority-badge priority-badge--medium',
    'Low': 'priority-badge priority-badge--low'
};

export default class HmsCases extends LightningElement {
    @track columns = [];
    stats;
    isLoading = true;
    viewMode = 'kanban';
    searchTerm = '';
    showNewModal = false;
    _wiredResult;
    _rawData;

    connectedCallback() {
        loadHmsTheme(this);
    }

    @wire(getCasesByStatus)
    wiredCases(result) {
        this._wiredResult = result;
        if (result.data) {
            this._rawData = result.data;
            this.buildColumns();
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

    buildColumns() {
        const data = this._rawData;
        if (!data) return;
        const term = this.searchTerm.toLowerCase();
        this.columns = STATUS_CONFIG.map(cfg => {
            let cases = data[cfg.key] || [];
            if (term) {
                cases = cases.filter(c =>
                    (c.subject && c.subject.toLowerCase().includes(term)) ||
                    (c.caseNumber && c.caseNumber.toLowerCase().includes(term)) ||
                    (c.contactName && c.contactName.toLowerCase().includes(term)) ||
                    (c.ownerName && c.ownerName.toLowerCase().includes(term))
                );
            }
            return {
                key: cfg.key,
                label: cfg.label,
                cases: cases,
                color: cfg.color,
                dotStyle: `background-color: ${cfg.color};`,
                headerBorderStyle: `border-top: 3px solid ${cfg.borderColor};`,
                noCases: !cases.length
            };
        });
    }

    // --- Stats getters ---
    get openCount() { return this.stats ? this.stats.open : 0; }
    get workingCount() { return this.stats ? this.stats.working : 0; }
    get escalatedCount() { return this.stats ? this.stats.escalated : 0; }
    get closedCount() { return this.stats ? this.stats.closed : 0; }
    get totalCount() { return this.stats ? this.stats.total : 0; }

    // --- View toggle ---
    get isKanban() { return this.viewMode === 'kanban'; }

    get kanbanBtnClass() {
        return `vt-btn${this.viewMode === 'kanban' ? ' vt-btn--active' : ''}`;
    }
    get listBtnClass() {
        return `vt-btn${this.viewMode === 'list' ? ' vt-btn--active' : ''}`;
    }

    get kanbanBoardClass() {
        return `kanban-board${this.viewMode !== 'kanban' ? ' hidden' : ''}`;
    }
    get listViewClass() {
        return `list-view${this.viewMode !== 'list' ? ' hidden' : ''}`;
    }

    handleViewToggle(event) {
        this.viewMode = event.currentTarget.dataset.view;
    }

    // --- Search ---
    handleSearch(event) {
        this.searchTerm = event.target.value;
        this.buildColumns();
    }

    // --- All cases flat array for list view ---
    get allCases() {
        if (!this._rawData) return [];
        const term = this.searchTerm.toLowerCase();
        const result = [];
        for (const cfg of STATUS_CONFIG) {
            let cases = this._rawData[cfg.key] || [];
            if (term) {
                cases = cases.filter(c =>
                    (c.subject && c.subject.toLowerCase().includes(term)) ||
                    (c.caseNumber && c.caseNumber.toLowerCase().includes(term)) ||
                    (c.contactName && c.contactName.toLowerCase().includes(term)) ||
                    (c.ownerName && c.ownerName.toLowerCase().includes(term))
                );
            }
            for (const c of cases) {
                result.push({
                    ...c,
                    room: '',
                    statusLabel: STATUS_LABEL_MAP[cfg.key] || cfg.key,
                    statusBadge: STATUS_BADGE_MAP[cfg.key] || 'status-badge',
                    categoryClass: CATEGORY_CLASS_MAP[c.caseType] || 'case-cat',
                    priorityBadge: PRIORITY_BADGE_MAP[c.priority] || 'priority-badge',
                    formattedDate: c.createdDate ? new Date(c.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
                });
            }
        }
        return result;
    }

    // --- Status change from card ---
    async handleStatusChange(event) {
        const { caseId, newStatus } = event.detail;
        try {
            await updateCaseStatus({ caseId, status: newStatus });
            return refreshApex(this._wiredResult);
        } catch (error) {
            console.error('Status update error', error);
        }
    }

    // --- New Case Modal ---
    handleNewCase() {
        this.showNewModal = true;
    }

    handleCloseModal() {
        this.showNewModal = false;
    }

    async handleCreateCase() {
        const modal = this.template.querySelector('c-hms-modal');
        if (!modal) return;
        const getVal = (field) => {
            const el = modal.querySelector(`[data-field="${field}"]`);
            return el ? el.value : '';
        };
        const subject = getVal('subject');
        const description = getVal('description');
        const priority = getVal('priority');
        const caseType = getVal('caseType');

        if (!subject) return;

        try {
            await createCase({ subject, description, priority, caseType, contactId: null });
            this.showNewModal = false;
            return refreshApex(this._wiredResult);
        } catch (error) {
            console.error('Create case error', error);
        }
    }
}
