/**
 * Javascript object to maintain the configuration settings for the Atlona device
 */

 function AtlonaSettings (storage) {
    
    var storageService = storage;
    

    this.HOST = "";
    this.PORT = 80;
    this.USERNAME = undefined;
    this.PASSWORD = undefined;
    
    this.getURL = function() {return this.HOST + ":"+this.PORT;};
    /**
     * Populates the settings values with those found in the persistent storage. Has no effect
     * if the storageService is not defined.
     */
    this.load = function() {
        if (typeof(storageService) !== "undefined") {
            if (storageService.atlonaHost)       this.HOST = storageService.atlonaHost;
            if (storageService.atlonaPort)      this.PORT = storageService.atlonaPort;
            if (storageService.atlonaUsername)  this.USERNAME = storageService.atlonaUsername;
            if (storageService.atlonaPassword)  this.PASSWORD = storageService.atlonaPassword;
            
        }
    };

    this.save = function() {
        if (typeof(storageService) !== "undefined") {
            if (this.HOST)        storageService.atlonaHost = this.HOST;
            if (this.PORT)       storageService.atlonaPort = parseInt(this.PORT);
            if (this.USERNAME)   storageService.atlonaUsername = this.USERNAME;
            if (this.PASSWORD)   storageService.atlonaPassword = this.PASSWORD;
        }
    };

    this.isValid = function() {
        
            if (this.HOST == undefined || this.HOST == "") return(false); //TODO: Check format more thoroughly.
            if (this.PORT != parseInt(this.PORT)) return(false);
            var portAsNumber = Number(this.PORT);
            if (portAsNumber < 1 || portAsNumber > 65535) return(false);
            if (this.USERNAME == undefined || this.USERNAME == "") return(false);
            if (this.PASSWORD == undefined || this.PASSWORD == "") return (false);
        return true;
    };
    
    this.isInvalid = function() { return ! this.isValid();};
    this.load();
 }