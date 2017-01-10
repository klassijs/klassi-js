@klassi
  Feature: Shopping for a Bikini
    I can search for and purchase a bikini

  Scenario: View product details
    Given I am on klassifashion home page
    When I click navigation item "Bikini"
    And I click product item "Strappy Bra and Low Waist Blue Panty Swimwear"
    Then I should see the product details with title "Strappy Bra and Low Waist Blue Panty Swimwear"
