// import BOATMC from the message channel
import { LightningElement, wire, api, track } from 'lwc';
import { APPLICATION_SCOPE, createMessageContext, MessageContext, publish, releaseMessageContext, subscribe, unsubscribe } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { getRecord } from 'lightning/uiRecordApi';
const LONGITUDE_FIELD = 'Boat__c.Geolocation__Longitude__s';
const LATITUDE_FIELD = 'Boat__c.Geolocation__Latitude__s';
const BOAT_FIELDS = [LONGITUDE_FIELD, LATITUDE_FIELD];
// Declare the const BOAT_FIELDS as a list of [LONGITUDE_FIELD, LATITUDE_FIELD];

export default class BoatMap extends LightningElement {
  // private
  subscription = null;

  @track
  boatId = null;

  // Getter and Setter to allow for logic to run on recordId change
  // this getter must be public
  @api
  get recordId() {
    return this.boatId;
  }
  set recordId(value) {
    this.setAttribute('boatId', value);
    this.boatId = value;
  }

  //public
  @api
  error = undefined;
  @api
  mapMarkers = [];

  // Initialize messageContext for Message Service
  @wire(MessageContext)
    messageContext;

  // Getting record's location to construct map markers using recordId
  // Wire the getRecord method using ('$boatId')
  @wire(getRecord, { recordId: '$boatId', fields: BOAT_FIELDS })
  wiredRecord({ error, data }) {
    // Error handling
    console.log(data);
    if (data) {
      this.error = undefined;
      const longitude = data.fields.Geolocation__Longitude__s.value;
      const latitude = data.fields.Geolocation__Latitude__s.value;
      this.updateMap(longitude, latitude);
    } else if (error) {
      this.error = error;
      this.boatId = undefined;
      this.mapMarkers = [];
    }
  }

  // Runs when component is connected, subscribes to BoatMC
  connectedCallback() {
    // recordId is populated on Record Pages, and this component
    // should not update when this component is on a record page.
    if (this.subscription || this.recordId) {
      return;
    }
    // Subscribe to the message channel to retrieve the recordID and assign it to boatId.
    this.subscribeMC();
  }

  disconnectedCallback() {
    unsubscribe(this.subscription);
    this.subscription = null;
  }

    subscribeMC() {
        console.log('subscribing...');
        if (this.subscription) {
            return;
        }
        this.subscription = subscribe(
            this.messageContext,
            BOATMC, 
            (message) => {
                this.handleMessage(message);
            },
            { scope: APPLICATION_SCOPE });
    }
    handleMessage(message) {
        console.log( message.boatId);
        console.log(JSON.stringify(message));
        console.log('old boatid' + this.boatId);
        this.boatId = message.boatId;
        // this.recordId = message.boatId;
        console.log('new boatid' + this.boatId);
        // this.receivedMessage = message ? JSON.stringify(message, null, '\t') : 'no message payload';
    }

  // Creates the map markers array with the current boat's location for the map.
  updateMap(Longitude, Latitude) {
    this.mapMarkers = [{
        location: {
          Latitude,
          Longitude
        }
      }];
  }

  // Getter method for displaying the map component, or a helper method.
  get showMap() {
    return this.mapMarkers.length > 0;
  }
}