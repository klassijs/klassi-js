@api @apiGet
Feature: The OUP GetContent API feature/functionality

  Scenario: Recording API response time
    Given That I capture the response time
    Then I expect status code of '200'

  Scenario: Display the API content
    Then I return the content of the API

  Scenario: Verifying the data type of the GetContent API
    Then That I verify the data type of the API

  Scenario: To verify the Status Codes are returned along with the correct content
    Then That I verify the status codes and content of the API
