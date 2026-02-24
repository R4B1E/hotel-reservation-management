import { LightningElement, api } from 'lwc';

export default class AzureHeritage extends LightningElement {
    @api eyebrow     = 'Our Heritage';
    @api titleMain   = 'A timeless retreat';
    @api titleItalic = 'carved in history.';
    @api paragraph1  = 'Established in 1924, The Azure Sanctuary began as a private estate for the aristocracy. Today, we invite you to experience the same level of seclusion and grandeur.';
    @api paragraph2  = 'Every corner of our property tells a story, from the hand-carved stone pillars to the ancient olive groves that surround our infinity pools. We don\'t just offer a stay; we offer a passage into a world of refined elegance.';

    connectedCallback() {
        // Defer so DOM is ready
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => this._initReveal(), 100);
    }

    _initReveal() {
        const els = this.template.querySelectorAll('[data-reveal]');
        if (!els.length) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    observer.unobserve(e.target);
                }
            });
        }, { threshold: 0.15 });
        els.forEach(el => observer.observe(el));
    }
}
