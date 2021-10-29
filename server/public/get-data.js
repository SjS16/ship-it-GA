"use strict";
(() => {
  const VIEW_ID = "180334846";

  const API_INFO = {
    path: "/v4/reports:batchGet",
    root: "https://analyticsreporting.googleapis.com/",
    method: "POST"
  };

  const METRICS = [
    "pageviews",
    "uniquePageviews",
    "avgTimeOnPage",
    "bounceRate",
    "exitRate"
  ];

  const THIS_WEEK = {
    startDate: "7daysAgo",
    endDate: "today"
  };
  const LAST_WEEK = {
    startDate: "14daysAgo",
    endDate: "7daysAgo"
  };

  const runQuery = metrics =>
    gapi.client.request({
      ...API_INFO,
      body: {
        reportRequests: [
          {
            viewId: VIEW_ID,
            dateRanges: [LAST_WEEK, THIS_WEEK],
            metrics: metrics.map(name => ({ expression: `ga:${name}` })),
            dimensions: [
              {
                name: "ga:deviceCategory"
              },
              {
                name: "ga:pagePath"
              }
            ],
            dimensionFilterClauses: [
              {
                filters: [
                  {
                    dimensionName: "ga:pagePath",
                    expressions: ["/\\w+$"]
                  }
                ]
              }
            ]
          }
        ]
      }
    });

  const queryGA = async metrics => {
    try {
      const response = await runQuery(metrics);
      const report = response.result.reports[0];

      const data = {};
      report.data.rows.forEach(row => {
        const deviceType = row.dimensions[0];
        const variant = row.dimensions[1];
        row.metrics.forEach((point, i) => {
          point.values.forEach((value, j) => {
            _.set(
              data,
              [variant, deviceType, metrics[j], i],
              parseFloat(value)
            );
          });
        });
      });

      var formattedJson = JSON.stringify(data, null, 2);
      document.getElementById("query-output").value = formattedJson;
    } catch (e) {
      console.error(e);
    }
  };

  window.queryReports = () => queryGA(METRICS);
})();
