import { LightningElement, wire, track } from 'lwc';
import { loadHmsTheme } from 'c/hmsThemeLoader';
import getRoomCalendarData from '@salesforce/apex/HMSCalendarController.getRoomCalendarData';
import getCalendarStats from '@salesforce/apex/HMSCalendarController.getCalendarStats';

export default class HmsCalendar extends LightningElement {
    @track sections = [];
    stats;
    startDate;
    isLoading = true;
    daysToShow = 10;

    connectedCallback() {
        loadHmsTheme(this);
        this.startDate = this.formatDate(new Date());
    }

    @wire(getRoomCalendarData, { startDate: '$startDate', endDate: '$endDate' })
    wiredCalendar({ data, error }) {
        if (data) { this.sections = data; this.isLoading = false; }
        else if (error) { console.error(error); this.isLoading = false; }
    }

    @wire(getCalendarStats)
    wiredStats({ data }) { if (data) this.stats = data; }

    get endDate() {
        if (!this.startDate) return null;
        const d = new Date(this.startDate);
        d.setDate(d.getDate() + this.daysToShow);
        return this.formatDate(d);
    }

    get dateHeaders() {
        if (!this.startDate) return [];
        const result = [];
        const start = new Date(this.startDate);
        const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        for (let i = 0; i < this.daysToShow; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            result.push({
                key: 'day-' + i,
                dayName: days[d.getDay()],
                dayNum: d.getDate(),
                monthName: months[d.getMonth()],
                isToday: this.formatDate(d) === this.formatDate(new Date()),
                isWeekend: d.getDay() === 0 || d.getDay() === 6
            });
        }
        return result;
    }

    get gridStyle() {
        return `grid-template-columns: 120px repeat(${this.daysToShow}, 1fr);`;
    }

    get sectionSpanStyle() {
        return `grid-column: 1 / span ${this.daysToShow + 1};`;
    }

    get vacantCount() { return this.stats ? this.stats.vacant : 0; }
    get occupiedCount() { return this.stats ? this.stats.occupied : 0; }
    get blockedCount() { return this.stats ? this.stats.blocked : 0; }
    get dirtyCount() { return this.stats ? this.stats.dirty : 0; }

    handlePrev() {
        const d = new Date(this.startDate);
        d.setDate(d.getDate() - this.daysToShow);
        this.startDate = this.formatDate(d);
    }

    handleNext() {
        const d = new Date(this.startDate);
        d.setDate(d.getDate() + this.daysToShow);
        this.startDate = this.formatDate(d);
    }

    handleToday() {
        this.startDate = this.formatDate(new Date());
    }

    formatDate(d) {
        return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    }
}
