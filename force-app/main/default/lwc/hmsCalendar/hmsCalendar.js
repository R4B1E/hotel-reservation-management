import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { loadHmsTheme } from 'c/hmsThemeLoader';
import getRoomCalendarData from '@salesforce/apex/HMSCalendarController.getRoomCalendarData';
import getCalendarStats from '@salesforce/apex/HMSCalendarController.getCalendarStats';

export default class HmsCalendar extends NavigationMixin(LightningElement) {
    @track sections = [];
    stats;
    startDate;
    isLoading = true;
    daysToShow = 10;
    currentView = 'Day';

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

    get dateRangeLabel() {
        if (!this.startDate) return '';
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const start = new Date(this.startDate);
        const end = new Date(this.startDate);
        end.setDate(end.getDate() + this.daysToShow);
        const startMonth = months[start.getMonth()];
        const endMonth = months[end.getMonth()];
        const startDay = start.getDate();
        const endDay = end.getDate();
        const endYear = end.getFullYear();
        if (start.getMonth() === end.getMonth()) {
            return startMonth + ' ' + startDay + ' \u2013 ' + endDay + ', ' + endYear;
        }
        return startMonth + ' ' + startDay + ' \u2013 ' + endMonth + ' ' + endDay + ', ' + endYear;
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
            const isToday = this.formatDate(d) === this.formatDate(new Date());
            const isWeekend = d.getDay() === 0 || d.getDay() === 6;
            result.push({
                key: 'day-' + i,
                dayName: days[d.getDay()],
                dayNum: d.getDate(),
                monthName: months[d.getMonth()],
                isToday: isToday,
                isWeekend: isWeekend,
                headerClass: 'gantt-date-header' + (isToday ? ' today' : '') + (isWeekend ? ' weekend' : ''),
                cellClass: 'gantt-cell' + (isToday ? ' today' : '') + (isWeekend ? ' weekend' : '')
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

    get dayBtnClass() {
        return 'vt-btn' + (this.currentView === 'Day' ? ' vt-btn--active' : '');
    }
    get weekBtnClass() {
        return 'vt-btn' + (this.currentView === 'Week' ? ' vt-btn--active' : '');
    }
    get monthBtnClass() {
        return 'vt-btn' + (this.currentView === 'Month' ? ' vt-btn--active' : '');
    }

    handleViewChange(event) {
        const view = event.target.dataset.view;
        if (view) {
            this.currentView = view;
        }
    }

    handleNewReservation() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Reservation__c',
                actionName: 'new'
            }
        });
    }

    formatDate(d) {
        return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    }
}
