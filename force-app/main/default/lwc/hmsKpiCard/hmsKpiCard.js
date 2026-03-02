import { LightningElement, api } from 'lwc';

export default class HmsKpiCard extends LightningElement {
    @api label = '';
    @api value = '';
    @api subtext = '';
    @api accentColor = 'var(--hms-accent)';
    @api icon = '';
    @api trend = ''; // up, down, neutral
    @api trendValue = '';

    get accentStyle() {
        return `border-left: 3px solid ${this.accentColor}`;
    }

    get trendClass() {
        if (this.trend === 'up') return 'trend trend--up';
        if (this.trend === 'down') return 'trend trend--down';
        return 'trend';
    }

    get trendIcon() {
        if (this.trend === 'up') return '\u25B2';
        if (this.trend === 'down') return '\u25BC';
        return '';
    }

    get hasTrend() {
        return this.trend && this.trendValue;
    }
}
