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

// Defines request URL split /{key}/{command}/{path} 
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
 * Response Error
 */
 
var resError = function (code, res) {
    
    var codes = {
        100: 'Bad path',
        101: 'Could not read file'
    };
    
    res.send({ "status": "error", "code": code, "message": codes[code] });
    return false;
    
};

/**
 * Response Success
 */
 
var resSuccess = function (data, res) {

    res.send({ "status": "success", "data": data });

};

/**
 * GET (Read)
 * 
 * Commands:
 * dir - list contents of directory
 * file - return content of a file
 * 
 */
server.get(reqRegEx, function (req, res, next) {
    checkKey(config, req, res);
    
    var path = config.base + '/' + req.params[2];
    
    switch (req.params[1]) {
        case 'dir':
            fs.readdir(path, function (err, files) {
               if (err) {
                   resError(100, res);
               } else {
                   resSuccess(files, res);
               }
            });
            break;
        
        case 'file':
            fs.readFile(path, 'utf8', function (err, data) {
                if (err) {
                    resError(101, res);
                } else {
                    resSuccess(data, res);
                }
            });
            break;
    }
    
    //res.send(req.params);
    return next();
});

/**
 * PUT (Create)
 * 
 * Commands:
 * dir - creates a new directory
 * file - creates a new file (optional param 'data' with contents of file)
 * copy - copies a file or dirextory (to path at param 'destination')
 * 
 */
server.put(reqRegEx, function (req, res, next) {
    res.send(req.params);
    return next();
});

/**
 * POST (Update)
 * 
 * Commands:
 * rename - renames a file or folder (using param 'name')
 * save - saves contents to a file (using param 'data')
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