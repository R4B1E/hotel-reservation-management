import { LightningElement, api, track, wire } from 'lwc';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import { loadAzureTheme } from 'c/azureThemeLoader';
import basePath from '@salesforce/community/basePath';
import getRoomById from '@salesforce/apex/HotelRoomController.getRoomById';
import getRoomAmenities from '@salesforce/apex/HotelRoomController.getRoomAmenities';

export default class AzureRoomDetail extends NavigationMixin(LightningElement) {

    @api roomId;

    @track room = {};
    @track currentImageIndex = 0;
    @track isLoading = true;
    _amenities = [];

    connectedCallback() {
        loadAzureTheme(this);
    }

    @wire(CurrentPageReference)
    handlePageRef(pageRef) {
        if (pageRef?.state?.roomId) {
            this.roomId = pageRef.state.roomId;
        }
    }

    @wire(getRoomById, { roomId: '$roomId' })
    wiredRoom({ data, error }) {
        if (data) {
            this.room = { ...data, amenities: this._amenities };
            this.isLoading = false;
        } else if (error) {
            this.isLoading = false;
        }
    }

    @wire(getRoomAmenities, { roomId: '$roomId' })
    wiredAmenities({ data, error }) {
        if (data) {
            this._amenities = data.map(a => ({
                name: a.Name,
                icon: a.Icon__c || '\u25C8'
            }));
            if (this.room?.id) {
                this.room = { ...this.room, amenities: this._amenities };
            }
        }
    }

    get hasRoom() { return !!this.room?.id; }

    get mainImageStyle() {
        const url = this.room?.images?.[this.currentImageIndex] || '';
        return url
            ? `background-image: url(${url});`
            : 'background: linear-gradient(135deg, #2e2b28 0%, #1a1918 100%);';
    }

    get mappedImages() {
        if (!this.room?.images) return [];
        return this.room.images.map((img, idx) => ({
            url: img,
            index: idx,
            className: `gallery-thumb${idx === this.currentImageIndex ? ' gallery-thumb--active' : ''}`,
            style: img ? `background-image: url(${img});` : 'background: #2e2b28;'
        }));
    }

    get imageIndex()  { return this.currentImageIndex + 1; }
    get totalImages() { return this.room?.images?.length || 0; }

    prevImage() {
        const len = this.room?.images?.length || 0;
        this.currentImageIndex = this.currentImageIndex > 0
            ? this.currentImageIndex - 1
            : len - 1;
    }

    nextImage() {
        const len = this.room?.images?.length || 0;
        this.currentImageIndex = this.currentImageIndex < len - 1
            ? this.currentImageIndex + 1
            : 0;
    }

    handleThumbClick(event) {
        this.currentImageIndex = parseInt(event.currentTarget.dataset.index, 10);
    }

    handleReserve() {
        const params = new URLSearchParams();
        params.set('roomId', this.room.id);
        params.set('roomName', this.room.name);
        params.set('pricePerNight', this.room.pricePerNight);
        params.set('category', this.room.category);
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: { url: basePath + '/checkout?' + params.toString() }
        });
    }
}
