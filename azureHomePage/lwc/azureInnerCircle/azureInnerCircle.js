import { LightningElement, api, track } from 'lwc';

export default class AzureInnerCircle extends LightningElement {
    @api title    = 'Join The Inner Circle';
    @api subtitle = 'Be the first to know about our seasonal openings and exclusive private villa availability.';

    @track email      = '';
    @track subscribed = false;
    @track message    = '';

    get btnLabel() {
        return this.subscribed ? 'Subscribed ✓' : 'Subscribe';
    }

    connectedCallback() {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => this._initReveal(), 120);
    }

    _initReveal() {
        const el = this.template.querySelector('[data-reveal]');
        if (!el) return;
        const obs = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                el.classList.add('visible');
                obs.disconnect();
            }
        }, { threshold: 0.2 });
        obs.observe(el);
    }

    handleEmail(e) { this.email = e.target.value; }

    handleKeydown(e) { if (e.key === 'Enter') this.handleSubscribe(); }

    handleSubscribe() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!this.email || !emailRegex.test(this.email)) {
            this.message = 'Please enter a valid email address.';
            return;
        }
        this.subscribed = true;
        this.message    = `Welcome to The Inner Circle. Confirmation sent to ${this.email}.`;

        this.dispatchEvent(new CustomEvent('subscribe', {
            bubbles: true, composed: true,
            detail: { email: this.email }
        }));
    }
}
