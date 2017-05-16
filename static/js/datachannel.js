var configuration = {
	'iceservers': [{
		'url': 'stun:stun.l.google.com:19302'
	}]
}

var rtcPeerConn;
var dataChannel;

var SIGNAL_ROOM = "signaling";

var dataChannelOptions = {
	ordered: false,
	maxRetransmitTime: 1000
}

var io = io.connect();
io.emit('ready', {"signal_room": SIGNAL_ROOM});
io.emit('signal', {"type": "user_here", "message": "Would you like to play tic tac toe?", "room": SIGNAL_ROOM});
io.on('signaling_message', function(data) {
	displaySignalMessage("Signal Recieved " + data.type);

	if (!rtcPeerConn) {
		startSignaling();
	}

	if (data.type != "user_here") {
		var message = JSON.parse(data.message);
		if (message.sdp) {
			rtcPeerConn.setRemoteDescription(new RTCSessionDescription(message.sdp), function() {
				if (rtcPeerConn.remoteDescription.type == 'offer') {
					rtcPeerConn.createAnswer(sendLocalDesc, logError);
				}
			}, logError);
		} else {
			rtcPeerConn.addIceCandidate(new RTCIceCandidate(message.candidate));
		}
	}
});





//

function startSignaling() {
	displaySignalMessage("starting signaling...");
	rtcPeerConn = new webkitRTCPeerConnection(configuration, null);
	dataChannel = rtcPeerConn.createDataChannel('textMessages', dataChannelOptions);
				
	dataChannel.onopen = dataChannelStateChanged;
	rtcPeerConn.ondatachannel = receiveDataChannel;
	
	// send any ice candidates to the other peer
	rtcPeerConn.onicecandidate = function (evt) {
		if (evt.candidate)
			io.emit('signal',{"type":"ice candidate", "message": JSON.stringify({ 'candidate': evt.candidate }), "room":SIGNAL_ROOM});
		displaySignalMessage("completed that ice candidate...");
	};
	
	// let the 'negotiationneeded' event trigger offer generation
	rtcPeerConn.onnegotiationneeded = function () {
		displaySignalMessage("on negotiation called");
		rtcPeerConn.createOffer(sendLocalDesc, logError);
	}  
}

function sendLocalDesc(desc) {
	rtcPeerConn.setLocalDescription(desc, function () {
		displaySignalMessage("sending local description");
		io.emit('signal',{"type":"SDP", "message": JSON.stringify({ 'sdp': rtcPeerConn.localDescription }), "room":SIGNAL_ROOM});
	}, logError);
}

//Data Channel Specific methods
function dataChannelStateChanged() {
	if (dataChannel.readyState === 'open') {
		displaySignalMessage("Data Channel open");
		dataChannel.onmessage = receiveDataChannelMessage;
	}
}

function receiveDataChannel(event) {
	displaySignalMessage("Receiving a data channel");
	dataChannel = event.channel;
	dataChannel.onmessage = receiveDataChannelMessage;
}

function receiveDataChannelMessage(event) {
	displayMessage("From DataChannel: " + event.data);

	console.log(event.data)	
	// if (event.data.split(" ")[0] == "memoryFlipTile") {
	// 	var tileToFlip = event.data.split(" ")[1];
	// 	displayMessage("Flipping tile " + tileToFlip);
	// 	var tile = document.querySelector("#" + tileToFlip);
	// 	var index = tileToFlip.split("_")[1];
	// 	var tile_value = memory_array[index];
	// 	flipTheTile(tile,tile_value);
	// } else if (event.data.split(" ")[0] == "newBoard") {
	// 	displayMessage("Setting up new board");
	// 	memory_array = event.data.split(" ")[1].split(",");
	// 	newBoard();
	// }
	
}

//Logging/Display Methods
function logError(error) {
	displaySignalMessage(error.name + ': ' + error.message);
}

function displayMessage(message) {
	chatArea.innerHTML = chatArea.innerHTML + "<br/>" + message;
}

function displaySignalMessage(message) {
	signalingArea.innerHTML = signalingArea.innerHTML + "<br/>" + message;
}

