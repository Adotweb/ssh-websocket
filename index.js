const express = require("express");

const {WebSocketServer} = require("ws");


const {exec} = require("child_process");

const app = express();


const server = require("http").createServer(app);

app.use(express.static(__dirname + "/public/"));


const wss = new WebSocketServer({server, path : "/term"});


wss.on("connection", socket => {
	
	socket.on("message", proto => {
		
		let msg = proto.toString();

		exec(msg, (err, out, stderr) => {

			if(err){
				socket.send(JSON.stringify({type : "error", msg : err.message}));
				return;
			}	
			if(stderr){
				socket.send(JSON.stringify({type : "error", msg : stderr}));
				return;
			}

			socket.send(JSON.stringify({type : "none", msg : out}));
		});

	});

});

server.listen(3000);
