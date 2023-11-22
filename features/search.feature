@regression @integration
Feature: Searching for apps with duckduckgo
  As an internet user
  In order to find out more about certain user apps
  I want to be able to search for information about the required apps

  @search
  Scenario Outline: User inputs <searchword> and searches for data
    Given The user arrives on the duckduckgo search page
    When they input <searchword>
    Then they should see some results <searchword>

    Examples:
      | searchword |
      | mango |
      | traffic |


