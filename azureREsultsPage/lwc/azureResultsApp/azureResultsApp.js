import { LightningElement, track } from 'lwc';

// ─── Room catalogue ───────────────────────────────────────────────
const ALL_ROOMS = [
    {
        id: 'cliffside-suite',
        name: 'Cliffside Suite',
        type: 'suite',
        category: 'Signature Suite',
        tagline: 'Where the Aegean meets the sky',
        description: 'Perched on the volcanic cliffs of Oia, this suite offers a seamless dialogue between the indoors and the infinite blue. Hand-carved stone walls, a private plunge pool, and a terrace that seems to float above the caldera.',
        pricePerNight: 680,
        sqm: 95,
        maxGuests: 3,
        bed: 'King',
        view: 'Caldera',
        amenities: ['Private Plunge Pool', 'Outdoor Terrace', 'Rain Shower', 'Butler Service', 'Nespresso Bar', 'Marble Bath'],
        images: [
            'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1000&q=85',
            'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1000&q=85',
            'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1000&q=85',
        ],
        available: true,
        featured: true,
        rating: 4.97,
        reviews: 214,
    },
    {
        id: 'azure-villa',
        name: 'Azure Villa',
        type: 'villa',
        category: 'Private Villa',
        tagline: 'Your own Santorini estate',
        description: 'A private sanctuary with its own garden, chef\'s kitchen, and full-length infinity pool. The Azure Villa is designed for those who wish to experience Santorini without compromise — total seclusion, unrivalled grandeur.',
        pricePerNight: 1240,
        sqm: 240,
        maxGuests: 6,
        bed: '2 Kings',
        view: 'Caldera & Sea',
        amenities: ['Private Infinity Pool', 'Full Kitchen', 'Private Garden', 'Dedicated Chef', 'Private Butler', 'Home Cinema', 'Wine Cellar', 'Gym'],
        images: [
            'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1000&q=85',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1000&q=85',
            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1000&q=85',
        ],
        available: true,
        featured: true,
        rating: 5.0,
        reviews: 89,
    },
    {
        id: 'caldera-deluxe',
        name: 'Caldera View Room',
        type: 'room',
        category: 'Deluxe Room',
        tagline: 'Iconic views, intimate scale',
        description: 'The quintessential Santorini experience. Whitewashed walls frame a panoramic caldera vista. Wake to the sun rising over the volcanic islands and fall asleep to the glow of Oia\'s famous sunsets.',
        pricePerNight: 420,
        sqm: 52,
        maxGuests: 2,
        bed: 'King',
        view: 'Caldera',
        amenities: ['Caldera Terrace', 'Rain Shower', 'Nespresso Bar', 'Pillow Menu', 'Turndown Service'],
        images: [
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&q=85',
            'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1000&q=85',
            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1000&q=85',
        ],
        available: true,
        featured: false,
        rating: 4.91,
        reviews: 376,
    },
    {
        id: 'garden-suite',
        name: 'Garden Suite',
        type: 'suite',
        category: 'Garden Suite',
        tagline: 'An olive grove oasis',
        description: 'Nestled among ancient olive trees, this suite offers a rare sense of earthbound calm. The private garden terrace, hand-laid mosaic plunge pool, and cave-carved bathroom create an atmosphere of unhurried luxury.',
        pricePerNight: 560,
        sqm: 78,
        maxGuests: 2,
        bed: 'King',
        view: 'Garden & Sea',
        amenities: ['Plunge Pool', 'Private Garden', 'Cave Bathroom', 'Outdoor Shower', 'Espresso Bar', 'Yoga Mat'],
        images: [
            'https://images.unsplash.com/photo-1587556930799-8dca16e9c675?w=1000&q=85',
            'https://images.unsplash.com/photo-1455587734955-081b22074882?w=1000&q=85',
            'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=1000&q=85',
        ],
        available: true,
        featured: false,
        rating: 4.88,
        reviews: 153,
    },
    {
        id: 'honeymoon-cave',
        name: 'Honeymoon Cave Suite',
        type: 'suite',
        category: 'Cave Suite',
        tagline: 'Carved from the volcano itself',
        description: 'Hand-excavated from the volcanic pumice, this cave suite is a marvel of elemental architecture. The domed ceiling, recessed lighting, and private heated jacuzzi make it the ultimate romantic retreat.',
        pricePerNight: 780,
        sqm: 68,
        maxGuests: 2,
        bed: 'King',
        view: 'Caldera',
        amenities: ['Private Jacuzzi', 'Cave Architecture', 'Champagne Welcome', 'Sunset Cocktails', 'Pillow Menu', 'Rose Petal Turndown'],
        images: [
            'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1000&q=85',
            'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1000&q=85',
            'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1000&q=85',
        ],
        available: false,
        featured: false,
        rating: 4.99,
        reviews: 98,
    },
    {
        id: 'sea-view-double',
        name: 'Sea View Double',
        type: 'room',
        category: 'Superior Room',
        tagline: 'The Aegean at your feet',
        description: 'A beautifully appointed room with a generous balcony overlooking the sparkling Aegean. Refined furnishings in Cycladic white and driftwood tones create a serene retreat after days of island exploration.',
        pricePerNight: 320,
        sqm: 42,
        maxGuests: 2,
        bed: 'Double',
        view: 'Sea',
        amenities: ['Sea View Balcony', 'Walk-in Shower', 'Nespresso', 'Mini Bar', 'Turndown Service'],
        images: [
            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1000&q=85',
            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1000&q=85',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&q=85',
        ],
        available: true,
        featured: false,
        rating: 4.83,
        reviews: 441,
    },
];

