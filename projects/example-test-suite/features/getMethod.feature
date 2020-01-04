@api
Feature: The API feature/functionality

  Background: Getting the time
    Given That I make a GET call to an endPoint

  Scenario: Recording API response time
    Then That I capture the response time