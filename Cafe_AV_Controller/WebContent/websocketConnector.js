/**
 * Websocket connector for the Atlona driver
 */

function WebsocketConnector(url,username,password) {
	
	this.url = url;
	//username and password are not required to call the Atlona websocket connection.
	
	this.websocket = undefined;
	this.isConnected = false;
	this.that;
	var errorCallback;
	var callback;
	
	this.send = function(cmd,driverCallback) {
		if (this.isConnected) {
			websocket.onmessage = driverCallback;
			websocket.send(cmd);
		}
	};
	
	this.connect = function() {
		var that = this.that;
		websocket = new WebSocket(url);
		websocket.onopen =    function()             {this.isConnected = true;};
		websocket.onerror =   function(errorEvent)   {errorCallback(that,new ErrorMessage(errorEvent));};
		websocket.onclose =   function(closeEvent)   {isConnected = false; callback(that,closeEvent);};
		websocket.onmessage = function(messageEvent) {callback(that,JSON.parse(messageEvent.data));};
	};
	
	this.close = function() {isConnected = false;websocket.close();};
	this.setErrorCallbackHandler   = function (that,handler) {this.that = that; errorCallback = handler};
	this.setSuccessCallbackHandler = function (that,handler) {this.that = that; callback = handler};
	
}

function ErrorMessage(errorEvent) {
	this.code = -1; //default
	this.description = errorEvent.data;
}