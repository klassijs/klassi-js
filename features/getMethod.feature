@api @uattest
Feature: The API feature/functionality
  Recording API response time, status and content

  Background: Making a call to the API endPoint
    Given That I make a GET call to an endPoint

  @get
  Scenario: The response of a GET call
    When I expect status code of '200'
    Then I return the content of the API

  @put
  Scenario: The response of a PUT call
    When I expect status code of '200'
    Then I return the content of the API

  @post
  Scenario: The response of a POST call
    When I expect status code of '200'
    Then I return the content of the API

  @delete
  Scenario: The response of a DELETE call
    Then I expect status code of '201'
    Then I return the content of the API
