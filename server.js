// Define Configuration

var config = {
    // Authentication keys
    keys: [
        '12345',
        '67890'
    ],
    // Port designation
    port: 8080
};


// Set up Restify
var restify = require('restify');

var server = restify.createServer({
    name: 'fsapi',
    version: '0.0.1'
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

// Defines request URL split /{key}/{action}/{path} 
var reqRegEx = /^\/([a-zA-Z0-9_\.~-]+)\/([a-zA-Z0-9_\.~-]+)\/(.*)/;

/**
 * Check Key
 */
 
var checkKey = function (config, req, res) {
    // Loop through keys in config
    for (var i = 0, z = config.keys.length; i < z; i++) {
        if (config.keys[i] === req.params[0]) {
            return true;
        }
    }
    // Failed key, 401 - Unauthorized
    res.send(401);
    return false;
};

/**
 * GET
 */
server.get(reqRegEx, function (req, res, next) {
    checkKey(config, req, res);
    res.send(req.params);
    return next();
});

/**
 * PUT
 */
server.put(reqRegEx, function (req, res, next) {
    res.send(req.params);
    return next();
});

/**
 * POST
 */
server.post(reqRegEx, function (req, res, next) {
    res.send(req.params);
    return next();
});

/**
 * DELETE
 */
server.del(reqRegEx, function (req, res, next) {
    res.send(req.params);
    return next();
});

/**
 * START SERVER
 */
server.listen(config.port, function () {
    console.log('%s listening at %s', server.name, server.url);
});