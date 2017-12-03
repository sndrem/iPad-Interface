const request = require("request");
const cheerio = require("cheerio");
const moment = require("moment");


const skyssService = {

    getNextBybane: function(from, to) {
        const now = moment();
        const date = this.formatDate(now.date(), now.month(), now.year());
        const time = `${now.hours() < 10 ? '0' + now.hours() : now.hours()}:${now.minute() < 10 ? '0' + now.minute() : now.minute()}`
        const skyssUrl = this.createSkyssUrl(from, to, date, time);
        return new Promise((resolve, reject) => {
            request.get(skyssUrl, (error, response, body) => {
            	const times = this.extractTimeTableTimes(body);
                resolve(times);
            });
        });
    },

    extractTimeTableTimes: function(body) {
        const $cheerio = cheerio.load(body);
        const times = new Array();
        $cheerio(".tm-result-header .tm-result-time").each((index, header) => {
            const startTime = $cheerio(header).children().first();
            const endTime = $cheerio(header).children().last();

            const aTime = $cheerio(startTime).children().last().text();
            const bTime = $cheerio(endTime).children().last().text();

            times.push({
                start: aTime,
                end: bTime
            });
        });
        return times;
    },

    // date must have format: day.month.year (2017)
    // hour must have format: hour:minute
    createSkyssUrl: function(from, to, date, time) {
        const skyssUrl = `https://reiseplanlegger.skyss.no/scripts/TravelMagic/TravelMagicWE.dll/svar?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&direction=1&lang=nn&instant=1&date=${date}&time=${time}`
        return skyssUrl;
    },

    formatDate: function(day, month, year) {
        // moment.month() starter på 0 for januar til 11 for desember
        // derfor +1
        day = day < 10 ? '0' + day : day;
        month = month + 1;
        month = month < 10 ? '0' + month : month;
        return `${day}.${month}.${year}`;
    },

    formatTime: function(hour, min) {
    	hour = hour < 10 ? '0' + hour : hour;
    	min = min < 10 ? '0' + min : min;
    	return `${hour}:${min}`
    }
}


module.exports = skyssService;