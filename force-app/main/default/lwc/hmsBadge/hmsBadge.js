import { LightningElement, api } from 'lwc';

export default class HmsBadge extends LightningElement {
    @api label;
    @api variant = 'default'; // confirmed, pending, cancelled, checked-in, etc.

    get badgeClass() {
        const base = 'hms-badge';
        const v = this.variant ? this.variant.toLowerCase().replace(/\s+/g, '-') : 'default';
        return `${base} hms-badge--${v}`;
    }
}
