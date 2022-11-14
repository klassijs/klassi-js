Feature: Save data to JSON

    @excel
    Scenario: copy the urls
      Then copy the Urls from testdata file to json file

   @new @excel
   Scenario Outline: url validation for Journals
   # Given user should launch URL
    Given User launches url from "<testData>"
    Then User refreshes the page for 1st time
    Then User refreshes the page for 2nd time
#      Then User can write to csv file

      Examples:
         |testData |
         |data 1   |
         |data 2   |
        #  |data 3   |
        #  |data 4   |
         # |data 5   |
         # |data 6   |

    @excel
    Scenario: save data
      Then write recorded data to urlData.json file
      And copy the json data to excel file