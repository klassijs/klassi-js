Feature: The API feature/functionality
  Recording API response time, status and content

  Background: Making a call to the API endPoint
    Given That I make a GET call to an endPoint

  @get
  Scenario: The response of a GET call
    Verifies that a GET call returns the expected status code
    When That I make a GET call to an endPoint
    Then I expect status code of '200'
