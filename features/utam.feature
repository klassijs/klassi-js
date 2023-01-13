@utam
Feature: UTAM test

    @google @uattest
    Scenario: Search for UTAM on Google
        Given The user navigates to Google
        When They use the engine to search for a word
        Then The results are correct

    @salesforce
    Scenario: Log into Salesforce developer instance
        Given The user navigates to their Salesforce instance
        When They log into the instance
        Then The user accesses the form to create a new account
        And They create a new client account
