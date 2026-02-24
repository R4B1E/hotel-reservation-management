import { LightningElement, api, track } from 'lwc';

const DEFAULT_AMENITIES = [
    {
        id: 'pool',
        name: 'Infinity Pool',
        description: 'Seamlessly blending with the horizon, our saltwater infinity pool offers an unparalleled aquatic experience.',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&q=80'
    },
    {
        id: 'spa',
        name: 'The Azure Spa',
        description: 'Ancient healing traditions meet modern wellness in our award-winning sanctuary of calm.',
        image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=700&q=80'
    },
    {
        id: 'dining',
        name: 'Gastronomy',
        description: 'Michelin-starred dining experiences featuring locally sourced ingredients and world-class wines.',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&q=80'
    }
];

export default class AzureAmenities extends LightningElement {
    @api eyebrow  = 'Refined Comforts';
    @api title    = 'Curated Amenities';
    @api subtitle = 'Designed to rejuvenate the spirit and awaken the senses.';
    @api amenities = DEFAULT_AMENITIES;

    connectedCallback() {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => this._initReveal(), 120);
    }

    _initReveal() {
        const els = this.template.querySelectorAll('[data-reveal]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((e, i) => {
                if (e.isIntersecting) {
                    // stagger cards
                    setTimeout(() => e.target.classList.add('visible'), i * 80);
                    observer.unobserve(e.target);
                }
            });
        }, { threshold: 0.12 });
        els.forEach(el => observer.observe(el));
    }

    handleAmenityClick(e) {
        const id = e.currentTarget.dataset.id;
        this.dispatchEvent(new CustomEvent('amenityselect', {
            bubbles: true, composed: true,
            detail: { amenityId: id }
        }));
    }
}
