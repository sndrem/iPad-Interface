const xml2json = require("xml2json");
const request = require("request");
const YR_BERGEN_VARSEL = "http://api.met.no/weatherapi/nowcast/0.9/?lat=60.389444&lon=5.325659";

const yr = {
	getPrecication: function(req, res, next) {
		console.log("Should get data from yr");
		request.get(YR_BERGEN_VARSEL, (error, response, body) => {
			jsonData = JSON.parse(xml2json.toJson(body));
			res.myData = {};
			res.myData.weather = jsonData.weatherdata;
			// console.log(jsonData.weatherdata.product.time);
			next();
		})
	}
}

module.exports = yr;