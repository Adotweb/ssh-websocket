const express = require("express");

const app = express();

const server = require("http").createServer(app)
const { WebSocketServer } = require("ws")

const wss = new WebSocketServer({server, path : "/term"})

const {exec} = require("child_process");


app.use(express.static(__dirname + "/public/"))


wss.on("connection", socket => {

	socket.on("message", (proto) => {

		const input = proto.toString();
	

		exec(input, (err, stdout, stderr) => {
			
			if(err){
				socket.send(JSON.stringify({type : "error", msg : err.message}))
				return
			}if(stderr){
				socket.send(JSON.stringify({type : "error", msg : stderr}))
				return
			}
			socket.send(JSON.stringify({type : "out", msg : stdout}))
		})

	})

})

server.listen(3000)
