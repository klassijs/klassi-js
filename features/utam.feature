@utam
Feature: UTAM test

    @google
    Scenario: Search for UTAM on Google
        Given The user navigates to Google
        When They use the engine to search for a word
        Then The results are correct