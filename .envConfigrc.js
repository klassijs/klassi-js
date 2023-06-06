/**
 * klassi-js
 * Copyright © 2016 - Larry Goddard

 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */
module.exports = {
  /**
   * this is for your environment setups
   */
  environment: {
    test: {
      envName: "TEST",
      web_url: "https://duckduckgo.com/",
      api_base_url: "http://httpbin.org/get",
    },

    dev: {
      envName: "DEVELOPMENT",
      web_url: "https://duckduckgo.com/",
      api_base_url: "http://httpbin.org/get",
    },
  }
};
