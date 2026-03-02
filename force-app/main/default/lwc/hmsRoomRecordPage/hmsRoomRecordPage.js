import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { loadHmsTheme } from 'c/hmsThemeLoader';

/* ── Hotel_Room__c direct fields ── */
import ROOM_NUMBER from '@salesforce/schema/Hotel_Room__c.Room_Number__c';
import CATEGORY from '@salesforce/schema/Hotel_Room__c.Category__c';
import FLOOR from '@salesforce/schema/Hotel_Room__c.Floor__c';
import ROOM_STATUS from '@salesforce/schema/Hotel_Room__c.Room_Status__c';
import HK_STATUS from '@salesforce/schema/Hotel_Room__c.Housekeeping_Status__c';
import LAST_CLEANED from '@salesforce/schema/Hotel_Room__c.Last_Cleaned__c';
import PRICE from '@salesforce/schema/Hotel_Room__c.Price_Per_Night__c';
import BED_TYPE from '@salesforce/schema/Hotel_Room__c.Bed_Type__c';
import VIEW_TYPE from '@salesforce/schema/Hotel_Room__c.View_Type__c';
import SQUARE_METERS from '@salesforce/schema/Hotel_Room__c.Square_Meters__c';
import MAX_GUESTS from '@salesforce/schema/Hotel_Room__c.Max_Guests__c';
import CURRENT_RES from '@salesforce/schema/Hotel_Room__c.Current_Reservation__c';
import ASSIGNED_HK from '@salesforce/schema/Hotel_Room__c.Assigned_Housekeeper__c';

/* ── Spanning fields (Current Reservation) ── */
const RES_GUEST_FIRST = 'Hotel_Room__c.Current_Reservation__r.Guest_First_Name__c';
const RES_GUEST_LAST  = 'Hotel_Room__c.Current_Reservation__r.Guest_Last_Name__c';
const RES_CHECK_IN    = 'Hotel_Room__c.Current_Reservation__r.Check_In_Date__c';
const RES_CHECK_OUT   = 'Hotel_Room__c.Current_Reservation__r.Check_Out_Date__c';
const RES_STATUS      = 'Hotel_Room__c.Current_Reservation__r.Status__c';
const RES_CONFIRM_NUM = 'Hotel_Room__c.Current_Reservation__r.Confirmation_Number__c';
const RES_NIGHTS      = 'Hotel_Room__c.Current_Reservation__r.Nights__c';

/* ── Spanning field (Assigned Housekeeper - User) ── */
const HK_NAME = 'Hotel_Room__c.Assigned_Housekeeper__r.Name';

const FIELDS = [
    ROOM_NUMBER, CATEGORY, FLOOR, ROOM_STATUS, HK_STATUS,
    LAST_CLEANED, PRICE, BED_TYPE, VIEW_TYPE, SQUARE_METERS,
    MAX_GUESTS, CURRENT_RES, ASSIGNED_HK,
    RES_GUEST_FIRST, RES_GUEST_LAST, RES_CHECK_IN, RES_CHECK_OUT,
    RES_STATUS, RES_CONFIRM_NUM, RES_NIGHTS, HK_NAME
];

/* Static amenity list (could be stored on the record or custom metadata in future) */
const AMENITIES = [
    'Bathtub', 'Rain Shower', '65" Smart TV', 'Nespresso Machine',
    'High-Speed WiFi', 'Mini Kitchen', 'Climate Control', 'Electronic Safe',
    'Walk-in Wardrobe', 'Full-Length Mirror', 'Seating Area', 'Minibar'
];

export default class HmsRoomRecordPage extends LightningElement {
    @api recordId;

    activeTab = 'overview';
    isLoading = true;
    error;

    /* ── Lifecycle ── */
    connectedCallback() {
        loadHmsTheme(this);
    }

    /* ── Wire getRecord ── */
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredRoom({ data, error }) {
        if (data) {
            this.record = data;
            this.isLoading = false;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.isLoading = false;
        }
    }

    record;

