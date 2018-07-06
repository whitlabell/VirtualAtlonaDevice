/**
 * Websocket connector for the Atlona driver
 */

function webSocketConnector(url,username,password,callBackHandler,errorCallbackHandler) {
	
	this.url = url;
	
	this.errorCallback = errorCallbackHandler;
	this.callBack = callBackHandler;
	this.websocket = undefined;
	this.isConnected = false;
	
	this.setErrorCallbackHandler = function(handler) {errorCallback = handler;};
	
	websocket = new WebSocket(url);
	websocket.onopen =    function()             {isConnected = true;};
	websocket.onerror =   function(errorEvent)   {errorCallback(new ErrorMessage(errorEvent));};
	websocket.onclose =   function(closeEvent)   {isConnected = false; callback(closeEvent);};
	websocket.onmessage = function(messageEvent) {callback(JSON.parse(messageEvent.data));};
	
	this.send = function(cmd,driverCallback) {
		if (isConnected) {
			websocket.onmessage = driverCallback;
			websocket.send(cmd);
		}
	};
	
	this.close = function() {isConnected = false;websocket.close();};
	
}

function ErrorMessage(errorEvent) {
	this.code = -1; //default
	this.description = errorEvent.data;
}