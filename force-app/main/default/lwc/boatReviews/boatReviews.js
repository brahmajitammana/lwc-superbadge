import { LightningElement, api, wire, track } from 'lwc';
import getAllReviews from '@salesforce/apex/BoatDataService.getAllReviews';
import { NavigationMixin } from 'lightning/navigation';

// imports
export default class BoatReviews extends NavigationMixin(LightningElement) {
    // Private
    boatId;
    error;

    @track
    boatReviews;

    isLoading =false;
    
    // Getter and Setter to allow for logic to run on recordId change
    @api
    get recordId() { }
    set recordId(value) {
      //sets boatId attribute
      //sets boatId assignment
      this.boatId = value;
      //get reviews associated with boatId
      this.getReviews();
    }
    
    // Getter to determine if there are reviews to display
    get reviewsToShow() {
        return (this.boatReviews && this.boatReviews.length > 0);
    }
    
    // Public method to force a refresh of the reviews invoking getReviews
    @api
    refresh() { 
        this.getReviews();
    }
    
    // Imperative Apex call to get reviews for given boat
    // returns immediately if boatId is empty or null
    // sets isLoading to true during the process and false when it’s completed
    // Gets all the boatReviews from the result, checking for errors.
    getReviews() { 

        let boatId = this.boatId;
        if(! boatId){
            return;
        }
        
        this.isLoading = true;

        getAllReviews({boatId : boatId})
        .then(result => {
            this.boatReviews = result;
            this.isLoading = false;
        })
        .catch(error => {
            this.error = error;
            this.isLoading = false;
        })
    }
    
    // Helper method to use NavigationMixin to navigate to a given record on click
    navigateToRecord(event) {  
        console.log(event.target.dataset.recordId);
        let recordId = event.target.dataset.recordId;
        // Navigate to the Account home page
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'User',
                actionName: 'view'
            }
        });
    }
  }
  