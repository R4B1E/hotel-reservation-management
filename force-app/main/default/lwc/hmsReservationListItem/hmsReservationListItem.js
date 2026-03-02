import { LightningElement, api } from 'lwc';

export default class HmsReservationListItem extends LightningElement {
    @api reservation;
    @api selected = false;

    get itemClass() {
        return `res-item${this.selected ? ' res-item--selected' : ''}`;
    }

    handleClick() {
        this.dispatchEvent(new CustomEvent('select', {
            detail: { id: this.reservation.id },
            bubbles: true, composed: true
        }));
    }
}