    /* ── Field value getters ── */
    get roomNumber()   { return this.record ? getFieldValue(this.record, ROOM_NUMBER) : ''; }
    get category()     { return this.record ? getFieldValue(this.record, CATEGORY) : ''; }
    get floor()        { return this.record ? getFieldValue(this.record, FLOOR) : ''; }
    get roomStatus()   { return this.record ? getFieldValue(this.record, ROOM_STATUS) : ''; }
    get hkStatus()     { return this.record ? getFieldValue(this.record, HK_STATUS) : ''; }
    get lastCleaned()  { return this.record ? this._formatDateTime(getFieldValue(this.record, LAST_CLEANED)) : ''; }
    get price()        { return this.record ? getFieldValue(this.record, PRICE) : 0; }
    get bedType()      { return this.record ? getFieldValue(this.record, BED_TYPE) : ''; }
    get viewType()     { return this.record ? getFieldValue(this.record, VIEW_TYPE) : ''; }
    get squareMeters() { return this.record ? getFieldValue(this.record, SQUARE_METERS) : ''; }
    get maxGuests()    { return this.record ? getFieldValue(this.record, MAX_GUESTS) : ''; }
    get currentResId() { return this.record ? getFieldValue(this.record, CURRENT_RES) : null; }
    get assignedHkId() { return this.record ? getFieldValue(this.record, ASSIGNED_HK) : null; }

    /* Spanning getters */
    get guestFirstName() {
        return this.record ? this._getSpanning(RES_GUEST_FIRST) : '';
    }
    get guestLastName() {
        return this.record ? this._getSpanning(RES_GUEST_LAST) : '';
    }
    get resCheckIn() {
        return this.record ? this._formatDate(this._getSpanning(RES_CHECK_IN)) : '';
    }
    get resCheckOut() {
        return this.record ? this._formatDate(this._getSpanning(RES_CHECK_OUT)) : '';
    }
    get resCheckOutShort() {
        return this.record ? this._formatDateShort(this._getSpanning(RES_CHECK_OUT)) : '';
    }
    get resStatus() {
        return this.record ? this._getSpanning(RES_STATUS) : '';
    }
    get resConfirmNum() {
        return this.record ? this._getSpanning(RES_CONFIRM_NUM) : '';
    }
    get resNights() {
        return this.record ? this._getSpanning(RES_NIGHTS) : '';
    }
    get assignedHkName() {
        return this.record ? this._getSpanning(HK_NAME) : '';
    }

    /* ── Computed display values ── */
    get pageTitle() {
        return `${this.roomNumber || ''} \u00B7 ${this.category || ''}`;
    }

    get recordTypeLabel() {
        return `Room \u00B7 Floor ${this.floor || ''} \u00B7 ${this.viewType || ''}`;
    }

    get subtitleInfo() {
        const parts = [];
        if (this.bedType) parts.push(this.bedType);
        if (this.squareMeters) parts.push(this.squareMeters + ' m\u00B2');
        if (this.maxGuests) parts.push('Max ' + this.maxGuests + ' guests');
        return parts.join(' \u00B7 ');
    }

    get priceDisplay() {
        return this.price ? '$' + Number(this.price).toLocaleString() : '$0';
    }

    get floorDisplay() {
        const f = this.floor;
        if (!f) return '';
        const n = Number(f);
        if (isNaN(n)) return f;
        const s = ['th','st','nd','rd'];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }

    get hasCurrentReservation() {
        return !!this.currentResId;
    }

    get guestFullName() {
        const first = this.guestFirstName || '';
        const last = this.guestLastName || '';
        return (first + ' ' + last).trim() || 'N/A';
    }

    get resDateRange() {
        const ci = this.resCheckIn;
        const co = this.resCheckOut;
        if (!ci && !co) return '';
        return `${ci || '?'} \u2013 ${co || '?'}`;
    }

    get resStaySummary() {
        const range = this.resDateRange;
        const nights = this.resNights;
        if (!range) return '';
        return nights ? `${range} \u00B7 ${nights} nights` : range;
    }

    /* ── HK & Room Status badge CSS classes ── */
    get hkBadgeClass() {
        return 'badge badge--' + this._slugify(this.hkStatus);
    }
    get roomStatusBadgeClass() {
        return 'badge badge--' + this._slugify(this.roomStatus);
    }
    get resBadgeClass() {
        return 'badge badge--' + this._slugify(this.resStatus);
    }

