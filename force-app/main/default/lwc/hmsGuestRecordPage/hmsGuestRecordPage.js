import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import { loadHmsTheme } from 'c/hmsThemeLoader';

import FIRST_NAME from '@salesforce/schema/Contact.FirstName';
import LAST_NAME from '@salesforce/schema/Contact.LastName';
import EMAIL from '@salesforce/schema/Contact.Email';
import PHONE from '@salesforce/schema/Contact.Phone';
import VIP_STATUS from '@salesforce/schema/Contact.VIP_Status__c';
import NATIONALITY from '@salesforce/schema/Contact.Nationality__c';
import TOTAL_SPENT from '@salesforce/schema/Contact.Total_Spent__c';
import MAILING_STREET from '@salesforce/schema/Contact.MailingStreet';
import MAILING_CITY from '@salesforce/schema/Contact.MailingCity';
import MAILING_STATE from '@salesforce/schema/Contact.MailingState';
import MAILING_POSTAL from '@salesforce/schema/Contact.MailingPostalCode';
import MAILING_COUNTRY from '@salesforce/schema/Contact.MailingCountry';
import ACCOUNT_NAME from '@salesforce/schema/Contact.Account.Name';

const CONTACT_FIELDS = [
    FIRST_NAME, LAST_NAME, EMAIL, PHONE,
    VIP_STATUS, NATIONALITY, TOTAL_SPENT,
    MAILING_STREET, MAILING_CITY, MAILING_STATE,
    MAILING_POSTAL, MAILING_COUNTRY,
    ACCOUNT_NAME
];

export default class HmsGuestRecordPage extends NavigationMixin(LightningElement) {
    @api recordId;
    contactRecord;
    isLoading = true;
    activeTab = 'profile';
    noteText = '';

    connectedCallback() {
        loadHmsTheme(this);
    }

    /* ── Wire: Standard Contact record ── */
    @wire(getRecord, { recordId: '$recordId', fields: CONTACT_FIELDS })
    wiredContact({ data, error }) {
        if (data) {
            this.contactRecord = data;
            this.isLoading = false;
        } else if (error) {
            console.error('[GuestRecordPage] getRecord error:', error);
            this.isLoading = false;
        }
    }

    /* ── Computed: data availability ── */
    get hasData() {
        return !!this.contactRecord;
    }

    /* ── Computed: Contact field helpers ── */
    get firstName() { return getFieldValue(this.contactRecord, FIRST_NAME) || ''; }
    get lastName() { return getFieldValue(this.contactRecord, LAST_NAME) || ''; }
    get fullName() { return (this.firstName + ' ' + this.lastName).trim(); }
    get email() { return getFieldValue(this.contactRecord, EMAIL) || ''; }
    get phone() { return getFieldValue(this.contactRecord, PHONE) || ''; }
    get isVip() { return getFieldValue(this.contactRecord, VIP_STATUS) === true; }
    get nationality() { return getFieldValue(this.contactRecord, NATIONALITY) || ''; }
    get totalSpent() { return getFieldValue(this.contactRecord, TOTAL_SPENT) || 0; }
    get accountName() { return getFieldValue(this.contactRecord, ACCOUNT_NAME) || ''; }

    /* ── Computed: derived values ── */
    get initials() {
        return (this.firstName.charAt(0) + this.lastName.charAt(0)).toUpperCase();
    }

    get formattedTotalSpent() {
        return '$' + Number(this.totalSpent).toLocaleString('en-US', { minimumFractionDigits: 0 });
    }

    get mailingAddress() {
        const parts = [
            getFieldValue(this.contactRecord, MAILING_STREET),
            getFieldValue(this.contactRecord, MAILING_CITY),
            getFieldValue(this.contactRecord, MAILING_STATE),
            getFieldValue(this.contactRecord, MAILING_POSTAL)
        ].filter(Boolean);
        return parts.join(', ');
    }

    get mailingCountry() {
        return getFieldValue(this.contactRecord, MAILING_COUNTRY) || '';
    }

    get vipLabel() {
        return this.isVip ? 'VIP' : 'Regular';
    }

    /* ── Tab management ── */
    get isProfileTab() { return this.activeTab === 'profile'; }
    get isHistoryTab() { return this.activeTab === 'history'; }
    get isPreferencesTab() { return this.activeTab === 'preferences'; }
    get isLoyaltyTab() { return this.activeTab === 'loyalty'; }
    get isCasesTab() { return this.activeTab === 'cases'; }

    get profileTabClass() { return 'tab-btn' + (this.activeTab === 'profile' ? ' tab-btn--active' : ''); }
    get historyTabClass() { return 'tab-btn' + (this.activeTab === 'history' ? ' tab-btn--active' : ''); }
    get preferencesTabClass() { return 'tab-btn' + (this.activeTab === 'preferences' ? ' tab-btn--active' : ''); }
    get loyaltyTabClass() { return 'tab-btn' + (this.activeTab === 'loyalty' ? ' tab-btn--active' : ''); }
    get casesTabClass() { return 'tab-btn' + (this.activeTab === 'cases' ? ' tab-btn--active' : ''); }

    handleTabClick(event) {
        this.activeTab = event.currentTarget.dataset.tab;
    }

    /* ── Preference chips (sample data) ── */
    get preferenceChips() {
        return [
            { key: 'hf', label: 'High Floor' },
            { key: 'ns', label: 'Non-Smoking' },
            { key: 'kb', label: 'King Bed' },
            { key: 'cv', label: 'City View' },
            { key: 'lc', label: 'Late Check-out' },
            { key: 'ep', label: 'Extra Pillows' }
        ];
    }

    /* ── Key metrics for rail ── */
    get keyMetrics() {
        return [
            { key: 'spent', label: 'Total Spent',        value: this.formattedTotalSpent },
            { key: 'avg',   label: 'Avg Stay Length',     value: '\u2014' },
            { key: 'last',  label: 'Last Visit',          value: '\u2014' },
            { key: 'freq',  label: 'Visit Frequency',     value: '\u2014' }
        ];
    }

    /* ── Note handling ── */
    handleNoteInput(event) {
        this.noteText = event.target.value;
    }

    handleAddNote() {
        if (this.noteText.trim()) {
            // Placeholder: In production, save note via Apex
            console.log('Note added:', this.noteText);
            this.noteText = '';
        }
    }

    /* ── Navigation actions ── */
    handleNewReservation() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Reservation__c',
                actionName: 'new'
            }
        });
    }

    handleSendEmail() {
        if (this.email) {
            window.open('mailto:' + this.email, '_blank');
        }
    }

    handleEdit() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.recordId,
                objectApiName: 'Contact',
                actionName: 'edit'
            }
        });
    }

    handleBack() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Contact',
                actionName: 'list'
            }
        });
    }
}
