Feature: Upgrade a listing to Showcase

    Scenario: Purchase an upgrade for a listing
        Given Ricardo is logged in
        And picks one listing to upgrade
        When he buys a Showcase Upgrade
        And visits the listing page
        Then he sees the Showcase website