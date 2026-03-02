import { LightningElement, api, wire } from 'lwc';
import getReservationActivity from '@salesforce/apex/HMSReservationController.getReservationActivity';
import addReservationNote from '@salesforce/apex/HMSReservationController.addReservationNote';
import { refreshApex } from '@salesforce/apex';

export default class HmsActivityRail extends LightningElement {
    @api reservationId;
    activities = [];
    noteText = '';
    _wiredResult;

    @wire(getReservationActivity, { resId: '$reservationId' })
    wiredActivity(result) {
        this._wiredResult = result;
        if (result.data) this.activities = result.data;
    }

    get hasActivities() { return this.activities && this.activities.length > 0; }

    handleNoteInput(event) {
        this.noteText = event.target.value;
    }

    async handleAddNote() {
        if (!this.noteText || !this.reservationId) return;
        try {
            await addReservationNote({ resId: this.reservationId, body: this.noteText });
            this.noteText = '';
            return refreshApex(this._wiredResult);
        } catch (error) {
            console.error('Add note error:', error);
        }
    }

    handleKeyPress(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.handleAddNote();
        }
    }
}
