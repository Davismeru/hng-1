const { log } = require("console");
const express = require("express");
const app = express();
const geoip = require("geoip-lite");

const PORT = process.env.PORT || 3000;
const http = require("https");

app.get(`/api/hello?:visitor_name`, (req, res) => {
  const { visitor_name } = req.query;
  // get the ip adress
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const ip = clientIp.split(",")[0];

  // use geo to get details about the ip (city)
  const geo = geoip.lookup(ip);
  const getCity = geo?.city;
  // get weather details
  const request = http.request(
    {
      method: "GET",
      hostname: "yahoo-weather5.p.rapidapi.com",
      port: null,
      path: `/weather?location=${getCity}&format=json&u=f`,
      headers: {
        "x-rapidapi-key": "37660475bfmsh04f6579feda28b8p1b5fb5jsn95c614e25226",
        "x-rapidapi-host": "yahoo-weather5.p.rapidapi.com",
      },
    },
    function (response) {
      const chunks = [];

      response.on("data", function (chunk) {
        chunks.push(chunk);
      });

      response.on("end", function () {
        const body = Buffer.concat(chunks);
        const data = JSON.parse(body);
        const getTemp = data.current_observation.condition.temperature;

        res.json({
          client_ip: ip,
          location: getCity,
          greeting: `Hello, ${visitor_name}, the temperature is ${getTemp} degrees Celcius in ${getCity}`,
        });
      });
    }
  );

  request.end();
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
