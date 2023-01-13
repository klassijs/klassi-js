@uattest
Feature: Searching for apps with duckduckgo
  As an internet user
  In order to find out more about certain user apps
  I want to be able to search for information about the required apps

  @search
  Scenario Outline: User inputs <searchword> and searches for data
    Given The user arrives on the duckduckgo search page
#    Then Add modHeader <extName> <Username> <password>
    When they input <searchword>
    Then they should see some results

    Examples:
      | searchword | extName   | Username | password |
      | mango | modHeader | username | password |
      | traffic | modHeader | username | password |

  @skip
  Scenario: Example for conditionally skipping tests
    Given This step will always pass