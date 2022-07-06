@api @uattest
Feature: The API feature/functionality
@get
  Scenario: Recording API response time, status and content
    Given That I make a GET call to an endPoint
    Then I expect status code of '200'
    Then I return the content of the API
@put
  Scenario: Recording API response time, status and content
    Given That I make a GET call to an endPoint
    Then I expect status code of '200'
    Then I return the content of the API
@post
  Scenario: Recording API response time, status and content
    Given That I make a GET call to an endPoint
    Then I expect status code of '200'
    Then I return the content of the API
@delete
  Scenario: Recording API response time, status and content
    Given That I make a GET call to an endPoint
    Then I expect status code of '200'
    Then I return the content of the API
