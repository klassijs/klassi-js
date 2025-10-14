module.exports = {
  /**
   * this is for your project environment setups
   * all relevant details for each environment i.e. urls, username, passwords etc.
   */
  "environment": {
    "dev": {
      "envName": "DEVELOPMENT",
      "base_url": "https://duckduckgo.com/",
      "api_base_url": "http://httpbin.org/get",
    },

    "test": {
      "envName": "TEST",
      "base_url": "https://duckduckgo.com/",
      "api_base_url": "http://httpbin.org/get",
    },

    "uat": {
      "envName": "UAT",
      "base_url": ""
    }
  },
}
