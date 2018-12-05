/**
 * Simple javascript web server to mimic an Atlona switcher. Maintains internal state and respects parameters to
 * each API call, so you can use it to test your GUI when you don't have a physical device handy.
 * TODO: We need to see how the actual device handles error conditions like missing params and invalid params.
 * Run using node.js
 * 
 * Written by Gary Bell, February 2018
 */

var app = require('express')();
var http = require('http').Server(app);
var WebSocket = require('ws');
var ws = new WebSocket.Server({ server: http });

var hostname = '192.168.0.107';
var port = 3000;

var inputNumberFor  = {"USBC":0,"DISPLAYPORT":1,"HDMI3":2,"HDMI4":3,"BYOD":4};
var lifecycleStates = ["BOOTING","RUNNING","RESTART_REQUESTED","RESTARTING","SHUTDOWN_REQUESTED","SHUTDOWN"];

var internal_state = {
		audio : {
			muteanalog: true,
			mutehdmi: true,
			volume: -40 // half way
		},
		display : {
			state: false, //off
			
			activeinput: 0,
			connectionstatus: [true,false,true,false,false],
			byod: {type:"",subypte:""}
		},
		instruments : {
			temperature: 293.15, //20 celcius 
			scale: "kelvins"
		},
		misc : {
			model: "AT-UHD-SW-510W",
			master: "0.1.21-14",
			MCU: "V0.5.00",
			state: lifecycleStates.RUNNING // internal use only, not an Atlona API
		}
};


var factory_state = Object.assign({},internal_state); //used for reset command
var allowableSyntax = {
		"Audio:Mute:Get" : [],
		"Audio:Mute:Set" : ["hdmi","analog"],
		"Audio:Volume:Decrease" : ["increment"],
		"Audio:Volume:Get" : [],
		"Audio:Volume:Increase" : ["increment"],
		"Audio:Volume:Set" : ["volume"],
		"Display:BYOD:Kick" : [],
		"Display:Get" : [],
		"Display:Input:Get" : [],
		"Display:Input:Set" : ["input"],
		"Display:Input:Status:All:Get" : [],
		"Display:Input:Status:Get" : ["input"],
		"Display:Set" : ["value"],
		"Instruments:Temperature:Get" : ["scale"],
		"Misc:Model:Get" : [],
		"Misc:Version:Get" : ["key1","key2"],
		"Misc:Versions:Get" : [],
		"Platform:Reset" : ["subsystem","key2"],
		"Platform:Restart" : [],
		"Platform:Shutdown" : []
		
		
};

/*
 * HTML REST Handling functions
 */

app.get('/API',function(request, response) {
	var {method,url} = request;
	console.info("Incoming REST request: Method="+method);
	// Handle OPTIONS queries that originate from browsers doing CORS checks. We will not set any CORS headers.
	// as that is what the Atlona does
	if (method == "OPTIONS") {
		console.info("Handling an OPTIONS request.");
		response.writeHead(
			   "204",
			   "No Content",
			   {
			     //"access-control-allow-origin": "*",
			     //"access-control-allow-methods": "GET, OPTIONS",
			     //"access-control-allow-headers": "content-type, accept",
			     //"access-control-max-age": -1, // disabled.
			     "content-length": 0
			   }
			 );
			 return( response.end());
	}

	var requestParams = require('querystring').parse( require('url').parse(url).query);
	var cmd = requestParams.method;
	var param = requestParams.parameter; 
	delete requestParams.method; //requestParams only holds command parameters now.
 
	var paramCheck = checkUserInput(cmd, requestParams);
	if (paramCheck.ok) {
		response.statusCode = 200;
		console.info("Received command: " + cmd);
		response.setHeader('Content-Type', 'application/json');
		response.setHeader('access-control-allow-origin','*');
		response.setHeader('access-control-allow-methods','GET,OPTIONS');
	  
		var responseFunctionName = generateFunctionName(cmd);
		var jsonResponse = responseHandlers[responseFunctionName](requestParams);
		response.end(JSON.stringify(jsonResponse));
	 
		if (internal_state.misc.state === lifecycleStates.SHUTDOWN_REQUESTED) {
			console.warn("Shutdown requested, stopping server...");
			//server.close();
			internal_state.misc.state = lifecycleStates.SHUTDOWN;
		}
	  
	} else {
	 // Request from client is not valid. Need to find out what the actual Atlona device sends back in this case.
	 console.warn("Invalid command received: " + cmd);
	 response.statusCode = 400; //BAD REQUEST
	 response.setHeader('Content-Type', 'text/plain');
	 response.end(paramCheck.msg);
	}
  
});



