public with sharing class BoatDataService {
    
    @AuraEnabled(cacheable=true)
    public static List<BoatType__c> getBoatTypes() {
        return [SELECT Id, Name FROM BoatType__c];
    }

    @AuraEnabled(cacheable=true)
    public static List<Boat__c> getBoats(Id boatTypeId) {
        String query = ' SELECT Id, Name, Contact__r.Name, BoatType__r.Name, Price__c, Picture__c, Length__c, Description__c ' + 
                       ' FROM Boat__c ';

        if(boatTypeId != null) {
            query = query + ' WHERE BoatType__c =: boatTypeId';
        }

        return Database.query(query);
    }

    @AuraEnabled(cacheable=true)
    public static List<Boat__c> getSimilarBoats(Id boatId, String similarBy) {

        return null;
    }

    @AuraEnabled
    public static List<BoatReview__c> getAllReviews(Id boatId){


        return null;
    }

    @AuraEnabled(cacheable=true)
    public static string getBoatsByLocation(String latitude, String longitude, Id boatTypeId){

        return null;
    }
}