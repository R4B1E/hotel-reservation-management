import { LightningElement, api } from 'lwc';

export default class AzureSearchSummary extends LightningElement {
    @api checkIn;
    @api checkOut;
    @api guests;
    @api nights;
    @api resultCount;

    get nightLabel()  { return this.nights === 1 ? 'night' : 'nights'; }
    get resultLabel() { return this.resultCount === 1 ? 'room' : 'rooms'; }
}
