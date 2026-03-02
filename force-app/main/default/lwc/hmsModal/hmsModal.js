import { LightningElement, api } from 'lwc';

export default class HmsModal extends LightningElement {
    @api title = '';
    @api size = 'medium'; // small, medium, large

    get modalClass() {
        const sizeMap = { small: '400px', medium: '560px', large: '720px' };
        return sizeMap[this.size] || '560px';
    }

    get modalStyle() {
        return `min-width: ${this.modalClass}`;
    }

    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    handleBackdropClick(event) {
        if (event.target === event.currentTarget) {
            this.handleClose();
        }
    }
}
