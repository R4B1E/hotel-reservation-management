import { LightningElement, api } from 'lwc';

export default class AzureBookingSummaryPanel extends LightningElement {
    @api room;
    @api checkIn;
    @api checkOut;
    @api nights;
    @api guests;
    @api guestData;

    get nightLabel()  { return this.nights === 1 ? 'night' : 'nights'; }
    get subtotal()    { return (this.room.pricePerNight * this.nights).toLocaleString(); }
    get taxes()       { return Math.round(this.room.pricePerNight * this.nights * 0.12).toLocaleString(); }
    get total()       { return Math.round(this.room.pricePerNight * this.nights * 1.12).toLocaleString(); }

    get hasGuest()     { return this.guestData && (this.guestData.firstName || this.guestData.lastName); }
    get guestFullName(){ return [this.guestData?.firstName, this.guestData?.lastName].filter(Boolean).join(' '); }
}
