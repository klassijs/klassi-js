@search
Feature: Searching for apps with google
  As an internet user
  In order to find out more about certain user apps
  I want to be able to search for information about the required apps
  
  Scenario: Google search for the britain's got talent app
    When I search Google for "britain's got talent app"
    Then I should see some results

  Scenario: Google search for the angry birds app
    When I search Google for "angry birds app"
    Then I should see some results