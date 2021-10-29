"use strict";
(() => {
  const VIEW_ID = "180334846";

  const API_INFO = {
    path: "/v4/reports:batchGet",
    root: "https://analyticsreporting.googleapis.com/",
    method: "POST"
  };

  window.queryReports = () => {
    gapi.client
      .request({
        ...API_INFO,
        body: {
          reportRequests: [
            {
              viewId: VIEW_ID,
              dateRanges: [
                {
                  startDate: "14daysAgo",
                  endDate: "7daysAgo"
                },
                {
                  startDate: "7daysAgo",
                  endDate: "today"
                }
              ],
              metrics: [
                {
                  expression: "ga:pageviews"
                },
                {
                  expression: "ga:uniquePageviews"
                },
                {
                  expression: "ga:avgTimeOnPage"
                },
                {
                  expression: "ga:bounceRate"
                }
              ],
              dimensions: [
                {
                  name: "ga:deviceCategory"
                }
              ]
            }
          ]
        }
      })
      .then(displayResults, console.error.bind(console));
  };

  function displayResults(response) {
    var formattedJson = JSON.stringify(response.result.reports[0], null, 2);
    document.getElementById("query-output").value = formattedJson;
  }
})();
