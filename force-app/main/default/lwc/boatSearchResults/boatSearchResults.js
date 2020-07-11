import { LightningElement, api, track, wire } from 'lwc';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import { publish, MessageContext } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { updateRecord, getRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class BoatSearchResults extends LightningElement {

    @track
    boats;
    
    @track
    draftValues = [];

    selectedBoatId;

    columns = [
        { label: 'Name', fieldName: 'Name', type:'text', editable: true },
        { label: 'Length', fieldName: 'Length__c', type: 'number', editable: true },
        { label: 'Price', fieldName: 'Price__c', type: 'currency', editable: true },
        { label: 'Description', fieldName: 'Description__c', type: 'text', editable: true }
    ];

    boatTypeId = '';
    
    isLoading = false;

    error;

    wiredBoatsOriginal;

    @wire(getBoats, {boatTypeId : '$boatTypeId'})
    wiredBoats(result){
        console.log(result);
        this.wiredBoatsOriginal = result;
        const {data, error} = result;
        if(data){
            this.boats = data;
            this.error = undefined;
        }else if(error){
            this.data = undefined;
            this.error = error;
        }

        this.notifyLoading(true);
    }

    @wire(MessageContext)
    messageContext;

    @api
    searchBoats(boatTypeId) {
        this.notifyLoading(false);
        this.boatTypeId = boatTypeId;
        
        /* 
        console.log('enter ' + boatTypeId);
        const loadingEvent = new CustomEvent('loading');
        this.dispatchEvent(loadingEvent);

        getBoats({boatTypeId : boatTypeId})
        .then(result => {
            console.log(result);
            this.boats = result;
            const doneloadingEvent = new CustomEvent('doneloading');
            this.dispatchEvent(doneloadingEvent);
        })
        .catch(error => {
            const doneloadingEvent = new CustomEvent('doneloading');
            this.dispatchEvent(doneloadingEvent);
        }); */
    }

    updateSelectedTile(event) {

        this.selectedBoatId = event.detail.boatId;
        console.log(event.detail.boatId);
        this.sendMessageService(this.selectedBoatId);
        
    }

    sendMessageService(boatId) {
        console.log('message service ');
        const message = {
            boatId: boatId
        };
        publish(this.messageContext, BOATMC, message);
    }

    @api
    async refresh() { 
        this.notifyLoading(true);
        return refreshApex(this.boats);
    }

    // Check the current value of isLoading before dispatching the doneloading or 
    //loading custom event
    notifyLoading(isLoading) { 
        if(isLoading){
            const doneloadingEvent = new CustomEvent('doneloading');
            this.dispatchEvent(doneloadingEvent);
        }else{
            const doneloadingEvent = new CustomEvent('loading');
            this.dispatchEvent(doneloadingEvent);
        }
    }

    // This method must save the changes in the Boat Editor
    // Show a toast message with the title
    // clear lightning-datatable draft values
    handleSave(event) {
        this.notifyLoading(false);
        const recordInputs = event.detail.draftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });
        const promises = recordInputs.map(recordInput =>
                //update boat record
                updateRecord(recordInput)
            );
        Promise.all(promises)
            .then(() => {
                console.log('in then ');
                
                this.draftValues = [];
                
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Ship It!',
                        variant: 'success'
                    })
                );
                this.refresh();
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error,
                        variant: 'error'
                    })
                );
            })
            .finally(() => {
                console.log('in finally');
                // this.refresh();
            });
    }
    
}