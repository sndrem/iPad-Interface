const xml2json = require('xml2json');
const request = require('request');

const YR_BERGEN_VARSEL = 'http://api.met.no/weatherapi/nowcast/0.9/?lat=60.389444&lon=5.325659';
const YR_BERGEN_LANGTIDS_VARSEL = 'http://www.yr.no/sted/Norge/Hordaland/Bergen/Bergen/varsel.xml';

const yr = {
	getPrecication(req, res, next) {
		request.get(YR_BERGEN_VARSEL, (error, response, body) => {
			const jsonData = JSON.parse(xml2json.toJson(body));
			res.myData = {};
			res.myData.weather = jsonData.weatherdata;
			next();
		});
	},

	getWeatherForecast(req, res, next) {
		request.get(YR_BERGEN_LANGTIDS_VARSEL, (error, response, body) => {
			const jsonData = JSON.parse(xml2json.toJson(body));
			res.forecast = jsonData;
			next();
		});
	}
};

module.exports = yr;
