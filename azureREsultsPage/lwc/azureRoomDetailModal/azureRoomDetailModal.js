import { LightningElement, api, track } from 'lwc';

export default class AzureRoomDetailModal extends LightningElement {
    @api room;
    @api checkIn;
    @api checkOut;
    @api nights;
    @api guests;

    @track activeImg = 0;

    connectedCallback() {
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        // Escape key closes modal
        this._onKey = (e) => { if (e.key === 'Escape') this.handleClose(); };
        document.addEventListener('keydown', this._onKey);
    }

    disconnectedCallback() {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', this._onKey);
    }

    get currentImage() {
        return this.room.images[this.activeImg] || this.room.images[0];
    }

    get imageCounter() {
        return `${this.activeImg + 1} / ${this.room.images.length}`;
    }

    get thumbImages() {
        return this.room.images.map((src, i) => ({
            idx: i, src,
            cls: i === this.activeImg ? 'thumb active' : 'thumb'
        }));
    }

    get subtotal() { return (this.room.pricePerNight * this.nights).toLocaleString(); }
    get taxes()    { return Math.round(this.room.pricePerNight * this.nights * 0.12).toLocaleString(); }
    get total()    { return Math.round(this.room.pricePerNight * this.nights * 1.12).toLocaleString(); }

    prevImage() {
        this.activeImg = (this.activeImg - 1 + this.room.images.length) % this.room.images.length;
    }

    nextImage() {
        this.activeImg = (this.activeImg + 1) % this.room.images.length;
    }

    handleThumb(e) {
        this.activeImg = parseInt(e.currentTarget.dataset.idx, 10);
    }

    handleBackdropClick() { this.handleClose(); }
    stopProp(e)           { e.stopPropagation(); }

    handleClose() {
        this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
    }

    handleBook() {
        this.dispatchEvent(new CustomEvent('bookroom', {
            bubbles: true, composed: true,
            detail: { roomId: this.room.id }
        }));
    }
}
