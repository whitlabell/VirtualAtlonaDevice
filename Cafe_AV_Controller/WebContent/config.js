/**
 * Javascript object to maintain the configuration settings for the Atlona device
 */

 function AtlonaConfiguration (storage) {
    
    this.storageService = storage;
    

    this.settings = {
        "URL" : "",
        "PORT" : 80,
        "USERNAME" : "admin",
        "PASSWORD": ""
    };

    /**
     * Populates the settings values with those found in the persistent storage. Has no effect
     * if the storageService is not defined.
     */
    this.loadSettings = function() {
        if (typeof(StorageService) !== "undefined") {
            if (storageService.atlonaUrl)       settings.URL = storageService.atlonaUrl;
            if (storageService.atlonaPort)      settings.PORT = storageService.atlonaPort;
            if (storageService.atlonaUsername)  settings.USERNAME = storageService.atlonaUsername;
            if (storageService.atlonaPassword)  settings.PASSWORD = storageService.atlonaPassword;
        }
    };

    this.saveSettings = function(newSettings) {
        if (typeof(StorageService) !== "undefined") {
            if (newSettings.URL)        storageService.atlonaUrl = newSettings.URL;
            if (newSettings.PORT)       storageService.atlonaPort = parseInt(newSettings.PORT);
            if (newSettings.USERNAME)   storageService.atlonaUsername = newSettings.USERNAME;
            if (newSettings.PASSWORD)   storageService.atlonaPassword = newSettings.PASSWORD;
        }
    };

    this.isValid = function() {
        
            if (settings.URL == undefined || settings.URL == "") return(false); //TODO: Check format more thoroughly.
            if (settings.PORT != parseInt(settings.PORT)) return(false);
            var portAsNumber = number(settings.PORT);
            if (portAsNumber < 1 || portAsNumber > 65535) return(false);
            if (settings.USERNAME == undefined || settings.USERNAME == "") return(false);
            if (settings.PASSWORD == undefined || settings.PASSWORD == "") return (false);
        return true;
    };

 }