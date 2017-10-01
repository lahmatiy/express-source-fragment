var assert = require('assert');
var express = require('express');
var http = require('http');
var path = require('path');
var sourceFragment = require('../index.js');
var PORT = process.env.PORT || 8999;

function request(options, expectedStatusCode, expectedResponse, done) {
    return function(done) {
        http.request(Object.assign({
            hostname: 'localhost',
            port: PORT,
            method: 'GET'
        }, options), function(res) {
            var actualResponse = '';

            assert.equal(res.statusCode, expectedStatusCode);

            if (expectedStatusCode === 200) {
                assert.equal(res.headers['content-type'], 'text/html; charset=utf-8');
            }

            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                actualResponse += chunk;
            });
            res.on('end', function() {
                if (typeof expectedResponse === 'string') {
                    assert.equal(actualResponse, expectedResponse);
                } else {
                    assert(expectedResponse.test(actualResponse), 'should match to ' + expectedResponse);
                }
                done();
            });
        }).end();
    };
}

describe('app.use(middleware)', function() {
    var server;
    var app;
    var tests = [
        [{ path: '/any?loc=test/fixture/script.js:2:12:5:6' }, 200, /^<div [^>]+>(\s|.)+?<\/div>$/],
        [{ path: '/any?loc=test/fixture/bad-path.js:2:12:5:6' }, 404, '[express-source-fragment] File not found: ' + path.join(process.cwd(), '/test/fixture/bad-path.js:2:12:5:6') + ' (base: ' + process.cwd() + ', requested: test/fixture/bad-path.js:2:12:5:6)'],
        [{ path: '/any?loc=test/fixture/script.js:2:12:5:6', method: 'POST' }, 200, /^<div [^>]+>(\s|.)+?<\/div>$/],
        [{ path: '/any?locx=test/fixture/script.js:2:12:5:6' }, 400, '[express-source-fragment] Parameter missed: loc']
    ];

    beforeEach(function(done) {
        app = express();
        app.use(sourceFragment());
        server = app.listen(PORT, function() {
            done();
        });
    });
    afterEach(function() {
        server.close();
    });

    tests.forEach(function(test) {
        var options = test[0];
        var statusCode = test[1];
        var response = test[2];

        it([
            options.method || 'GET',
            options.path
        ].join(' '), request(options, statusCode, response));
    });
});

describe('app.use("path", middleware)', function() {
    var server;
    var app;
    var tests = [
        [{ path: '/test?loc=test/fixture/script.js:2:12:5:6' }, 200, /^<div [^>]+>(\s|.)+?<\/div>$/],
        [{ path: '/test?loc=test/fixture/bad-path.js:2:12:5:6' }, 404, '[express-source-fragment] File not found: ' + path.join(process.cwd(), '/test/fixture/bad-path.js:2:12:5:6') + ' (base: ' + process.cwd() + ', requested: test/fixture/bad-path.js:2:12:5:6)'],
        [{ path: '/test?loc=test/fixture/script.js:2:12:5:6', method: 'POST' }, 200, /^<div [^>]+>(\s|.)+?<\/div>$/],
        [{ path: '/test?locx=test/fixture/script.js:2:12:5:6' }, 400, '[express-source-fragment] Parameter missed: loc'],
        [{ path: '/?loc=test/fixture/script.js:2:12:5:6' }, 404, /Cannot GET \//],
        [{ path: '/xx?loc=test/fixture/script.js:2:12:5:6' }, 404, /Cannot GET \/xx/]
    ];

    beforeEach(function(done) {
        app = express();
        app.use('/test', sourceFragment());
        server = app.listen(PORT, function() {
            done();
        });
    });
    afterEach(function() {
        server.close();
    });

    tests.forEach(function(test) {
        var options = test[0];
        var statusCode = test[1];
        var response = test[2];

        it([
            options.method || 'GET',
            options.path
        ].join(' '), request(options, statusCode, response));
    });
});

describe('app.get("path", middleware)', function() {
    var server;
    var app;
    var tests = [
        [{ path: '/test?loc=test/fixture/script.js:2:12:5:6' }, 200, /^<div [^>]+>(\s|.)+?<\/div>$/],
        [{ path: '/test?loc=test/fixture/bad-path.js:2:12:5:6' }, 404, '[express-source-fragment] File not found: ' + path.join(process.cwd(), '/test/fixture/bad-path.js:2:12:5:6') + ' (base: ' + process.cwd() + ', requested: test/fixture/bad-path.js:2:12:5:6)'],
        [{ path: '/test?loc=test/fixture/script.js:2:12:5:6', method: 'POST' }, 404, /Cannot POST \/test/],
        [{ path: '/test?locx=test/fixture/script.js:2:12:5:6' }, 400, '[express-source-fragment] Parameter missed: loc'],
        [{ path: '/?loc=test/fixture/script.js:2:12:5:6' }, 404, /Cannot GET \//],
        [{ path: '/xx?loc=test/fixture/script.js:2:12:5:6' }, 404, /Cannot GET \/xx/]
    ];

    beforeEach(function(done) {
        app = express();
        app.get('/test', sourceFragment());
        server = app.listen(PORT, function() {
            done();
        });
    });
    afterEach(function() {
        server.close();
    });

    tests.forEach(function(test) {
        var options = test[0];
        var statusCode = test[1];
        var response = test[2];

        it([
            options.method || 'GET',
            options.path
        ].join(' '), request(options, statusCode, response));
    });
});

describe('options', function() {
    var server;
    var app;
    var tests = [
        [{ path: '/defaultCwd?loc=test/fixture/script.js:2:12:5:6' }, 200, /^<div [^>]+>(\s|.)+?<\/div>$/],
        [{ path: '/defaultCwd?loc=script.js:2:12:5:6' }, 404, '[express-source-fragment] File not found: ' + path.join(process.cwd(), '/script.js:2:12:5:6') + ' (base: ' + process.cwd() + ', requested: script.js:2:12:5:6)'],
        [{ path: '/fixture?loc=script.js:2:12:5:6' }, 200, /^<div [^>]+>(\s|.)+?<\/div>$/],
        [{ path: '/fixture?loc=test/fixture/script.js:2:12:5:6' }, 404, '[express-source-fragment] File not found: ' + path.join(process.cwd(), 'test/fixture/', '/test/fixture/script.js:2:12:5:6') + ' (base: ' + path.join(process.cwd(), 'test/fixture') + ', requested: test/fixture/script.js:2:12:5:6)']
    ];

    beforeEach(function(done) {
        app = express();
        app.get('/defaultCwd', sourceFragment());
        app.get('/fixture', sourceFragment({
            cwd: 'test/fixture'
        }));
        server = app.listen(PORT, function() {
            done();
        });
    });
    afterEach(function() {
        server.close();
    });

    tests.forEach(function(test) {
        var options = test[0];
        var statusCode = test[1];
        var response = test[2];

        it([
            options.method || 'GET',
            options.path
        ].join(' '), request(options, statusCode, response));
    });
});
