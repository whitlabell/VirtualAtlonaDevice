/**
 * Connector for the Atlona that uses REST calls.
 */

function restConnector(url,username,password) {
	this.url = url;
	this.username = username;
	this.password = password;
	this.callBack;
	this.that;
	this.errorCallBack;
	this.isConnected = false;
	this.authHeader = "";
	
	this.send = function(cmd,driverCallback) {
		var cmdUrl = encodeURI(url + "/?method=" + cmd);
		var xhr = new XMLHttpRequest();
		//alert("cmdUrl = " + cmdUrl + ", callBack is " + typeof(this.callBack));
		var callBack = this.callBack;
		var that = this.that;
		xhr.onreadystatechange = function() {
			if (this.readyState == 4) {
				if (completedSuccessfully(this.status)) {
					callBack(that,{cmd: cmd, cmdURL: new URL(cmdUrl), message: JSON.parse(this.responseText).result});
				} else {
					errorCallBackHandler({command: cmd, cmdURL: new URL(cmdUrl), message: this.responseText});
				}
			}
		};
			
			xhr.open("GET",cmdUrl,true);
			//xhr.setRequestHeader("Authenticate",this.authHeader);
			xhr.send();
		
		
	};
	
	this.setErrorCallbackHandler = function (handler) {this.errorCallBack = handler};
	this.setSuccessCallbackHandler = function (that,handler) {console.info("that=" + that);this.that = that;this.callBack = handler};
	
	function completedSuccessfully(status) {
		return (status >=200 && status <=299) ? true : false;
	}
		
}

