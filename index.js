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
        "x-rapidapi-key": "a4fe04fc2cmsha68131baaac141cp108c73jsnecd6ec12b73e",
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
        const getTemp = Math.round((data.current_observation.condition.temperature-32)*5/9);;

        res.json({
          client_ip: ip, // The IP address of the requester
          location: getCity, // The city of the requester
          greeting: `Hello, ${visitor_name.charAt(0).toUpperCase() + visitor_name.slice(1)}!, the temperature is ${getTemp} degrees Celcius in ${getCity}`,
        });
      });
    }
  );

  request.end();
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
