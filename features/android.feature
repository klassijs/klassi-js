@android
Feature: Android test

    Scenario: Access free samples
        Given The user launches the application
        When They click on Free samples
        Then The user navigates to the free samples screen when not logged in

    Scenario: Login functionality
        Given The user launches the application
        When They click on Sign in
        And Enter the correct credentials
        Then The user logs in correctly into the application

    Scenario: Register functionality
        Given The user launches the application
        When They click on Register
