import { LightningElement, api, track } from 'lwc';
import { loadAzureTheme } from 'c/azureThemeLoader';

export default class AzureDatePicker extends LightningElement {

    connectedCallback() {
        loadAzureTheme(this);
    }
    @api mode = 'checkin'; // checkin | checkout
    @api minDate = null;
    @track currentDate = new Date();
    @track selectedDate = null;

    weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    get monthLabel() {
        return this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    get calendarDays() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date(); today.setHours(0,0,0,0);
        const min = this.minDate ? new Date(this.minDate) : today;

        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push({ key: `empty-${i}`, label: '', cssClass: 'dp-day dp-day--empty', disabled: true, dateStr: '' });
        }
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            const disabled = date < min;
            const isSelected = this.selectedDate && date.toDateString() === this.selectedDate.toDateString();
            const isToday = date.toDateString() === today.toDateString();
            let css = 'dp-day';
            if (disabled) css += ' dp-day--disabled';
            if (isSelected) css += ' dp-day--selected';
            if (isToday && !isSelected) css += ' dp-day--today';
            days.push({ key: `day-${d}`, label: String(d), cssClass: css, disabled, dateStr: date.toISOString() });
        }
        return days;
    }

    prevMonth() {
        const d = new Date(this.currentDate);
        d.setMonth(d.getMonth() - 1);
        this.currentDate = d;
    }

    nextMonth() {
        const d = new Date(this.currentDate);
        d.setMonth(d.getMonth() + 1);
        this.currentDate = d;
    }

    handleDayClick(event) {
        const dateStr = event.currentTarget.dataset.date;
        if (dateStr) this.selectedDate = new Date(dateStr);
    }

    handleApply() {
        if (this.selectedDate) {
            this.dispatchEvent(new CustomEvent('dateselected', {
                detail: { date: this.selectedDate, mode: this.mode },
                bubbles: true, composed: true
            }));
        }
        this.handleClose();
    }

    handleClear() { this.selectedDate = null; }

    handleClose() {
        this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
    }

    handleOverlayClick() { this.handleClose(); }
    stopProp(e) { e.stopPropagation(); }
}
