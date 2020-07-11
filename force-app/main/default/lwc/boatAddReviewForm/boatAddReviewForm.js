// imports
import { LightningElement, wire, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const TOAST_TITLE = 'Review Created!';
const TOAST_SUCCESS_VARIANT = 'success';

export default class BoatAddReviewForm extends LightningElement {
    // Private
    boatId;
    rating;
    
    // Public Getter and Setter to allow for logic to run on recordId change
    @api
    get recordId() { }
    set recordId(value) {
      //sets boatId attribute
      //sets boatId assignment
      this.boatId = value;
    }
    
    // Gets user rating input from stars component
    handleRatingChanged(event) {
        console.log(event.detail.rating);
        this.rating = event.detail.rating;
    }
    
    // Custom submission handler to properly set Rating
    // This function must prevent the anchor element from navigating to a URL.
    // form to be submitted: lightning-record-edit-form
    handleSubmit(event) {
        event.preventDefault();       // stop the form from submitting
        const fields = event.detail.fields;
        fields.Boat__c = this.boatId;
        fields.Rating__c = this.rating;
        console.log(fields);
        this.template.querySelector('lightning-record-edit-form').submit(fields);
        // this.handleReset();
     }
    
    // Shows a toast message once form is submitted successfully
    // Dispatches event when a review is created
    handleSuccess() {
      // TODO: dispatch the custom event and show the success message
        this.dispatchEvent(
            new ShowToastEvent({
                title: TOAST_TITLE,
                variant: TOAST_SUCCESS_VARIANT
            })
        );

        const createreviewEvent = new CustomEvent('createreview');
        this.dispatchEvent(createreviewEvent);
        
        this.handleReset();
    }
    
    // Clears form data upon submission
    // TODO: it must reset each lightning-input-field
    handleReset() { 
        console.log('reset');
        const inputFields = this.template.querySelectorAll(
            'lightning-input-field'
        );
        if (inputFields) {
            inputFields.forEach(field => {
                field.reset();
            });
        }
    }
  }
  