var url = require('url');
var fs = require('fs');
var path = require('path');
var sf = require('source-fragment');
var MESSAGE_PREFIX = '[' + require('./package.json').name + '] ';

function fail(res, code, message) {
    res.statusCode = code;
    res.end(MESSAGE_PREFIX + message);
}

module.exports = function(options) {
    var cwd = path.resolve((options && options.cwd) || process.cwd());
    return function openInEditor(req, res, next) {
        var queryLoc = url.parse(req.url, true).query.loc;
        var loc;

        if (!queryLoc) {
            return fail(res, 400, 'Parameter missed: loc');
        }

        // resolve to absolute path
        loc = path.join(cwd, path.resolve('/', queryLoc));

        if (!fs.existsSync(loc.replace(/(:\d+)+$/, ''))) {
            return fail(res, 404,
                'File not found: ' + loc + ' (base: ' + cwd + ', requested: ' + queryLoc + ')'
            );
        }

        try {
            res.statusCode = 200;
            res.set('Content-Type', 'text/html; charset=utf-8');
            res.end(sf(loc, { format: 'html' }));
        } catch (e) {
            fail(res, 500, 'ERROR: ' + e);
        }
    };
};
