/**
 * Connector for the Atlona that uses REST calls.
 */

function RestConnector(url,username,password) {
	this.url = url;
	this.username = username;
	this.password = password;
	this.callBack;
	this.that;
	this.errorCallBack;
	this.isConnected = false;
	this.authHeader = "";
	
	this.send = function(cmd,driverCallback) {
		var cmdUrl = encodeURI(url + "/API?method=" + cmd);
		var xhr = new XMLHttpRequest();
		//alert("cmdUrl = " + cmdUrl + ", callBack is " + typeof(this.callBack));
		var callBack = this.callBack;
		var errorCallBack = this.errorCallBack;
		var that = this.that;
		xhr.onreadystatechange = function() {
			if (this.readyState == 4) {
				if (completedSuccessfully(this.status)) {
					callBack(that,{cmd: cmd, cmdURL: new URL(cmdUrl), message: JSON.parse(this.responseText).result});
				} else {
					var message = (this.responseText =="") ? "Connection problem. Atlona device refused the API call. Status " + this.status : this.responseText;
					 
					errorCallBack(that,{command: cmd, cmdURL: new URL(cmdUrl), message: message});
				}
			}
		};
			
			xhr.open("GET",cmdUrl,true);
			//xhr.setRequestHeader("Authenticate",this.authHeader);
			xhr.send();
		
		
	};

	this.connect = function() { /* Not implemented for the REST Connector */};
	
	this.setErrorCallbackHandler = function (that,handler) {this.that = that; this.errorCallBack = handler};
	this.setSuccessCallbackHandler = function (that,handler) {this.that = that;this.callBack = handler};
	
	function completedSuccessfully(status) {
		return (status >=200 && status <=299) ? true : false;
	}
		
}

