@api
Feature: The API feature/functionality

  Background: Getting the time
    Given That I make a GET call to an endPoint

  Scenario: Recording API response time
    Then That I capture the response time

  Scenario: Getting the status code
    Then I expect status code of '200'

  Scenario: Display the API content
    Then I return the content of the API
