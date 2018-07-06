/**
 * Javascript object that models and represents the Atlona AT-UHD-SW-510W 5-input presentation switcher
 * https://atlona.com/product/at-uhd-sw-510w/
 */

var Atlona_messageTypes = {
	ACTIVE_INPUT_NOTIFICATION:0,
	CONNECTION_STATE_NOTIFICATION:1,
	VOLUME_STATE_NOTIFICATION:2,
	TEMPERATURE_NOTIFICATION:3,
	DISPLAY_NOTIFICATION:4,
	DEVICE_INFORMATION:5
};
	
function Atlona_AT_UHD_SW_510W(connector,guiCallback) {
	
	//parameters
	var connector = connector;
	this.clientCallback = guiCallback;
	
	connector.setErrorCallbackHandler(this,handleAtlonaErrorMessage);
	connector.setSuccessCallbackHandler(this,handleAtlonaResponse);
	
	var responseHandlers = { };
	
	var ATLONA = this; // for use later in block scopes
	var deviceInformation = new AtlonaInformation();
	
	this.InputNumbers = {
		"USBC":0,
		"DISPLAYPORT":1,
		"HDMI3":2,
		"HDMI4":3,
		"BYOD":4
	};
	
	this.InputNames = {
		0: "USBC",
		1: "DISPLAYPORT",
		2: "HDMI3",
		3: "HDMI4",
		4: "BYOD"
	};
	
	this.AudioNames = {
		"HDMI":"hdmi",
		"ANALOGUE":"analog",
		"BOTH":"both"
	};
	
	this.TemperatureScales = {
		"CELCIUS":"celcius",
		"FAHRENHEIT":"fahrenheit",
		"KELVIN":"kelvins"
	};
	
	this.Limits = {
		MIN_AUDIO_LEVEL:-80,
		MAX_AUDIO_LEVEL:0
	};
	
	//Input sources
	this.Inputs = {
		"USBC": new InputSource(this.InputNumbers.USBC,connector),
		"DISPLAYPORT": new InputSource(this.InputNumbers.DISPLAYPORT,connector),
		"HDMI3": new InputSource(this.InputNumbers.HDMI3,connector),
		"HDMI4": new InputSource(this.InputNumbers.HDMI4,connector),
		"BYOD": new InputSource(this.InputNumbers.BYOD,connector)
	};
	
	//Output Sources
	this.Display = new OutputSource(connector);
	
	//Audio control
	this.Audio = new AudioOutput(connector);
	
	//Instrumentation
	this.Instruments = new Instruments(connector);
	
	//Platform & Misc 
	this.Platform = new Platform(connector,deviceInformation);
	
	// Device level convenience commands
	
	this.getActiveInput = function() {connector.send("Display:Input:Get");};
	
	this.getInputStatus = function() {connector.send("Display:Input:Status:All:Get");};
	
	this.switchToInput = function(inputNumber) { this.Inputs[InputNames[inputNumber]].select()};


//Event handlers
function handleAtlonaErrorMessage(that,error) {
	console.log(error);
	var errorObject = new ErrorNotification(error);
	that.clientCallback(errorObject);
}

function handleAtlonaResponse(that,response) {
	//TODO: Wrap this in a functional message type and passback to the client
	console.info("Atlona device returned response message for command: " + response.cmd + " - " + JSON.stringify(response.message));
	var responseHandlerName = getResponseHandlerFor(response);
	var responseToClient = responseHandlers[responseHandlerName](response);
	//console.info("Calling client GUI callback function " + that.clientCallback);
	if (responseToClient != undefined ) that.clientCallback(responseToClient);
}

function getResponseHandlerFor(responseMessage) {
	var handler = responseMessage.cmd.replace(/:/g,"_");
	// remove any URL params
	handler = handler.split("&")[0];
	 console.info("handler function for " + responseMessage.cmd + " is " + handler + "\n");
	 return handler;
}


responseHandlers.Display_Input_Get = function(response) {
	return new ActiveInputNotification(response.message.input);
};

responseHandlers.Display_Input_Set = function(response) {
	var requestedInput = response.cmdURL.searchParams.get("input");
	if (response.message.success == false) return new ErrorNotification("Atlona unit refused to switch to input " + ATLONA.InputNames[requestedInput] + " - maybe it isn't connected?");
	if (requestedInput === undefined) return new ErrorNotification("Could not extract the requested input number from the original URL.");
	return new ActiveInputNotification(requestedInput);
};

responseHandlers.Audio_Volume_Get = function(response) {
	return new AudioVolumeNotification(response.message.volume);
};

responseHandlers.Audio_Volume_Increase = function(response) {
	if (response.message.success == false) return new ErrorNotification("Atlona unit refused to increase the volume. ");
	return new AudioVolumeNotification(response.message.volume);
};

responseHandlers.Audio_Volume_Decrease = function(response) {
	if (response.message.success == false) return new ErrorNotification("Atlona unit refused to decrease the volume. ");
	return new AudioVolumeNotification(response.message.volume);
};

responseHandlers.Instruments_Temperature_Get = function(response) {
	if (response.message.success == false) return new ErrorNotification("Failed to get temperature of Atlona unit.");
	return new TemperatureNotifcation(response.message.temperature.value,response.message.temperature.scale);
};

responseHandlers.Display_Set = function(response) {
	if (response.message.success == false) return new ErrorNotification("Failed to change the Output display state.");
	var requestedState = response.cmdURL.searchParams.get("value");
	return new DisplayNotification((requestedState == "on")?true:false);
};

responseHandlers.Display_Get = function(response) {
	return new DisplayNotification(response.message.state == "true");
};

responseHandlers.Misc_Model_Get = function(response) {
	var modelName = response.message.model;
	if (modelName) {
		deviceInformation.modelName = modelName;
		deviceInformation._setInitState(1);
	}
};

responseHandlers.Misc_Versions_Get = function(response) {
	if (response.message.mcu) 
		deviceInformation.firmwareVersion.MCU = response.message.mcu;
	if (response.message.master)
		deviceInformation.firmwareVersion.master = response.message.master;
};

	// Initialise the Atlona information data structure before exiting constructor
	connector.send("Misc:Model:Get");
	connector.send("Misc:Versions:Get");
	
} //end of main Atlona constructor

