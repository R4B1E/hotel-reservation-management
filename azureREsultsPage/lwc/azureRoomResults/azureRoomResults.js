import { LightningElement, api, track } from 'lwc';

export default class AzureRoomResults extends LightningElement {
    @api rooms  = [];
    @api checkIn;
    @api checkOut;
    @api nights;

    @track activeImages = {};  // roomId → imageIndex

    get hasRooms() { return this.rooms && this.rooms.length > 0; }

    get enrichedRooms() {
        return this.rooms.map(room => {
            const imgIdx      = this.activeImages[room.id] || 0;
            const totalPrice  = room.pricePerNight * this.nights;
            const topAmenities = room.amenities.slice(0, 4);
            const imageDots   = room.images.map((_, i) => ({
                idx: i,
                cls: i === imgIdx ? 'dot active' : 'dot'
            }));

            return {
                ...room,
                currentImage:  room.images[imgIdx],
                totalPrice:    totalPrice.toLocaleString(),
                topAmenities,
                imageDots,
                cardWrapClass: 'room-card' + (room.featured ? ' featured' : ''),
            };
        });
    }

    handleDotClick(e) {
        e.stopPropagation();
        const roomId = e.currentTarget.dataset.room;
        const imgIdx = parseInt(e.currentTarget.dataset.img, 10);
        this.activeImages = { ...this.activeImages, [roomId]: imgIdx };
    }

    handleSelect(e) {
        e.stopPropagation();
        const id = e.currentTarget.dataset.id;
        if (!id) return;
        this.dispatchEvent(new CustomEvent('roomselect', {
            bubbles: true, composed: true,
            detail: { roomId: id }
        }));
    }
}
