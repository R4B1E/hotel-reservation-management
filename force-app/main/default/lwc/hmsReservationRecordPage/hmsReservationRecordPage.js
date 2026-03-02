import { LightningElement, api, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { loadHmsTheme } from 'c/hmsThemeLoader';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getReservationDetail from '@salesforce/apex/HMSReservationController.getReservationDetail';
import getReservationActivity from '@salesforce/apex/HMSReservationController.getReservationActivity';
import checkInGuest from '@salesforce/apex/HMSReservationController.checkInGuest';
import checkOutGuest from '@salesforce/apex/HMSReservationController.checkOutGuest';
import addReservationNote from '@salesforce/apex/HMSReservationController.addReservationNote';

const TABS = ['Details', 'Services & Charges', 'Payment', 'Documents', 'History'];

export default class HmsReservationRecordPage extends NavigationMixin(LightningElement) {
    @api recordId;

    @track reservation;
    @track activities = [];
    activeTab = 'Details';
    noteBody = '';
    isLoading = true;
    isSavingNote = false;
    isProcessing = false;

    _wiredDetail;
    _wiredActivity;

    connectedCallback() {
        loadHmsTheme(this);
    }

    /* ── Wires ── */

    @wire(getReservationDetail, { resId: '$recordId' })
    wiredDetail(result) {
        this._wiredDetail = result;
        if (result.data) {
            this.reservation = result.data;
            this.isLoading = false;
        } else if (result.error) {
            console.error('[ReservationRecordPage] detail error', result.error);
            this.isLoading = false;
        }
    }

    @wire(getReservationActivity, { resId: '$recordId' })
    wiredActivity(result) {
        this._wiredActivity = result;
        if (result.data) {
            this.activities = result.data.map(a => ({
                ...a,
                formattedTime: this.formatTimestamp(a.timestamp),
                avatarColor: this.getAvatarColor(a.initials)
            }));
        } else if (result.error) {
            console.error('[ReservationRecordPage] activity error', result.error);
        }
    }

    /* ── Getters ── */

    get hasReservation() {
        return !!this.reservation;
    }

    get tabs() {
        return TABS.map(t => ({
            label: t,
            value: t,
            className: 'it' + (this.activeTab === t ? ' it--active' : '')
        }));
    }

    get isDetailsTab() { return this.activeTab === 'Details'; }
    get isServicesTab() { return this.activeTab === 'Services & Charges'; }
    get isPaymentTab() { return this.activeTab === 'Payment'; }
    get isDocumentsTab() { return this.activeTab === 'Documents'; }
    get isHistoryTab() { return this.activeTab === 'History'; }

    get guestInitials() {
        if (!this.reservation) return '?';
        const fn = this.reservation.guestFirstName || '';
        const ln = this.reservation.guestLastName || '';
        return ((fn.charAt(0) || '') + (ln.charAt(0) || '')).toUpperCase() || '?';
    }

    get statusBadgeClass() {
        if (!this.reservation) return 'badge';
        const s = (this.reservation.status || '').toLowerCase().replace(/\s+/g, '-');
        const map = {
            'confirmed': 'badge badge--confirmed',
            'checked-in': 'badge badge--checkedin',
            'checked-out': 'badge badge--checkedout',
            'cancelled': 'badge badge--cancelled',
            'pending': 'badge badge--pending',
            'no-show': 'badge badge--noshow'
        };
        return map[s] || 'badge';
    }

    get statusDot() {
        const s = (this.reservation?.status || '').toLowerCase();
        if (s.includes('confirmed')) return 'dot-green';
        if (s.includes('checked in')) return 'dot-blue';
        if (s.includes('checked out')) return 'dot-muted';
        if (s.includes('cancelled')) return 'dot-red';
        return 'dot-gold';
    }

    get isVip() {
        return this.reservation?.isVip === true;
    }

    get showCheckIn() {
        return this.reservation?.status === 'Confirmed';
    }

    get showCheckOut() {
        return this.reservation?.status === 'Checked In';
    }

    get formattedCheckIn() {
        return this.formatDate(this.reservation?.checkInDate);
    }

    get formattedCheckOut() {
        return this.formatDate(this.reservation?.checkOutDate);
    }

    get formattedTotal() {
        return this.formatCurrency(this.reservation?.total);
    }

    get formattedSubtotal() {
        return this.formatCurrency(this.reservation?.subtotal);
    }

    get formattedTaxes() {
        return this.formatCurrency(this.reservation?.taxes);
    }

    get formattedRatePerNight() {
        return this.formatCurrency(this.reservation?.roomRatePerNight);
    }

    get formattedRoomRate() {
        return this.formatCurrency(this.reservation?.roomRate);
    }

    get roomDisplay() {
        if (!this.reservation) return '';
        return (this.reservation.roomNumber || '') +
            (this.reservation.roomCategory ? ' \u00B7 ' + this.reservation.roomCategory : '');
    }

    get floorView() {
        if (!this.reservation) return '';
        const parts = [];
        if (this.reservation.roomFloor) parts.push(this.ordinal(this.reservation.roomFloor) + ' Floor');
        if (this.reservation.roomView) parts.push(this.reservation.roomView);
        return parts.join(' \u00B7 ');
    }

    get roomSizeDisplay() {
        if (!this.reservation?.roomSqm) return '';
        return this.reservation.roomSqm + ' m\u00B2';
    }

    get hkBadgeClass() {
        const s = (this.reservation?.hkStatus || '').toLowerCase();
        if (s === 'clean') return 'badge badge--clean';
        if (s === 'dirty') return 'badge badge--dirty';
        if (s === 'maintenance') return 'badge badge--maintenance';
        return 'badge';
    }

    get hasSpecialRequests() {
        return !!this.reservation?.specialRequests;
    }

    get hasActivities() {
        return this.activities && this.activities.length > 0;
    }

    get paymentBadgeClass() {
        const s = (this.reservation?.paymentStatus || '').toLowerCase();
        if (s === 'paid') return 'badge badge--confirmed';
        if (s === 'partial') return 'badge badge--pending';
        if (s === 'pending') return 'badge badge--pending';
        return 'badge';
    }

    /* ── Tab Handling ── */

    handleTabClick(event) {
        this.activeTab = event.currentTarget.dataset.tab;
    }

    /* ── Actions ── */

    async handleCheckIn() {
        if (this.isProcessing) return;
        this.isProcessing = true;
        try {
            await checkInGuest({ resId: this.recordId });
            this.toast('Success', 'Guest has been checked in.', 'success');
            await refreshApex(this._wiredDetail);
            await refreshApex(this._wiredActivity);
        } catch (error) {
            this.toast('Error', this.extractError(error), 'error');
        } finally {
            this.isProcessing = false;
        }
    }

    async handleCheckOut() {
        if (this.isProcessing) return;
        this.isProcessing = true;
        try {
            await checkOutGuest({ resId: this.recordId });
            this.toast('Success', 'Guest has been checked out.', 'success');
            await refreshApex(this._wiredDetail);
            await refreshApex(this._wiredActivity);
        } catch (error) {
            this.toast('Error', this.extractError(error), 'error');
        } finally {
            this.isProcessing = false;
        }
    }

    handleNoteChange(event) {
        this.noteBody = event.target.value;
    }

    async handleSaveNote() {
        if (!this.noteBody || !this.noteBody.trim() || this.isSavingNote) return;
        this.isSavingNote = true;
        try {
            await addReservationNote({ resId: this.recordId, body: this.noteBody.trim() });
            this.noteBody = '';
            this.toast('Success', 'Note saved.', 'success');
            await refreshApex(this._wiredActivity);
        } catch (error) {
            this.toast('Error', this.extractError(error), 'error');
        } finally {
            this.isSavingNote = false;
        }
    }

    handleEditRecord() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.recordId,
                objectApiName: 'Reservation__c',
                actionName: 'edit'
            }
        });
    }

    handleNavigateToGuest() {
        if (!this.reservation?.id) return;
        // Navigate to guest contact if available
    }

    handleNavigateToRoom() {
        if (!this.reservation?.roomId) return;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.reservation.roomId,
                objectApiName: 'Hotel_Room__c',
                actionName: 'view'
            }
        });
    }

    handleBackToList() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Reservation__c',
                actionName: 'list'
            }
        });
    }

    /* ── Helpers ── */

    formatDate(d) {
        if (!d) return '\u2014';
        const date = new Date(d);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    formatTimestamp(ts) {
        if (!ts) return '';
        const date = new Date(ts);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 60) return diffMins + 'm ago';
        const diffHrs = Math.floor(diffMins / 60);
        if (diffHrs < 24) return diffHrs + 'h ago';
        const diffDays = Math.floor(diffHrs / 24);
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return diffDays + 'd ago';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    formatCurrency(val) {
        if (val == null) return '\u2014';
        return '$' + Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    ordinal(n) {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }

    getAvatarColor(initials) {
        if (!initials) return 'background:rgba(100,116,139,0.2);color:#94a3b8';
        const colors = [
            'background:rgba(59,130,246,0.2);color:#60a5fa',
            'background:rgba(16,185,129,0.2);color:#34d399',
            'background:rgba(245,158,11,0.2);color:#fbbf24',
            'background:rgba(239,68,68,0.2);color:#f87171',
            'background:rgba(139,92,246,0.2);color:#a78bfa',
            'background:rgba(236,72,153,0.2);color:#f472b6'
        ];
        const idx = (initials.charCodeAt(0) + (initials.charCodeAt(1) || 0)) % colors.length;
        return colors[idx];
    }

    extractError(error) {
        if (error?.body?.message) return error.body.message;
        if (error?.message) return error.message;
        return 'An unexpected error occurred.';
    }

    toast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}
