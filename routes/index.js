var express = require('express');
var router = express.Router();
var async = require('async');
var request = require('supertest');

var counter = 0;

function authorize(agent, options, callback) {

}

function makeRequests(agent, options, callback) {
    var url = options.url;
    var host = options.host;
    var method = options.method;
    var start = new Date();

    counter++;
    method = method.toLowerCase();

    agent[method](url)
        .send({
            template_id: 1
        })
        .end(function (err, res) {
            var result;
            var end = new Date();

            if (err) {
                return callback(err);
            }

            result = {
                start: start,
                end: end,
                status: res.status,
                error: res.body.error
            };

            callback(null, result);
        });
};

function makeSerialRequests(options, callback) {
    var count = options.count;
    var host = options.host;
    var agent = request.agent(host);
    var tasks = [];

    counter = 0;

    agent
        .post('/signIn')
        .send({
            email: 'mcinnescooper@legalapp.com',
            password: '1q2w3e4r'
        })
        .end(function (err, res) {
            if (err) {
                return callback(err);
            }

            for (var i=0; i<count; i++) {
                tasks.push(function(cb){
                    makeRequests(agent, options, cb);
                });
            }

            async.series(tasks, callback);
        });
};

function makeParalellRequests(options, callback) {
    var count = options.count;
    var host = options.host;
    var agent = request.agent(host);
    var tasks = [];

    counter = 0;

    agent
        .post('/signIn')
        .send({
            email: 'mcinnescooper@legalapp.com',
            password: '1q2w3e4r'
        })
        .end(function (err, res) {
            if (err) {
                return callback(err);
            }

            for (var i=0; i<count; i++) {
                tasks.push(function(cb){
                    makeRequests(agent, options, cb);
                });
            }

            async.parallel(tasks, callback);
        });
};

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.get('/makeRequests', function (req, res, next) {
    res.render('makeRequests', {title: 'Make Requests', results: null});
});

router.post('/makeRequests', function (req, res, next) {
    var options = req.body;
    var type = options.type;
    var func;

    if (type === 'series') {
        func = makeSerialRequests;
    } else {
        func = makeParalellRequests;
    }
    console.log('>>> type', type);
    func(options, function (err, results) {
        if (err) {
            return next(err);
        }
        res.render('makeRequests', {title: 'Make Requests', results: results});
    });
});

module.exports = router;
