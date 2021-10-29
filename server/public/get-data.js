"use strict";
(() => {
  const VIEW_ID = "180334846";

  const API_INFO = {
    path: "/v4/reports:batchGet",
    root: "https://analyticsreporting.googleapis.com/",
    method: "POST",
  };

  const METRICS = [
    "pageviews",
    "uniquePageviews",
    "avgTimeOnPage",
    "bounceRate",
    "exitRate",
  ];

  const THIS_WEEK = {
    startDate: "7daysAgo",
    endDate: "today",
  };
  const LAST_WEEK = {
    startDate: "14daysAgo",
    endDate: "7daysAgo",
  };
  const LAST_YEAR = {
    startDate: "365daysAgo",
    endDate: "today",
  };

  const runQuery = (metrics) =>
    gapi.client.request({
      ...API_INFO,
      body: {
        reportRequests: [
          {
            viewId: VIEW_ID,
            dateRanges: [LAST_YEAR],
            metrics: metrics.map((name) => ({ expression: `ga:${name}` })),
            dimensions: [
              {
                name: "ga:deviceCategory",
              },
              {
                name: "ga:pagePath",
              },
            ],
            dimensionFilterClauses: [
              {
                filters: [
                  {
                    dimensionName: "ga:pagePath",
                    expressions: ["/\\w+$"],
                  },
                ],
              },
            ],
          },
        ],
      },
    });

  const queryGA = async (metrics) => {
    try {
      const response = await runQuery(metrics);
      const report = response.result.reports[0];

      const data = {};
      report.data.rows.forEach((row) => {
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
      // createTable(data);
      for (let variant in data) {
        createTable(variant, data[variant]);
      }
      var formattedJson = JSON.stringify(data, null, 2);
      document.getElementById("query-output").value = formattedJson;
    } catch (e) {
      console.error(e);
    }
  };

  function createTable(title, data) {
    const body = document.body;

    //variant title
    const h = document.createElement("H1");
    const t = document.createTextNode(`Variant: ${title}`);
    h.appendChild(t);
    body.appendChild(h);

    //create table
    var tbl = document.createElement("table");
    tbl.className = "gaData";
    tbl.style.width = "100px";
    tbl.style.border = "1px solid black";
    const header = tbl.createTHead();
    const row = header.insertRow(0);

    //set up data
    let devices = Object.keys(data);
    let headers = Object.keys(data[devices[0]]);

    //add in device header row
    let tr = tbl.insertRow(0);
    const th = document.createElement("th"); // TABLE HEADER.
    th.innerHTML = "Device";
    tr.appendChild(th);

    //set headers
    for (let i = 0; i < headers.length; i++) {
      const th = document.createElement("th"); // TABLE HEADER.
      th.innerHTML = toSentenceCase(headers[i]);
      tr.appendChild(th);
    }

    for (let i = 0; i < devices.length; i++) {
      let tr = tbl.insertRow(-1);
      const cell = tr.insertCell(-1);
      cell.innerHTML = toSentenceCase(devices[i]);
      for (let j = 0; j < headers.length; j++) {
        const cell = tr.insertCell(-1);
        cell.innerHTML = data[devices[i]][headers[j]];
      }
    }

    body.appendChild(tbl);
  }

  function toSentenceCase(word) {
    var result = word.replace(/([A-Z])/g, " $1");
    var finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    return finalResult;
  }

  window.queryReports = () => queryGA(METRICS);
})();
