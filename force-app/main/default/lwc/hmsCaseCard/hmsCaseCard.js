import { LightningElement, api } from 'lwc';

export default class HmsCaseCard extends LightningElement {
    @api caseItem;

    get priorityClass() {
        const p = this.caseItem ? (this.caseItem.priority || '').toLowerCase() : '';
        return `priority-dot priority-dot--${p}`;
    }

    handleClick() {
        this.dispatchEvent(new CustomEvent('caseclick', {
            detail: { id: this.caseItem.id },
            bubbles: true, composed: true
        }));
    }
}
