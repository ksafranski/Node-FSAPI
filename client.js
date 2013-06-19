var fsapi = {
    
    /**
     * Config
     * 
     * Set: fsapi.config({url},{key});
     * Get: fsapi.config();
     * 
     */
     
    config: function () {
        
        if (arguments.length) {
            // Set values
            this.store('url', arguments[0]);
            this.store('key', arguments[1]);
        } else {
            return {
               url: this.store('url'),
               key: this.store('key')
            };
        }
        
    },
    
    /**
     * Disconnect, remove local stores
     */
    
    disconnect: function () {
        this.store('url', null);
        this.store('key', null);
    },
    
    /**
     * Validate
     * 
     * Parse and validate responses
     */
     
    validate: function (data) {
        
    },
    
    /**
     * Create (PUT)
     */
    
    // Create handler
    create: function (path, type) {
        var _this = this;
        this.ajax({
            url: this.config.url() + '/' + this.config().key + '/' + type + '/' + path,
            type: 'GET',
            success: function (data) {
                _this.validate(data);
            },
            error: function () {
                console.error('FSAPI CONNECT ERROR');
                return false;
            }
        });
    },
    
    // Proxy for create (file)
    createFile: function (path) {
        this.create(path, 'file');
    },
    
    // Proxy for create (dir)
    createFolder: function (path) {
        this.create(path, 'dir');
    },
    
    // Copy file or directory
    copy: function (path, destination) {
        
    },
    
    // Performs copy, then delete original
    move: function (path, destination) {
        
    },
    
    /**
     * Read (GET)
     */
    
    open: function (path) {
        
    },
    
    list: function (path) {
        
    },
    
    /**
     * Update (POST)
     */
    
    save: function (path) {
        
    },
    
    rename: function (path, name) {
        
    },
    
    /**
     * Delete (DELETE)
     */
    
    delete: function (path) {
        
    },
    
    /**
     * AJAX Handler
     * @param {String} url URL of the resource
     * @param {Object} [config] Configuration object passed into request
     * 
     * **Configuration Object:**
     * 
     * `url`: URL of request if not specified as first argument
     * 
     * `type`: Request method, defaults to `GET`
     * 
     * `async`: Run request asynchronously, defaults to `TRUE`
     * 
     * `cache`: Cache the request, defaults to `TRUE`
     * 
     * `data`: Object or JSON data passed through request
     * 
     * `success`: Function called on successful request
     * 
     * `error`: Function called on failure of request
     * 
     * `qsData`: Allows blocking (set `false`) of `data` add to URL for RESTful requests
    */
    
    ajax: function() {

        // Parent object for all parameters
        var xhr = {};
    
        // Determine call structure: ajax(url, { params }); or ajax({ params });
        if (arguments.length === 1) {
            // All params passed as object
            xhr = arguments[0];
        } else {
            // Populate xhr obj with second argument
            xhr = arguments[1];
            // Add first argument to xhr object as url
            xhr.url = arguments[0];
        }        
    
        // Parameters & Defaults
        xhr.request = false;
        xhr.type = xhr.type || "GET";
        xhr.data = xhr.data || null;
        if (xhr.qsData || !xhr.hasOwnProperty("qsData")) { xhr.qsData = true; } else { xhr.qsData = false; }
        if (xhr.cache || !xhr.hasOwnProperty("cache")) { xhr.cache = true; } else { xhr.cache = false; }
        if (xhr.async || !xhr.hasOwnProperty("async")) { xhr.async = true; } else { xhr.async = false; }
        if (xhr.success && typeof xhr.success === "function") { xhr.success = xhr.success; } else { xhr.success = false; }
        if (xhr.error && typeof xhr.error === "function") { xhr.error = xhr.error; } else { xhr.error = false; }
        
        // Format xhr.data & encode values
        if (xhr.data) {
            var param_count = 0,
                name,
                value,
                tmp_data = xhr.data;
            for (var param in tmp_data) {
                if(tmp_data.hasOwnProperty(param)){
                    name = encodeURIComponent(param);
                    value = encodeURIComponent(tmp_data[param]);
                    if (param_count === 0) {
                        xhr.data = name + "=" + value;
                    } else {
                        xhr.data += "&" + name + "=" + value;
                    }
                    param_count++;
                }
            }
            xhr.data = xhr.data;
        }
    
        // Appends data to URL
        function formatURL(data) {
            var url_split = xhr.url.split("?");
            if (url_split.length !== 1) {
                xhr.url += "&" + data;
            } else {
                xhr.url += "?" + data;
            }
        }
    
        // Handle xhr.data on GET request type
        if (xhr.data && xhr.type.toUpperCase() === "GET" && xhr.qsData) {
            formatURL(xhr.data);
        }
    
        // Check cache parameter, set URL param
        if (!xhr.cache) {
            formatURL(new Date().getTime());
        }
    
        // Establish request
        if (window.XMLHttpRequest) {
            // Modern non-IE
            xhr.request = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            // Internet Explorer
            xhr.request = new ActiveXObject("Microsoft.XMLHTTP");
        } else {
            // No request object, break
            return false;
        }
    
        // Monitor ReadyState
        xhr.request.onreadystatechange = function () {
            if (xhr.request.readyState === 4) {
                if (xhr.request.status === 200) {
                    if (xhr.success) {
                        // Returns responseText and request object
                        xhr.success(xhr.request.responseText, xhr.request);
                    }
                } else {
                    if (xhr.error) {
                        // Returns request object
                        xhr.error(xhr.request);
                    }
                }
            }
        };
    
        // Open Http Request connection
        xhr.request.open(xhr.type, xhr.url, xhr.async);
    
        // Set request header for POST
        if (xhr.type.toUpperCase() === "POST" || xhr.type.toUpperCase() === "PUT") {
            xhr.request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        }
    
        // Send data
        xhr.request.send(xhr.data);
    
    },
    
    /**
     * LocalStorage with polyfill support via cookies
     * 
     * @param {String} key The key or identifier for the store
     * @param {String|Object} [value] Contents of the store, blank to return, 'null' to clear
     * 
     * Specify a string/object value to `set`, none to `get`, and 'null' to `clear`
     */
    store: function (key, value) {

        var _this = this,
            lsSupport = false;

        // Check for native support
        if (localStorage) {
            lsSupport = true;
        }

        // If value is detected, set new or modify store
        if (typeof value !== "undefined" && value !== null) {
            // Stringify objects
            if(typeof value === "object") {
                value = JSON.stringify(value);
            }
            // Add to / modify storage
            if (lsSupport) { // Native support
                localStorage.setItem(key, value);
            } else { // Use Cookie
                _this.createCookie(key, value, 30);
            }
        }

        // No value supplied, return value
        if (typeof value === "undefined") {
            if (lsSupport) { // Native support
                return localStorage.getItem(key);
            } else { // Use cookie
                return _this.readCookie(key);
            }
        }

        // Null specified, remove store
        if (value === null) {
            if (lsSupport) { // Native support
                localStorage.removeItem(key);
            } else { // Use cookie
                _this.createCookie(key, "", -1);
            }
        }

    },
    
    /**
     * Creates new cookie or removes cookie with negative expiration
     * 
     * @param {String} key The key or identifier for the store
     * @param {String} value Contents of the store
     * @param {Number} exp Expiration in days
     */
    createCookie: function(key, value, exp) {
        var date = new Date(),
            expires;
        date.setTime(date.getTime() + (exp * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
        document.cookie = key + "=" + value + expires + "; path=/";
    },
    
    /**
     * Reads cookie
     * 
     * @param {String} key The key or identifier for the store
     * @return {String} the value of the cookie
     */
    readCookie: function(key) {
        var nameEQ = key + "=",
            ca = document.cookie.split(";");
        for (var i = 0, max = ca.length; i < max; i++) {
            var c = ca[i];
            while (c.charAt(0) === " ") { c = c.substring(1, c.length); }
            if (c.indexOf(nameEQ) === 0) { return c.substring(nameEQ.length, c.length); }
        }
        return null;
    }
    
    
    
};