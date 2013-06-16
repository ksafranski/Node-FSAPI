// Define Configuration

var config = {
    // Authentication keys
    keys: [
        '12345',
        '67890'
    ],
    // Allowed IP's or ranges ('*.*.*.*' - allow all)
    ips: [
        '*.*.*.*'
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
 
var checkKey = function (config, req) {
    // Loop through keys in config
    for (var i = 0, z = config.keys.length; i < z; i++) {
        if (config.keys[i] === req.params[0]) {
            return true;
        }
    }
    return false;
};

/**
 * Check IP
 */
 
var checkIP = function (config, req) {
    var ip = req.connection.remoteAddress.split('.'),
        curIP,
        b,
        block = [];
    for (var i=0, z=config.ips.length-1; i<=z; i++) {
        curIP = config.ips[i].split('.');
        b = 0;
        // Compare each block
        while (b<=3) {
            (curIP[b]===ip[b] || curIP[b]==='*') ? block[b] = true : block[b] = false;
            b++;
        }
        // Check all blocks
        if (block[0] && block[1] && block[2] && block[3]) {
            return true;
        }
    }
    return false;
};
 

/**
 * Check Request
 */
 
var checkReq = function (config, req, res) {
    if(!checkKey(config, req) || !checkIP(config, req)) {
        res.send(401);
        return false;
    }
    return true;
};

/**
 * Response Error
 */
 
var resError = function (code, raw, res) {
    
    var codes = {
        100: 'Unknown command',
        101: 'Bad path',
        102: 'Could not read file'
    };
    
    res.send({ "status": "error", "code": code, "message": codes[code], "raw": raw });
    return false;
    
};

/**
 * Response Success
 */
 
var resSuccess = function (data, res) {

    res.send({ "status": "success", "data": data });

};

/**
 * Merge function
 */

var merge = function (obj1,obj2) {
    var mobj = {},
        attrname;
    for (attrname in obj1) { mobj[attrname] = obj1[attrname]; }
    for (attrname in obj2) { mobj[attrname] = obj2[attrname]; }
    return mobj;
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
    
    // Check request
    checkReq(config, req, res);
    
    var path = config.base + '/' + req.params[2];
    
    switch (req.params[1]) {
        case 'dir':
            fs.readdir(path, function (err, files) {
                if (err) {
                    resError(101, err, res);
                } else {
                    
                    // Ensure ending slash on path
                    (path.slice(-1)!=='/') ? path = path + '/' : path = path;
                
                    var output = {},
                        output_dirs = {},
                        output_files = {},
                        current,
                        relpath,
                        type,
                        link;

                    // Function to build item for output objects
                    var createItem = function (current, relpath, type, link) {
                        return {
                            path: relpath,
                            type: type,
                            size: fs.lstatSync(current).size,
                            atime: fs.lstatSync(current).atime.getTime(),
                            mtime: fs.lstatSync(current).mtime.getTime(),
                            link: link
                        };
                    };
                    
                    // Sort alphabetically
                    files.sort();
                    
                    // Loop through and create two objects
                    // 1. Directories
                    // 2. Files
                    for (var i=0, z=files.length-1; i<=z; i++) {
                        current = path + files[i];
                        relpath = current.replace(config.base,"");
                        (fs.lstatSync(current).isSymbolicLink()) ? link = true : link = false;
                        if (fs.lstatSync(current).isDirectory()) {
                            output_dirs[files[i]] = createItem(current,relpath,'directory',link);
                        } else {
                            output_files[files[i]] = createItem(current,relpath,'file',link);                            
                        }
                    }
                    
                    // Merge so we end up with alphabetical directories, then files
                    output = merge(output_dirs,output_files);
                    
                    // Send output
                    resSuccess(output, res);
                }
            });
            break;
        
        case 'file':
            fs.readFile(path, 'utf8', function (err, data) {
                if (err) {
                    resError(102, err, res);
                } else {
                    resSuccess(data, res);
                }
            });
            break;
            
        default:
            // Unknown command
            resError(100, null, res);
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