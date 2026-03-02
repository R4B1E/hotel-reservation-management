import { LightningElement, api } from 'lwc';

export default class HmsDonutChart extends LightningElement {
    @api title = 'Room Status';
    @api segments = []; // [{label, value, color}]

    get total() {
        return (this.segments || []).reduce((sum, s) => sum + (s.value || 0), 0);
    }

    get svgSegments() {
        const total = this.total || 1;
        const circumference = 2 * Math.PI * 40; // r=40
        let offset = 0;
        return (this.segments || []).map((s, i) => {
            const pct = (s.value || 0) / total;
            const dashLen = pct * circumference;
            const seg = {
                key: 'seg-' + i,
                color: s.color || 'var(--hms-accent)',
                dasharray: `${dashLen} ${circumference - dashLen}`,
                offset: -offset + circumference * 0.25, // start at top
                label: s.label,
                value: s.value,
                pct: Math.round(pct * 100)
            };
            offset += dashLen;
            return seg;
        });
    }

    get legendItems() {
        return this.svgSegments;
    }
}
