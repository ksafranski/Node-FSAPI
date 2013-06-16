# Node FileSystem API

Node-FSAPI provides a RESTful (CRUD) server for interacting with remote file systems. It relies on 
GET (Read), PUT (Create), POST (Update), and DELETE (Delete) commands with a plain-language syntax. 

## Getting Started

FSAPI provides a single-file `server.js` node controller with 2 dependencies - [Restify](http://mcavage.github.io/node-restify) 
and [node-fs](http://nodejs.org/api/fs.html). The file contains a `config` object which allows for easy configuration.

### Security

The server provides 3 levels of security:

1. Key-Based: Each request requires a key be submitted in the URL
2. IP Restrictions: Supports specific IP addresses and ranges using wildcards (`*`)
3. HTTPS Support: Simply supplying a PEM-encoded key and certificate file will require HTTPS requests