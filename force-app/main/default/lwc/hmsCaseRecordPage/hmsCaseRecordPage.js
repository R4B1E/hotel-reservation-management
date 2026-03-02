import { LightningElement, api, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { loadHmsTheme } from 'c/hmsThemeLoader';
import updateCaseStatus from '@salesforce/apex/HMSCaseController.updateCaseStatus';

/* Case fields */
import CASE_NUMBER from '@salesforce/schema/Case.CaseNumber';
import SUBJECT from '@salesforce/schema/Case.Subject';
import STATUS from '@salesforce/schema/Case.Status';
import PRIORITY from '@salesforce/schema/Case.Priority';
import TYPE from '@salesforce/schema/Case.Type';
import REASON from '@salesforce/schema/Case.Reason';
import DESCRIPTION from '@salesforce/schema/Case.Description';
import CONTACT_NAME from '@salesforce/schema/Case.Contact.Name';
import CONTACT_VIP from '@salesforce/schema/Case.Contact.VIP_Status__c';
import OWNER_NAME from '@salesforce/schema/Case.Owner.Name';
import CREATED_DATE from '@salesforce/schema/Case.CreatedDate';
import ORIGIN from '@salesforce/schema/Case.Origin';

const CASE_FIELDS = [
    CASE_NUMBER, SUBJECT, STATUS, PRIORITY, TYPE, REASON,
    DESCRIPTION, CONTACT_NAME, CONTACT_VIP, OWNER_NAME,
    CREATED_DATE, ORIGIN
];

const STATUS_STEPS = [
    { key: 'New', label: 'Opened' },
    { key: 'Working', label: 'Assigned' },
    { key: 'InProgress', label: 'In Progress' },
    { key: 'PendingGuest', label: 'Pending Guest' },
    { key: 'Escalated', label: 'Resolved' },
    { key: 'Closed', label: 'Closed' }
];

const STATUS_ORDER = { 'New': 0, 'Working': 1, 'Escalated': 2, 'Closed': 3 };

export default class HmsCaseRecordPage extends NavigationMixin(LightningElement) {
    @api recordId;
    @track activeTab = 'details';
    @track quickStatus = '';
    @track quickNote = '';
    @track isSaving = false;

    caseRecord;
    error;

    connectedCallback() {
        loadHmsTheme(this);
    }

    @wire(getRecord, { recordId: '$recordId', fields: CASE_FIELDS })
    wiredCase({ data, error }) {
        if (data) {
            this.caseRecord = data;
            this.error = undefined;
            this.quickStatus = this.status || '';
        } else if (error) {
            this.error = error;
            this.caseRecord = undefined;
        }
    }

    /* ── Field getters ── */
    get hasData() { return !!this.caseRecord; }
    get caseNumber() { return getFieldValue(this.caseRecord, CASE_NUMBER); }
    get subject() { return getFieldValue(this.caseRecord, SUBJECT); }
    get status() { return getFieldValue(this.caseRecord, STATUS); }
    get priority() { return getFieldValue(this.caseRecord, PRIORITY); }
    get caseType() { return getFieldValue(this.caseRecord, TYPE); }
    get reason() { return getFieldValue(this.caseRecord, REASON); }
    get description() { return getFieldValue(this.caseRecord, DESCRIPTION); }
    get contactName() { return getFieldValue(this.caseRecord, CONTACT_NAME); }
    get contactVip() { return getFieldValue(this.caseRecord, CONTACT_VIP); }
    get ownerName() { return getFieldValue(this.caseRecord, OWNER_NAME); }
    get createdDate() { return getFieldValue(this.caseRecord, CREATED_DATE); }
    get origin() { return getFieldValue(this.caseRecord, ORIGIN); }

    /* ── Formatted date ── */
    get formattedCreatedDate() {
        if (!this.createdDate) return '--';
        const d = new Date(this.createdDate);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    /* ── Case age ── */
    get caseAge() {
        if (!this.createdDate) return '--';
        const created = new Date(this.createdDate);
        const now = new Date();
        const diffMs = now - created;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours < 24) return `${diffHours}h`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ${diffHours % 24}h`;
    }

    /* ── Status badge class ── */
    get statusBadgeClass() {
        const s = (this.status || '').toLowerCase().replace(/\s+/g, '-');
        return `badge badge--status badge--${s}`;
    }

    /* ── Priority badge class ── */
    get priorityBadgeClass() {
        const p = (this.priority || '').toLowerCase();
        return `badge badge--priority badge--${p}`;
    }

    get isHighPriority() {
        return (this.priority || '').toLowerCase() === 'high';
    }

    /* ── SLA helpers ── */
    get slaPercentage() {
        const order = STATUS_ORDER[this.status] !== undefined ? STATUS_ORDER[this.status] : 0;
        return Math.min(Math.round(((order + 1) / 4) * 100), 100);
    }

    get slaBarStyle() {
        return `width: ${this.slaPercentage}%`;
    }

    get slaTimeRemaining() {
        if (!this.createdDate) return '--';
        const created = new Date(this.createdDate);
        const slaDeadline = new Date(created.getTime() + 24 * 60 * 60 * 1000);
        const now = new Date();
        const remaining = slaDeadline - now;
        if (remaining <= 0) return 'Breached';
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m remaining`;
    }

    get isSlaBreach() {
        if (!this.createdDate) return false;
        const created = new Date(this.createdDate);
        const slaDeadline = new Date(created.getTime() + 24 * 60 * 60 * 1000);
        return new Date() > slaDeadline;
    }

    get slaBarClass() {
        return this.isSlaBreach ? 'sla-bar-fill sla-bar-fill--breach' : 'sla-bar-fill';
    }

    get slaLabelClass() {
        return this.isSlaBreach ? 'sla-time sla-time--breach' : 'sla-time';
    }

    /* ── Timeline steps ── */
    get timelineSteps() {
        const currentIndex = this._currentStepIndex;
        return STATUS_STEPS.map((step, idx) => {
            let state;
            if (idx < currentIndex) state = 'done';
            else if (idx === currentIndex) state = 'current';
            else state = 'todo';

            return {
                ...step,
                state,
                stepNumber: idx + 1,
                isDone: state === 'done',
                isCurrent: state === 'current',
                isTodo: state === 'todo',
                cssClass: `step step--${state}`,
                connectorClass: idx < STATUS_STEPS.length - 1 ? `connector connector--${idx < currentIndex ? 'done' : 'todo'}` : ''
            };
        });
    }

    get _currentStepIndex() {
        const s = this.status;
        if (s === 'New') return 0;
        if (s === 'Working') return 2;
        if (s === 'Escalated') return 4;
        if (s === 'Closed') return 5;
        return 0;
    }

    /* ── Tab management ── */
    get isDetailsTab() { return this.activeTab === 'details'; }
    get isResolutionTab() { return this.activeTab === 'resolution'; }
    get isRelatedTab() { return this.activeTab === 'related'; }
    get isAuditTab() { return this.activeTab === 'audit'; }

    get detailsTabClass() { return `tab-btn${this.activeTab === 'details' ? ' tab-btn--active' : ''}`; }
    get resolutionTabClass() { return `tab-btn${this.activeTab === 'resolution' ? ' tab-btn--active' : ''}`; }
    get relatedTabClass() { return `tab-btn${this.activeTab === 'related' ? ' tab-btn--active' : ''}`; }
    get auditTabClass() { return `tab-btn${this.activeTab === 'audit' ? ' tab-btn--active' : ''}`; }

    handleTabClick(event) {
        this.activeTab = event.currentTarget.dataset.tab;
    }

    /* ── Quick update form ── */
    get statusOptions() {
        return [
            { label: 'New', value: 'New' },
            { label: 'Working', value: 'Working' },
            { label: 'Escalated', value: 'Escalated' },
            { label: 'Closed', value: 'Closed' }
        ];
    }

    handleStatusChange(event) {
        this.quickStatus = event.target.value;
    }

    handleNoteChange(event) {
        this.quickNote = event.target.value;
    }

    async handleSaveNote() {
        if (this.isSaving) return;
        this.isSaving = true;
        try {
            if (this.quickStatus && this.quickStatus !== this.status) {
                await updateCaseStatus({ caseId: this.recordId, status: this.quickStatus });
            }
            this.quickNote = '';
        } catch (err) {
            console.error('Save failed:', err);
        } finally {
            this.isSaving = false;
        }
    }

    async handleResolve() {
        if (this.isSaving) return;
        this.isSaving = true;
        try {
            await updateCaseStatus({ caseId: this.recordId, status: 'Closed' });
            this.quickStatus = 'Closed';
        } catch (err) {
            console.error('Resolve failed:', err);
        } finally {
            this.isSaving = false;
        }
    }

    async handleEscalate() {
        if (this.isSaving) return;
        this.isSaving = true;
        try {
            await updateCaseStatus({ caseId: this.recordId, status: 'Escalated' });
            this.quickStatus = 'Escalated';
        } catch (err) {
            console.error('Escalate failed:', err);
        } finally {
            this.isSaving = false;
        }
    }

    /* ── Navigation ── */
    handleEdit() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.recordId,
                objectApiName: 'Case',
                actionName: 'edit'
            }
        });
    }

    handleBack() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Case',
                actionName: 'list'
            }
        });
    }

    /* ── Owner initials for avatar ── */
    get ownerInitials() {
        const name = this.ownerName;
        if (!name) return '?';
        const parts = name.trim().split(/\s+/);
        let result = '';
        for (const p of parts) {
            if (p) result += p.charAt(0).toUpperCase();
        }
        return result.length > 2 ? result.substring(0, 2) : result;
    }

    /* ── Description presence ── */
    get hasDescription() { return !!this.description; }
    get hasContactName() { return !!this.contactName; }
    get isVip() { return !!this.contactVip; }
    get displayType() { return this.caseType || '--'; }
    get displayReason() { return this.reason || '--'; }
    get displayOrigin() { return this.origin || '--'; }
}
