const express = require("express");
const app = express();
const server = require("http").createServer(app);
const { WebSocketServer } = require("ws");
const os = require("os");
const pty = require("node-pty");

const wss = new WebSocketServer({ server, path: "/term" });

app.use(express.static(__dirname + "/public/"));

wss.on("connection", (socket) => {
    const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

    const ptyProcess = pty.spawn(shell, [], {
        name: "xterm-color",
        cols: 80,
        rows: 24,
        cwd: process.env.HOME,
        env: process.env,
    });

    let buffer = "";

    // Collect and filter data
    ptyProcess.onData((data) => {
        buffer += data;

        // Detect end of command output (common in bash)
        if (buffer.includes("\r\n")) {
            const filteredOutput = buffer
                .split("\r\n")  // Break into lines
                .filter(line => !line.includes("$") && !line.includes(">>>"))  // Remove prompt lines
                .join("\n");

            socket.send(JSON.stringify({ type: "out", msg: filteredOutput }));
            buffer = "";  // Clear buffer after sending result
        }
    });

    socket.on("message", (proto) => {
        const input = proto.toString();
        ptyProcess.write(input + "\r");
    });

    socket.on("close", () => {
        ptyProcess.kill();
    });
});

server.listen(3000);

