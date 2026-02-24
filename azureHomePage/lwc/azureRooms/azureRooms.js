import { LightningElement, api, track } from 'lwc';

const DEFAULT_ROOMS = [
    {
        id: 'cliffside',
        name: 'Cliffside Suite',
        type: 'Signature Suite',
        price: '€680',
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
        featured: true
    },
    {
        id: 'villa',
        name: 'Azure Villa',
        type: 'Private Villa',
        price: '€1,240',
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
        featured: false
    },
    {
        id: 'caldera',
        name: 'Caldera View',
        type: 'Deluxe Room',
        price: '€420',
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
        featured: false
    }
];

export default class AzureRooms extends LightningElement {
    @api eyebrow = 'Accommodations';
    @api title   = 'Suites & Villas';

    get rooms() {
        return DEFAULT_ROOMS.map(r => ({
            ...r,
            cardClass: r.featured ? 'room-card featured' : 'room-card'
        }));
    }

    connectedCallback() {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => this._initReveal(), 150);
    }

    _initReveal() {
        const els = this.template.querySelectorAll('[data-reveal]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((e, i) => {
                if (e.isIntersecting) {
                    setTimeout(() => e.target.classList.add('visible'), i * 100);
                    observer.unobserve(e.target);
                }
            });
        }, { threshold: 0.12 });
        els.forEach(el => observer.observe(el));
    }

    handleRoomSelect(e) {
        const id = e.currentTarget.dataset.id;
        this.dispatchEvent(new CustomEvent('roomselect', {
            bubbles: true, composed: true,
            detail: { roomId: id }
        }));
    }
}
