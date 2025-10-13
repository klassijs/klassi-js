Feature: Sending results information
  I want to be able to email my results

  @s3
  Scenario: User access and send data
    Then Compiling and sending the resulting test report data

  @s3load
  Scenario: Merging all Json files to create one Html
    Then combining the jsons to create one html file

