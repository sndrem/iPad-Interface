var express = require('express');
var router = express.Router();
var skyss = require("../tools/skyss.js");
var request = require("request");

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Bybanetider'
    });
});

router.post("/skyss", function(req, res, next) {
    
    if (req.body.from && req.body.to && req.body.silent) {
        skyss.getNextBybane(req.body.from, req.body.to).then(data => {
            const startTime = data[0].start;
            
            if(req.body.silent === 'false') {
            	const text = `Neste bybane går klokken ${startTime} fra ${req.body.from} til ${req.body.to}.`;
	            request.get(`http://192.168.1.61:5005/sayall/${text}/nb-no/50`, (error, response, body) => {
	            });
            }
            res.send(data);
        });
    }

});

module.exports = router;