    /* ── Amenities ── */
    get amenityChips() {
        return AMENITIES.map((a, i) => ({ key: 'am-' + i, label: a }));
    }

    /* ── 30-Day Availability Grid ── */
    get availabilityDays() {
        const days = [];
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            const dayNum = d.getDate();
            // Simulate: current res days booked, rest available
            const isBooked = i < 4 && this.hasCurrentReservation;
            days.push({
                key: 'day-' + i,
                day: dayNum,
                className: isBooked ? 'avail-cell avail-cell--booked' : 'avail-cell avail-cell--available'
            });
        }
        return days;
    }

    /* ── Tab management ── */
    get tabs() {
        return [
            { name: 'overview', label: 'Overview' },
            { name: 'availability', label: 'Availability' },
            { name: 'maintenance', label: 'Maintenance' },
            { name: 'revenue', label: 'Revenue' },
            { name: 'history', label: 'History' }
        ].map(t => ({
            ...t,
            className: t.name === this.activeTab ? 'inner-tab inner-tab--active' : 'inner-tab'
        }));
    }

    get isOverviewTab()     { return this.activeTab === 'overview'; }
    get isAvailabilityTab() { return this.activeTab === 'availability'; }
    get isMaintenanceTab()  { return this.activeTab === 'maintenance'; }
    get isRevenueTab()      { return this.activeTab === 'revenue'; }
    get isHistoryTab()      { return this.activeTab === 'history'; }

    handleTabClick(event) {
        this.activeTab = event.currentTarget.dataset.tab;
    }

    /* ── Highlights strip data ── */
    get highlightItems() {
        return [
            { key: 'hl-type', label: 'Room Type', value: this.category || 'N/A', cls: 'hl-value' },
            { key: 'hl-floor', label: 'Floor', value: this.floorDisplay || 'N/A', cls: 'hl-value' },
            { key: 'hl-view', label: 'View', value: this.viewType || 'N/A', cls: 'hl-value' },
            { key: 'hl-rate', label: 'Rate / Night', value: this.priceDisplay, cls: 'hl-value hl-value--green' },
            { key: 'hl-hk', label: 'HK Status', value: this.hkStatus || 'N/A', cls: 'hl-value hl-value--' + this._hkColorKey(this.hkStatus) },
            { key: 'hl-cleaned', label: 'Last Cleaned', value: this.lastCleaned || 'N/A', cls: 'hl-value' },
            { key: 'hl-guest', label: 'Current Guest', value: this.hasCurrentReservation ? this.guestFullName : 'Vacant', cls: this.hasCurrentReservation ? 'hl-value hl-value--accent' : 'hl-value hl-value--muted' },
            { key: 'hl-checkout', label: 'Check-Out', value: this.hasCurrentReservation ? this.resCheckOutShort : '\u2014', cls: this.hasCurrentReservation ? 'hl-value hl-value--gold' : 'hl-value hl-value--muted' }
        ];
    }

    /* ── Private helpers ── */
    _getSpanning(fieldPath) {
        if (!this.record || !this.record.fields) return '';
        const parts = fieldPath.replace('Hotel_Room__c.', '').split('.');
        let node = this.record.fields;
        for (const p of parts) {
            if (!node || !node[p]) return '';
            node = node[p].value;
            if (node && typeof node === 'object' && node.fields) {
                node = node.fields;
            }
        }
        return node || '';
    }

    _formatDate(val) {
        if (!val) return '';
        const d = new Date(val);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    _formatDateShort(val) {
        if (!val) return '';
        const d = new Date(val);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    _formatDateTime(val) {
        if (!val) return '';
        const d = new Date(val);
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();
        const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        return isToday ? `Today ${time}` : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + time;
    }

    _slugify(val) {
        return val ? val.toLowerCase().replace(/\s+/g, '-') : 'unknown';
    }

    _hkColorKey(status) {
        if (!status) return 'muted';
        const s = status.toLowerCase();
        if (s === 'clean') return 'green';
        if (s === 'dirty') return 'gold';
        if (s === 'in progress' || s === 'in-progress') return 'accent';
        if (s === 'maintenance') return 'red';
        return 'muted';
    }
}