//Utility object constructors


//Audio
function AudioOutput(connector) {
	this.getMuteStatus = function(audioSource) {connector.send("Audio:Mute:Get");};
	this.mute = function() { 
		connector.send("Audio:Mute:Set&" + this.AudioNames.HDMI + "=true");
		connector.send("Audio:Mute:Set&" + this.AudioNames.ANALOGUE + "=true");	
	};
	this.unmute = function() {
		connector.send("Audio:Mute:Set&" + this.AudioNames.HDMI + "=false");
		connector.send("Audio:Mute:Set&" + this.AudioNames.ANALOGUE + "=false");	
	};
	this.volumeDown = function(dbIncrement) {
		if (Number(dbIncrement)) connector.send("Audio:Volume:Decrease&increment=" + dbIncrement);
	};
	this.volumeUp = function(dbIncrement) {
		if (Number(dbIncrement)) connector.send("Audio:Volume:Increase&increment=" + dbIncrement);
	};
	this.setVolume = function(dbLevel) {
		if (Number(dbLevel) && dbLevel >= this.Limits.MIN_AUDIO_LEVEL && dbLevel <= this.Limits.MAX_AUDIO_LEVEL)
			connector.send("Audio:Volume:Set&volume=" + dbLevel);
	};
	this.getVolume = function() {connector.send("Audio:Volume:Get");};
}

//Instrumentation
function Instruments(connector) {
	this.getTemperature = function(unitOfMeasure) { 
		if (unitOfMeasure == "celsius" || unitOfMeasure == "fahrenheit" || unitOfMeasure == "kelvins")
			connector.send("Instruments:Temperature:Get&scale=" + unitOfMeasure);
	};
}

//InputSources
function InputSource(inputIndex,connector) {
	this.inputIndex = inputIndex;https://stackoverflow.com/questions/2400386/get-class-name-using-jquery
	this.connector = connector;
	this.select = function() { this.connector.send("Display:Input:Set&input=" + this.inputIndex);};
	this.getStatus = function() {this.connector.send("Display:Input:Status:Get&input=" + this.inputIndex);};
}

//OutputSources
function OutputSource(connector) {
	this.powerOn = function() {connector.send("Display:Set&value=on");};
	this.powerOff = function() {connector.send("Display:Set&value=off");};
	this.getStatus = function() {connector.send("Display:Get");};
}

//Platform
function Platform(connector,deviceInformation) {
	this.getInformation = function() {return deviceInformation;}; //(deviceInformation.isPopulated)?deviceInformation : new AtlonaInformation();};
	this.shutdown = function() {};
	this.restart = function() {};
	// Won't implement the factory reset option.
}


//Message Notification objects

function ActiveInputNotification(activeInput){
		this.messageType = Atlona_messageTypes.ACTIVE_INPUT_NOTIFICATION;
		this.activeInput = activeInput;
		
}

function ErrorNotification(event) {
	this.messageType = this.MSG_ERROR_OCCURRED;
	this.error = event;
}
	
function OutputPowerNotification(powerStatus) {
	this.messageType = this.MSG_OUTPUT_POWER_NOTIFICATION;
	this.isSwitchedOn = powerStatus.state;
	this.isSwitchedOff = !powerStatus.state;
}

function AudioVolumeNotification(volumeLevel) {
	this.messageType = Atlona_messageTypes.VOLUME_STATE_NOTIFICATION;
	this.dbLevel = volumeLevel;
	this.dbLevelAsString = volumeLevel + "dB";
	
}

function TemperatureNotifcation(value, scale) {
	this.messageType = Atlona_messageTypes.TEMPERATURE_NOTIFICATION;
	this.value = value;
	this.scale = scale;
	this.temperatureAsString = String(value) + {celsius:" deg.C",fahrenheit:" deg.F",kelvins:" K."}[scale];
}

function DisplayNotification(isOn) {
	this.messageType = Atlona_messageTypes.DISPLAY_NOTIFICATION;
	this.isOn = isOn;
	this.valueAsString = (isOn)? "On" : "Off";
}

function AtlonaInformation() {
	var _initState = 0;
	this.messageType = Atlona_messageTypes.DEVICE_INFORMATION;
	this.isPopulated = Boolean(_initState == 3);
	this.modelName = "Unknown";
	this.firmwareVersion = {MCU:"Unknown",master:"Unknown"};
	this._setInitState = function(flag) {_initState = _initState | flag;}
}