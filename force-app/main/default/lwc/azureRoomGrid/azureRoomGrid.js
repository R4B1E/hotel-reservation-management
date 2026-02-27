import { LightningElement, track, wire } from 'lwc';
import getRooms from '@salesforce/apex/HotelRoomController.getAvailableRooms';
import { loadAzureTheme } from 'c/azureThemeLoader';

const MOCK_ROOMS = [
    { id:'1', name:'Aegean Suite', category:'Suite', pricePerNight:850, shortDescription:'A panoramic haven with infinite sea views and curated Cycladean design.', topAmenities:['Sea View','Private Pool','King Bed'], squareMeters:95, isFeatured:true, imageUrl:'' },
    { id:'2', name:'Caldera View Room', category:'Deluxe', pricePerNight:520, shortDescription:'Perched above the volcanic crater with floor-to-ceiling windows.', topAmenities:['Caldera View','Balcony','Queen Bed'], squareMeters:60, isFeatured:false, imageUrl:'' },
    { id:'3', name:'Cave Hideaway', category:'Standard', pricePerNight:340, shortDescription:'A traditional cave room carved into the volcanic rock, cool in summer.', topAmenities:['Cave Style','A/C','Double Bed'], squareMeters:40, isFeatured:false, imageUrl:'' },
    { id:'4', name:'Honeymoon Retreat', category:'Suite', pricePerNight:1200, shortDescription:'The ultimate romantic escape — private infinity pool and sunset views.', topAmenities:['Infinity Pool','Sea View','Jacuzzi'], squareMeters:120, isFeatured:true, imageUrl:'' },
    { id:'5', name:'Garden Terrace Room', category:'Deluxe', pricePerNight:450, shortDescription:'Lush private terrace surrounded by Bougainvillea and sea breeze.', topAmenities:['Terrace','Garden View','King Bed'], squareMeters:72, isFeatured:false, imageUrl:'' },
    { id:'6', name:'The Azure Penthouse', category:'Penthouse', pricePerNight:2400, shortDescription:'The crown of the property. 360° panoramic views across the entire Aegean.', topAmenities:['360° Views','Private Deck','Butler Service'], squareMeters:210, isFeatured:true, imageUrl:'' },
];

export default class AzureRoomGrid extends LightningElement {

    connectedCallback() {
        loadAzureTheme(this);
    }
    @track rooms = MOCK_ROOMS;
    @track activeFilter = 'All';
    @track isLoading = false;
    @track error = null;

    get categories() {
        const cats = ['All', ...new Set(MOCK_ROOMS.map(r => r.category))];
        return cats.map(c => ({
            value: c,
            label: c,
            cssClass: `filter-btn${this.activeFilter === c ? ' filter-btn--active' : ''}`
        }));
    }

    get filteredRooms() {
        if (this.activeFilter === 'All') return this.rooms;
        return this.rooms.filter(r => r.category === this.activeFilter);
    }

    get noResults() { return this.filteredRooms.length === 0; }

    handleFilter(event) {
        this.activeFilter = event.currentTarget.dataset.value;
    }

    handleRoomSelect(event) {
        this.dispatchEvent(new CustomEvent('roomselect', {
            detail: event.detail,
            bubbles: true, composed: true
        }));
    }
}
