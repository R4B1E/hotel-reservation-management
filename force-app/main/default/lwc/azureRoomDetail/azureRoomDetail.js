import { LightningElement, api, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { loadAzureTheme } from 'c/azureThemeLoader';

const MOCK_ROOM = {
    id: '1',
    name: 'Aegean Suite',
    category: 'Suite',
    tagline: 'A private universe suspended above the Aegean.',
    fullDescription: 'The Aegean Suite is the embodiment of Cycladic luxury — a seamless union of volcanic stone, hand-crafted furnishings, and the infinite blue horizon. Step from your king-size bed onto a private terrace where the caldera stretches endlessly before you. Every detail has been considered: hand-thrown ceramics, raw linen, the soft sound of waves far below.',
    pricePerNight: 850,
    squareMeters: 95,
    maxGuests: 2,
    bedType: '1 King',
    view: 'Caldera',
    images: ['', '', '', ''],
    amenities: [
        { name: 'Private Infinity Pool', icon: '◈' },
        { name: 'Caldera View Terrace', icon: '◈' },
        { name: 'King-Size Bed',        icon: '◈' },
        { name: 'Climate Control',      icon: '◈' },
        { name: 'Rain Shower',          icon: '◈' },
        { name: 'Espresso Bar',         icon: '◈' },
        { name: 'Butler Service',       icon: '◈' },
        { name: 'Turndown Service',     icon: '◈' },
    ]
};

export default class AzureRoomDetail extends LightningElement {

    connectedCallback() {
        loadAzureTheme(this);
    }
    /** Fallback when placed directly on a page with a fixed roomId property */
    @api roomId;

    @track room = MOCK_ROOM;
    @track currentImageIndex = 0;
    reservationData = {};

    /**
     * LWR route param: /rooms/:roomId
     * CurrentPageReference.attributes.roomId is populated automatically
     * when the component lives on the roomDetail page.
     */
    @wire(CurrentPageReference)
    handlePageRef(pageRef) {
        if (pageRef?.attributes?.roomId) {
            this.roomId = pageRef.attributes.roomId;
            // In production, call HotelRoomController.getRoomById(this.roomId)
            // and set this.room = result
        }
    }

    get mainImageStyle() {
        const url = this.room?.images?.[this.currentImageIndex] || '';
        return url
            ? `background-image: url(${url});`
            : 'background: linear-gradient(135deg, #2e2b28 0%, #1a1918 100%);';
    }

    get mappedImages() {
        return this.room.images.map((img, idx) => ({
            url: img,
            index: idx,
            className: `gallery-thumb${idx === this.currentImageIndex ? ' gallery-thumb--active' : ''}`,
            style: img ? `background-image: url(${img});` : 'background: #2e2b28;'
        }));
    }

    get imageIndex()  { return this.currentImageIndex + 1; }
    get totalImages() { return this.room?.images?.length || 0; }

    getThumbClass(idx) {
        return `gallery-thumb${idx === this.currentImageIndex ? ' gallery-thumb--active' : ''}`;
    }

    getThumbStyle(img) {
        return img ? `background-image: url(${img});` : 'background: #2e2b28;';
    }

    prevImage() {
        this.currentImageIndex = this.currentImageIndex > 0
            ? this.currentImageIndex - 1
            : this.room.images.length - 1;
    }

    nextImage() {
        this.currentImageIndex = this.currentImageIndex < this.room.images.length - 1
            ? this.currentImageIndex + 1
            : 0;
    }

    handleThumbClick(event) {
        this.currentImageIndex = parseInt(event.currentTarget.dataset.index, 10);
    }

    handleBooking(event) {
        this.reservationData = event.detail;
    }

    handleReserve() {
        this.dispatchEvent(new CustomEvent('reserve', {
            detail: { roomId: this.room.id, ...this.reservationData },
            bubbles: true, composed: true
        }));
    }
}
