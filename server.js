// Define Configuration

var config = {
    // Authentication keys
    keys: [
        '12345',
        '67890'
    ],
    // Port designation
    port: 8080,
    // Base directory
    base: 'testdir' 
};


var fs = require('fs'),
    restify = require('restify'),
    server = restify.createServer({
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
 * 
 * Commands:
 * ls - List files in directory
 * cat - Return file contents
 * 
 */
server.get(reqRegEx, function (req, res, next) {
    checkKey(config, req, res);
    
    var path = config.base + '/' + req.params[2];
    
    switch (req.params[1]) {
        case 'ls':
            fs.readdir(path, function (err, files) {
               res.send(files); 
            });
            break;
        
        case 'cat':
            fs.readFile(path, function (err, data) {
                console.log(data);
                res.send(data);
            });
            break;
    }
    
    //res.send(req.params);
    return next();
});

/**
 * PUT
 * 
 * Commands:
 * touch - create new file (optional 'data' param contains contents)
 * mkdir - create new folder
 * 
 */
server.put(reqRegEx, function (req, res, next) {
    res.send(req.params);
    return next();
});

/**
 * POST
 * cp - copy 
 * 
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