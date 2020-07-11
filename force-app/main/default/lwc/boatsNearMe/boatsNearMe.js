import { LightningElement, wire, api, track } from 'lwc';
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';
const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class BoatsNearMe extends LightningElement {

    @api
    boatTypeId;

    @track
    mapMarkers = [];
    isLoading = true;
    isRendered;
    latitude;
    longitude;

    // Add the wired method from the Apex Class
    // Name it getBoatsByLocation, and use latitude, longitude and boatTypeId
    // Handle the result and calls createMapMarke
    @wire(getBoatsByLocation, {latitude : '$latitude', longitude : '$longitude', boatTypeId : '$boatTypeId'})
    wiredBoatsJSON({error, data}) { 
        console.log(error);
        console.log(data);
        if(data){
            this.createMapMarkers(JSON.parse(data));
            this.isLoading = false;
        }else if(error){
            console.log(error);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: ERROR_TITLE,
                    message: error,
                    variant: ERROR_VARIANT
                })
            );
            this.isLoading = false;
        }
    }

    // Gets the location from the Browser
    // position => {latitude and longitude}
    getLocationFromBrowser() {

        let self = this;
        window.navigator.geolocation.getCurrentPosition(position => {
            self.latitude = position.coords.latitude;
            self.longitude = position.coords.longitude;
        });

        /* let location = window.navigator.geolocation;
        if (location) {
            // Geolocation available
            console.log(location);
            let self = this;
            location.getCurrentPosition(position => {
                self.latitude = position.coords.latitude;
                self.longitude = position.coords.longitude;
            })
        }
        console.log(this.latitude);
        console.log(this.longitude); */
    }

    // Controls the isRendered property
    // Calls getLocationFromBrowser()
    renderedCallback() {
        if(!this.isRendered) {
            this.getLocationFromBrowser();
            this.isRendered = true;
        }
     }

    // Creates the map markers
    createMapMarkers(boatData) {
        const newMarkers = boatData.map(boat => {
            return {
                location: {
                    Latitude: boat.Geolocation__Latitude__s,
                    Longitude: boat.Geolocation__Longitude__s
                },
                title : boat.Name,

              };
        });
        newMarkers.unshift({
            location: {
                Latitude: this.latitude,
                Longitude: this.longitude
            },
            title: LABEL_YOU_ARE_HERE,
            icon: ICON_STANDARD_USER
        });

        //add to field
        this.mapMarkers = newMarkers;
    }
}