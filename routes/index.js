var express = require('express');
var router = express.Router();
var skyss = require("../tools/skyss.js");
var request = require("request");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
  	title: 'Express',
  	info: "Trykk på knappen for å se når neste Bybane går..."
  });
});

router.post("/skyss", function(req, res, next) {
	skyss.getNextBybane().then(data => {
		const startTime = data[0].start;
		const text = `Neste bybane går klokken ${startTime} fra Brann Stadion til Byparken.`;
		request.get(`http://192.168.1.61:5005/sayall/${text}/nb-no/50`, (error, response, body) => {
			console.log(body);
		});
		res.send(data);
		
	});
});

module.exports = router;