/*
 * WEBSOCKET Handling functions
 */
http.on('upgrade', function upgrade(request, socket, head) {
	console.log("html upgrade to websocket requested.");
	ws.handleUpgrade(request, socket, head, function(ws) {
		console.log("Upgrade completed.");
	});
});

ws.on('connection', function connection(ws2) {
	  ws2.on('message', function incoming(message) {
	    console.log('received: %s', message);
	  });

	  ws2.send('{"result": {"success": true},"jsonrpc": "2.0"}');
	});

http.listen(port, function() {
	  console.log(`Server running at http://${hostname}:${port}/`);
});


/*
 * UTILITY FUNCTIONS
 */
  function checkUserInput(cmd,kv_params) {
	  if (allowableSyntax[cmd] === undefined) return {ok : false, msg: cmd + " is not a recognised command. Check Atlona API docs."};
	  if (allowableSyntax[cmd].length > 0 && kv_params.length == 0 ) return {ok : false, msg : cmd + " needs at least one parameter"};
	  if (kv_params.length > allowableSyntax[cmd].length) return {ok : false, msg : "too many parameters passed with command " + cmd};
	  
	  //Check passed parameters are permitted.
	  for (var param in kv_params) {
		  if (allowableSyntax[cmd].indexOf(param) === -1 ) return {ok : false, msg: "Invalid parameter " + param + " passed to " + cmd};
	  }
	  return {ok : true};
  }
  
 function generateFunctionName(cmd) {
	 var handler = cmd.replace(/:/g,"_");
	 console.info("handler function for " + cmd + " is " + handler + "\n");
	 return handler;
 }
 
 
 var responseHandlers = { };
 
  responseHandlers.Audio_Mute_Get = function() {
	var response = {
				result: {
						muteanalog: internal_state.audio.muteanalog,
						mutehdmi: internal_state.audio.mutehdmi
					  },
			jsonrpc: "2.0"
	   };
	return response;
};

 responseHandlers.Audio_Mute_Set = function(kv_params) {
	var success = false;
	if (kv_params.hdmi) {
		success = true;
		internal_state.audio.mutehdmi = kv_params.hdmi;
	}
	if (kv_params.analog) {
		success = true;
		internal_state.audio.muteanalog = kv_params.analog;
	}
	
	 return (success)? success_response : failure_response;
};

responseHandlers.Audio_Volume_Decrease = function(kv_params) {
	if (Number(kv_params.increment)) {
			internal_state.audio.volume -= Number(kv_params.increment);
			if (internal_state.audio.volume < -80 ) internal_state.audio.volume = -80;
			var response = {
						result: {
								volume: internal_state.audio.volume,
								success: true
							},
					jsonrpc: "2.0"
				};
			return response;
			
	} else {
		return failure_response;
	}
};

responseHandlers.Audio_Volume_Get = function() {
	return {	
		result: {
			volume: internal_state.audio.volume
		  },
		jsonrpc: "2.0"

	};
};


responseHandlers.Audio_Volume_Increase = function(kv_params) {
	if (Number(kv_params.increment)) {
		internal_state.audio.volume += Number(kv_params.increment);
		if (internal_state.audio.volume > 0 ) internal_state.audio.volume = 0;
		var response = {
					result: {
							volume: internal_state.audio.volume,
							success: true
						},
				jsonrpc: "2.0"
			};
		return response;
		
	} else {
		return failure_response;
	}
};

responseHandlers.Audio_Volume_Set = function(kv_params) {
	if (Number(kv_params.volume)) {
		internal_state.audio.volume = kv_params.volume;
		return success_response;
	} else {
		return failure_response;
	}
};

responseHandlers.Display_BYOD_Kick = function() {
	internal_state.display.connectionstatus[inputNumberFor["BYOD"]] = false;
	internal_state.display.byod.type = "";
	internal_state.display.byod.subtype = "";
	return success_response;
};

