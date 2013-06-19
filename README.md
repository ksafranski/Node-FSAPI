# Node FileSystem API

Node-FSAPI provides a RESTful (CRUD) server for interacting with remote file systems. It relies on 
GET (Read), PUT (Create), POST (Update), and DELETE (Delete) commands with a plain-language syntax. 

## Getting Started

FSAPI provides a single-file `server.js` node controller with 2 core dependencies - [Restify](http://mcavage.github.io/node-restify) 
and [node-fs-extra](https://github.com/jprichardson/node-fs-extra). The file contains a `config` object which allows for easy configuration.

### Security

The server provides 3 levels of security:

1. Key-Based: Each request requires a key be submitted in the URL
2. IP Restrictions: Supports specific IP addresses and ranges using wildcards (`*`)
3. HTTPS Support: Simply supplying a PEM-encoded key and certificate file will require HTTPS requests

### Configuration

The server uses a `config` object to easily setup how it will run:

**Keys**

The `config.keys` array simply contains a list of keys that get sent along with the request.

**IP Restrictions**

The `config.ips` array allows providing a list of allowed IP addresses and ranges. Several format examples are:

```
"*.*.*.*"      // Allow all IP's through
"192.168.*.*"  // Allow only IP's on the 192.168.(...) range to make requests
"192.168.1.1"  // Allow only the specific address to make requests
```

**SSL Certificate**

An SSL Certificate can be supplied by providing a PEM-encoded `key` and `cert`. Setting either or both of these properties to `false` results in no SSL.

**Port**

The `config.port` property sets the server port to be used.

**Base Directory**

The `config.base` property sets the base (or root) directory where files will reside. This is relative to the server file.

**Create Mode**

The `config.cmode` sets the permissions that will be applied on file creation. Default is `0755`.

## Usage

Requests to the server are made via RESTful methods - GET, PUT, POST and DELETE. Below is a breakdown of the methods and their associated methods:

### GET (Read)

**Directory Listing**

`GET => {server}:{port}/{key}/dir/{path}`

**Read File**

`GET => {server}:{port}/{key}/file/{path}`

### PUT (Create)

**Create Directory**

`PUT => {server}:{port}/{key}/dir/{path}`

**Create File**

`PUT => {server}:{port}/{key}/file/{path}`

**Copy Directory or File**

`PUT => {server}:{port}/{key}/copy/{path}`

PUT parameter `destination` required with the FULL detination path

### POST (Update)

**Rename File or Directory**

`POST => {server}:{port}/{key}/rename/{path}`

POST parameter `name` required with the new file or directory name (no path required)

**Save Contents to File**

`POST => {server}:{port}/{key}/save/{path}`

POST parameter `data` is required with the contents to be saved

### DELETE

**Delete a File or Directory**

`DELETE => {server}:{port}/{key}/{path}`

## Responses

### Authentication Failure

All authentication failures will result in an http 401 status (Not Authorized)

### Success Response

On a successful request the server will respond with the following JSON formatted return:

```
{
  "status": "success",
  "data": "{any return data}"
}
```

Most successful responses will contain `null` for data.

### Error Response

On an erroroneous request the server will respond with the following JSON formatted return:

```
{
  "status": "error",
  "code": "{3-digit error response code}",
  "message": "{brief explanation of error condition}",
  "raw": "{raw error message from node}"
}
```

## Working with the Client Methods

The `client.js` file provides method for easily connecting to and interacting with the server.

### Config

Initially it is important to define the connection information, which is done through the following:

```
fsapi.config("http://yourserver:port","api-key");
```

The config process (with arguments) sets these values into localStorage (with Cookie fallback). Calling `fsapi.config()` without 
arguments will return an object with the url and key. You can change either value individually using:

```
// Set new URL
fsapi.store('fsapiUrl', {new-value});

// Set new Key
fsapi.store('fsapiKey', {new-value});
```

### Methods

The following methods are natively available, but can easily be expanded upon:

```
// List Contents of Directory
fsapi.list(path, callback);

// Return Contents of File
fsapi.open(path, callback);

// Create a New File
fsapi.createFile(path, callback);

// Create a New Directory
fsapi.createDirectory(path, callback);

// Create a Copy of a File or Directory (recursive)
fsapi.copy(path, destination, callback);

// Move a File or Directory (Cut+Paste)
fsapi.move(path, destination, callback);

// Save Contents to a File
fsapi.save(path, contents, callback);

// Rename a File or Directory
fsapi.rename(path, new_name, callback);

// Delete a File or Directory
fsapi.delete(path, callback);
```

Callbacks for each method returns the response from the server by passing in the `data` argument.
