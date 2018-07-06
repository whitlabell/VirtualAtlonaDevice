/**
 * Simple javascript web server to mimic an Atlona switcher. Simply returns the sample JSON
 * listed in the official API guide.
 * Useful for doing quick checks that your web page is working.
 * 
 * Run using node.js
 */

const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((request, response) => {
  const {method,url} = request;
  
keyValue = require('querystring')
			.parse( require('url')
			.parse(url).query);
 
 var cmd = keyValue.cmd;
 var param = keyValue.parameter; 
  response.statusCode = 200;
  response.setHeader('Content-Type', 'text/plain');
  response.write('Hello World: Method = ' 
  				+ method 
  				+ '\nURL=' 
  				+ url
  				+ '\ncmd = ' 
  				+ cmd
  				+ '\nParameter='
  				+ param);
  				
  response.end("\n\nResponse to command " + cmd + " is:\n" + JSON.stringify(atlona_Request_Response[cmd]));
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});


const atlona_Request_Response = {
	"Audio:Mute:Get" : {
 						result: {
 									muteanalog: true,
 									mutehdmi: true
 								  },
 						jsonrpc: "2.0"
					   },
	"Audio:Mute:Set" : {
 						result: {
 									success: true
 								},
 						jsonrpc: "2.0"

						},
	"Audio:Volume:Decrease" : {
 								result: {
 											volume: -3,
 											success: true
 										},
 								jsonrpc: "2.0"
								},
	"Audio:Volume:Get" : {	
							result: {
 										volume: -3
 									  },
 							jsonrpc: "2.0"

						},
	"Audio:Volume:Increase" : {
 								result: {
 										volume: -1,
 										success: true
 										},
 								jsonrpc: "2.0"
							  },
	"Audio:Volume:Set" : {
 						result: {
 									success: true
 								},
 						jsonrpc: "2.0"

						},
	"Display:BYOD:Kick" : {
 						result: {
 									success: true
 								},
 						jsonrpc: "2.0"

						},
	"Display:Get" : {
 						result: {
 									success: true
 								},
 						jsonrpc: "2.0"

						},
	"Display:Input:Get"  : {
 								result: {
 											input: 4,
 											type: "airplay"
 										},
 								jsonrpc: "2.0"

							},
	"Display:Input:Set" : {
 						result: {
 									success: true
 								},
 						jsonrpc: "2.0"

						},
	"Display:Input:Status:All:Get" : {
 										"result": {
 													"0": {
 															"status": false
 														 },
 													"1": {
 															"status": false
 														 },
 													"2": {
 															"status": false
														 },
													"3": {
 															"status": false
														 },
 													"4": {
 															"type": "airplay",
 															"status": true
 														 }
													 },
 										"jsonrpc": "2.0"

										},
	"Display:Input:Status:Get" : {
									 "result": {
												 "input": 4,
												 "subtype": "infrastructure",
												 "type": "miracast",
												 "status": true
											   },
									 "jsonrpc": "2.0"

								},
	"Display:Set" : {
 						result: {
 									success: true
 								},
 						jsonrpc: "2.0"

						},
	"Instruments:Temperature:Get" : {
									 "result": {
									 				"temperature": {
									 					"scale": "farenheit",
									 					"value": 145
 											   		}
 												},
									 "jsonrpc": "2.0"

									},
	"Misc:Model:Get" : {
						 "result": {
									 "model": "AT-UHD-SW-510W"
								   },
						 "jsonrpc": "2.0"

						},
	"Misc:Version:Get" :  {
							"result": {
 										"version": "0.1.21-14"
 						  			  },
 							"jsonrpc": "2.0"

						  },
	"Misc:Versions:Get" : {

							 "result": {
										 "mcu": "V0.5.00",
										 "master": "0.1.24-1"
 									   },
							 "jsonrpc": "2.0"

							},
	"Platform:Reset" : {
 						result: {
 									success: true
 								},
 						jsonrpc: "2.0"

						},
	"Platform:Restart" : {
 						result: {
 									success: true
 								},
 						jsonrpc: "2.0"

						},
	"Platform:Shutdown" : {
 						result: {
 									success: true
 								},
 						jsonrpc: "2.0"

						}
	

};