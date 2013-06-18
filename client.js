var fsapi = {
    
    /**
     * Create (PUT)
     */
    
    // Create handler
    create: function (path, type) {
        
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
    
    // Read (GET)
    
    open: function (path) {
        
    },
    
    list: function (path) {
        
    },
    
    // Update (POST)
    
    save: function (path) {
        
    },
    
    rename: function (path, name) {
        
    },
    
    // Delete (DELETE) {
    
    delete: function (path) {
        
    }
    
};