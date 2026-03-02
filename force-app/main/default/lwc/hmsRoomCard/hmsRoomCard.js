import { LightningElement, api } from 'lwc';

export default class HmsRoomCard extends LightningElement {
    @api room; // { id, roomNumber, category, pricePerNight, roomStatus, hkStatus, floor, bedType, viewType, maxGuests, isOccupied, guestName, checkOut }

    get cardClass() {
        const st = (this.room && this.room.roomStatus) ? this.room.roomStatus.toLowerCase() : '';
        return `room-card hms-card room-card--${st}`;
    }

    get headerGradient() {
        const colors = {
            'Presidential Suite': 'linear-gradient(135deg, #f59e0b, #d97706)',
            'Duplex': 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
            'Junior Suite': 'linear-gradient(135deg, #3b82f6, #2563eb)',
            'Regular': 'linear-gradient(135deg, #10b981, #059669)'
        };
        const cat = this.room ? this.room.category : '';
        return `background: ${colors[cat] || 'linear-gradient(135deg, #3b82f6, #6366f1)'}`;
    }

    get showGuestInfo() {
        return this.room && this.room.roomStatus === 'Occupied' && this.room.guestName;
    }

    get priceDisplay() {
        return this.room && this.room.pricePerNight ? '$' + Number(this.room.pricePerNight).toLocaleString() : '';
    }

    handleCardClick() {
        this.dispatchEvent(new CustomEvent('roomselect', {
            detail: { roomId: this.room.id },
            bubbles: true, composed: true
        }));
    }
}
