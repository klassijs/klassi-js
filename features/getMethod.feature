@api
Feature: The API feature/functionality

  Scenario: Recording API response time
    Given That I capture the response time
    Then I expect status code of '200'

  Scenario: Display the API content
    Given I return the content of the API
