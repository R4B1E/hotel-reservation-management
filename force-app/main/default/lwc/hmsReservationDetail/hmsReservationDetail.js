import { LightningElement, api } from 'lwc';

export default class HmsReservationDetail extends LightningElement {
    @api detail; // ReservationDetailWrapper
    activeTab = 'stay';

    get hasDetail() { return !!this.detail; }
    get isStayTab() { return this.activeTab === 'stay'; }
    get isGuestTab() { return this.activeTab === 'guest'; }
    get isRoomTab() { return this.activeTab === 'room'; }
    get isBillingTab() { return this.activeTab === 'billing'; }

    get canCheckIn() {
        return this.detail && this.detail.status === 'Confirmed';
    }
    get canCheckOut() {
        return this.detail && this.detail.status === 'Checked In';
    }

    handleTabClick(event) {
        this.activeTab = event.currentTarget.dataset.tab;
    }

    get tabClass() {
        return (tab) => `tab-btn${this.activeTab === tab ? ' tab-btn--active' : ''}`;
    }

    get stayTabClass() { return `tab-btn${this.activeTab === 'stay' ? ' tab-btn--active' : ''}`; }
    get guestTabClass() { return `tab-btn${this.activeTab === 'guest' ? ' tab-btn--active' : ''}`; }
    get roomTabClass() { return `tab-btn${this.activeTab === 'room' ? ' tab-btn--active' : ''}`; }
    get billingTabClass() { return `tab-btn${this.activeTab === 'billing' ? ' tab-btn--active' : ''}`; }

    handleCheckIn() {
        this.dispatchEvent(new CustomEvent('checkin', {
            detail: { id: this.detail.id },
            bubbles: true, composed: true
        }));
    }

    handleCheckOut() {
        this.dispatchEvent(new CustomEvent('checkout', {
            detail: { id: this.detail.id },
            bubbles: true, composed: true
        }));
    }
}