export default class AzureResultsApp extends LightningElement {
    // ─── Search params (in real app: from URL params or parent event)
    @track checkIn  = '2025-10-24';
    @track checkOut = '2025-10-28';
    @track guests   = '2 Adults';

    // ─── Filter state
    @track filters = {
        type: 'all',       // all | room | suite | villa
        maxPrice: 1500,
        view: 'all',       // all | caldera | sea | garden
        sortBy: 'featured' // featured | price-asc | price-desc | rating
    };

    // ─── UI state
    @track selectedRoom      = null;
    @track bookingConfirmed  = false;
    @track confirmationMsg   = '';

    // ─── Derived ─────────────────────────────────────────────────

    get nights() {
        const ci = new Date(this.checkIn);
        const co = new Date(this.checkOut);
        return Math.max(1, Math.round((co - ci) / 86400000));
    }

    get filteredRooms() {
        let rooms = ALL_ROOMS.filter(r => r.available);

        if (this.filters.type !== 'all') {
            rooms = rooms.filter(r => r.type === this.filters.type);
        }
        if (this.filters.view !== 'all') {
            rooms = rooms.filter(r => r.view.toLowerCase().includes(this.filters.view));
        }
        rooms = rooms.filter(r => r.pricePerNight <= this.filters.maxPrice);

        if (this.filters.sortBy === 'price-asc')  rooms.sort((a,b) => a.pricePerNight - b.pricePerNight);
        if (this.filters.sortBy === 'price-desc') rooms.sort((a,b) => b.pricePerNight - a.pricePerNight);
        if (this.filters.sortBy === 'rating')     rooms.sort((a,b) => b.rating - a.rating);
        if (this.filters.sortBy === 'featured')   rooms.sort((a,b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

        return rooms;
    }

    get filteredCount() { return this.filteredRooms.length; }

    // ─── Handlers ────────────────────────────────────────────────

    handleModifySearch(e) {
        const { checkIn, checkOut, guests } = e.detail;
        this.checkIn  = checkIn;
        this.checkOut = checkOut;
        this.guests   = guests;
    }

    handleFilterChange(e) {
        this.filters = { ...this.filters, ...e.detail };
    }

    handleRoomSelect(e) {
        const room = ALL_ROOMS.find(r => r.id === e.detail.roomId);
        this.selectedRoom = room || null;
    }

    handleModalClose() {
        this.selectedRoom = null;
    }

    handleBookRoom(e) {
        const { roomId } = e.detail;
        const room = ALL_ROOMS.find(r => r.id === roomId);
        this.selectedRoom     = null;
        this.bookingConfirmed = true;
        this.confirmationMsg  = `Your ${room.name} is reserved for ${this.nights} nights. Confirmation sent to your email.`;
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => { this.bookingConfirmed = false; }, 6000);
    }
}
