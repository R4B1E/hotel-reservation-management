import { LightningElement, api } from 'lwc';

export default class HmsBarChart extends LightningElement {
    @api title = 'Occupancy (Last 14 Days)';
    @api chartData = []; // [{label, value, maxValue}]

    get bars() {
        if (!this.chartData || !this.chartData.length) return [];
        const maxVal = Math.max(...this.chartData.map(d => d.value || 0), 1);
        return this.chartData.map((d, i) => ({
            key: 'bar-' + i,
            label: d.label || '',
            value: d.value || 0,
            pct: Math.round(((d.value || 0) / maxVal) * 100),
            style: `height: ${Math.round(((d.value || 0) / maxVal) * 100)}%`,
            displayValue: d.value != null ? d.value + '%' : ''
        }));
    }
}
