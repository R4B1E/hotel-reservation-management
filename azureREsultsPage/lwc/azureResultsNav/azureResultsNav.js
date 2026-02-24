import { LightningElement, api, track } from 'lwc';

export default class AzureResultsNav extends LightningElement {
    @api checkIn;
    @api checkOut;
    @api guests;

    @track editOpen      = false;
    @track localCheckIn;
    @track localCheckOut;
    @track localGuests;

    guestOptions = [
        { value: '1 Adult',           label: '1 Adult' },
        { value: '2 Adults',          label: '2 Adults' },
        { value: '2 Adults, 1 Child', label: '2 Adults, 1 Child' },
        { value: '2 Adults, 2 Children', label: '2 Adults, 2 Children' },
        { value: '3 Adults',          label: '3 Adults' },
    ];

    connectedCallback() {
        this.localCheckIn  = this.checkIn;
        this.localCheckOut = this.checkOut;
        this.localGuests   = this.guests;
    }

    toggleEdit() { this.editOpen = !this.editOpen; }

    handleCI(e)     { this.localCheckIn  = e.target.value; }
    handleCO(e)     { this.localCheckOut = e.target.value; }
    handleGuests(e) { this.localGuests   = e.target.value; }

    applySearch() {
        this.editOpen = false;
        this.dispatchEvent(new CustomEvent('modifysearch', {
            bubbles: true, composed: true,
            detail: {
                checkIn:  this.localCheckIn,
                checkOut: this.localCheckOut,
                guests:   this.localGuests
            }
        }));
    }
}