responseHandlers.Display_Get = function() {
	return {
		result: {
			state: internal_state.display.state
		}
	};
};

responseHandlers.Display_Input_Get = function() {
	var response = {
			result: {
				input: internal_state.display.activeinput
			},
			jsonrpc: "2.0"
	};
	if (internal_state.display.activeinput == inputNumberFor["BYOD"]) {
		response.result.type = internal_state.display.byod.type;
		//TODO: See if the actual unit also includes the subtype (API doesn't show it).
	}
	return response;
};

responseHandlers.Display_Input_Set = function(kv_params) {
	if ((kv_params.input >=0 && kv_params.input <=4) && internal_state.display.connectionstatus[kv_params.input] == true) {
		internal_state.display.activeinput = kv_params.input;
		return success_response;
	} else {
		return failure_response;
	}
};


responseHandlers.Display_Input_Status_All_Get = function() {
	
	return {
		"result": {
			0: {
					status: internal_state.display.connectionstatus[0]
				 },
			1: {
					status: internal_state.display.connectionstatus[1]
				 },
			2: {
					status: internal_state.display.connectionstatus[2]
			 },
			3: {
					status: internal_state.display.connectionstatus[3]
			 },
			4: {
					type: internal_state.display.byod.type,
					status: internal_state.display.connectionstatus[4]
			 		//TODO: Check if the unit also returns the subtype (not in API docs)
				 }
		 },
		 jsonrpc: "2.0"
	};


	
};

responseHandlers.Display_Input_Status_Get = function(kv_params)  {
	if (kv_params.input >=0 && kv_params.input <=4){
		var response = {
			result: {
				 input: kv_params.input,
				 status: internal_state.display.connectionstatus[kv_params.input]
			   },
			jsonrpc: "2.0"

			};
		if (kv_params.input == inputNumberFor["BYOD"]){
			response.result.subtype = internal_state.display.byod.subypte;
			response.result.type =  internal_state.display.byod.type;
		}
		return response;
	
	} else {
		return failure_response; //TODO: Need to see if this is what the real device does.
	}
};

responseHandlers.Display_Set = function(kv_params) {
	if (kv_params.value === "on" || kv_params.value === "off") {
		(kv_params.value === "on") ? internal_state.display.state = true : internal_state.display.state= false;
		return success_response;	 
	} else {
		return failure_response;
	}	
};

responseHandlers.Instruments_Temperature_Get  = function(kv_params) {
	var temp;
	switch(kv_params.scale) {
	case "kelvins" :
		temp = internal_state.instruments.temperature;
		break;
	case "celsius" : 
		temp = internal_state.instruments.temperature - 273.15;
		break;
	case "fahrenheit" :
		temp = internal_state.instruments.temperature * (9/5) - 459.67;
		break;
	default: 
		return failure_response;
	}
	 
	return {
		result: {
	 		temperature: {
	 			scale: kv_params.scale,
	 			value: temp
			}
		},
	    jsonrpc: "2.0"

	};
};

responseHandlers.Misc_Model_Get = function() {
	return {
		result: {
				 model: internal_state.misc.model
			   },
			   jsonrpc: "2.0"
		};
};

responseHandlers.Misc_Version_Get = function()  {
	return {
		result: {
					version: internal_state.misc.master
	  			  },
		jsonrpc: "2.0"

  };
};


responseHandlers.Misc_Versions_Get = function() {
	return {
		result: {
			mcu: internal_state.misc.MCU,
			master: internal_state.misc.master
		},
		jsonrpc: "2.0"

	};
};

responseHandlers.Platform_Reset = function() {
	internal_state = Object.assign({},factory_state);
	return success_response;
};

responseHandlers.Platform_Restart = function() {
	//TODO: Stop the server from accepting requests for 45 seconds.
	internal_state.misc.state = lifecycleStates.RESTART_REQUESTED;
	return success_response;
};

responseHandlers.Platform_Shutdown = function() {
	console.warn("Server received Platform:Shutdown command, stopping server...");
	internal_state.misc.state = lifecycleStates.SHUTDOWN_REQUESTED;
	return success_response;
};

var success_response = {
	result: {
			success: true
			},
	jsonrpc: "2.0"

};

var failure_response = {
	result: {
			success: false
			},
	jsonrpc: "2.0"
};



