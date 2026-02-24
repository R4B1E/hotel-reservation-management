import { LightningElement, api } from 'lwc';

export default class AzureCheckoutConfirmation extends LightningElement {
    @api room;
    @api checkIn;
    @api checkOut;
    @api nights;
    @api guestData;
    @api confirmationCode;

    get nightLabel()     { return this.nights === 1 ? 'night' : 'nights'; }
    get guestFirstName() { return this.guestData?.firstName || 'Dear Guest'; }
}
