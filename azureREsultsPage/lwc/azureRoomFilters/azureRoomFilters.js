import { LightningElement, api, track } from 'lwc';

const SORT_OPTS = [
    { value: 'featured',   label: 'Featured' },
    { value: 'price-asc',  label: 'Price ↑' },
    { value: 'price-desc', label: 'Price ↓' },
    { value: 'rating',     label: 'Top Rated' },
];

const TYPE_OPTS = [
    { value: 'all',   label: 'All' },
    { value: 'room',  label: 'Rooms' },
    { value: 'suite', label: 'Suites' },
    { value: 'villa', label: 'Villas' },
];

const VIEW_OPTS = [
    { value: 'all',     label: 'All Views' },
    { value: 'caldera', label: 'Caldera' },
    { value: 'sea',     label: 'Sea' },
    { value: 'garden',  label: 'Garden' },
];

export default class AzureRoomFilters extends LightningElement {
    @api filters;

    _emit(patch) {
        this.dispatchEvent(new CustomEvent('filterchange', {
            bubbles: true, composed: true,
            detail: patch
        }));
    }

    _buildOptions(opts, activeVal) {
        return opts.map(o => ({
            ...o,
            btnClass: o.value === activeVal ? 'opt-btn active' : 'opt-btn'
        }));
    }

    get sortOptions() { return this._buildOptions(SORT_OPTS, this.filters.sortBy); }
    get typeOptions() { return this._buildOptions(TYPE_OPTS, this.filters.type); }
    get viewOptions() { return this._buildOptions(VIEW_OPTS, this.filters.view); }

    handleSort(e) { this._emit({ sortBy: e.currentTarget.dataset.value }); }
    handleType(e) { this._emit({ type:   e.currentTarget.dataset.value }); }
    handleView(e) { this._emit({ view:   e.currentTarget.dataset.value }); }
    handlePrice(e){ this._emit({ maxPrice: parseInt(e.target.value, 10) }); }

    resetFilters() {
        this._emit({ type: 'all', maxPrice: 1500, view: 'all', sortBy: 'featured' });
    }
}
