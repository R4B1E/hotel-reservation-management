import { LightningElement, api } from 'lwc';

export default class HmsRecentReservations extends LightningElement {
    @api reservations = [];

    get hasData() {
        return this.reservations && this.reservations.length > 0;
    }
}
