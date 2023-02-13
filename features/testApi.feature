@tapi
Feature: The API feature/functionality
  Background: Then user login to the Site
    Given I am logged into the Site

  @get
  Scenario:
    When I make a GET call to an endPoint and get a statusCode of 200

  @put
  Scenario:
    When I do a PUT to an endPoint and edit a user

  @post
  Scenario:
    When I do a POST to an endPoint and invite a user

  @delete
  Scenario:
    When I do a DELETE to an endPoint and delete a user