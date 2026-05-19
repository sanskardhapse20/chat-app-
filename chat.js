const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

let onlineUsers = 0;

app.get("/", (req, res) => {

    res.send(`

<!DOCTYPE html>

<html>

<head>

<title>Modern Chat App</title>

<style>

body{
    margin:0;
    font-family:Arial;
    background:#0f172a;
    display:flex;
    justify-content:center;
    align-items:center;
    height:100vh;
    color:white;
}

.container{
    width:450px;
    background:#1e293b;
    border-radius:20px;
    overflow:hidden;
    box-shadow:0px 0px 20px rgba(0,0,0,0.5);
}

.header{
    background:#2563eb;
    padding:15px;
    text-align:center;
}

.header h2{
    margin:0;
}

.online{
    font-size:14px;
    margin-top:5px;
}

#chat{
    height:400px;
    overflow-y:auto;
    padding:15px;
    background:#0f172a;
}

.message{
    background:#334155;
    padding:12px;
    border-radius:12px;
    margin-bottom:10px;
    word-wrap:break-word;
}

.bottom{
    display:flex;
    padding:10px;
    background:#1e293b;
}

input{
    flex:1;
    padding:12px;
    border:none;
    border-radius:10px;
    outline:none;
    margin-right:10px;
}

button{
    background:#2563eb;
    color:white;
    border:none;
    padding:12px 18px;
    border-radius:10px;
    cursor:pointer;
}

button:hover{
    background:#1d4ed8;
}

.username{
    padding:10px;
    background:#111827;
}

.username input{
    width:100%;
    margin:0;
}

</style>

</head>

<body>

<div class="container">

    <div class="header">

        <h2>Realtime Chat App</h2>

        <div class="online" id="online">
            Online Users: 0
        </div>

    </div>

    <div class="username">

        <input type="text" id="username" placeholder="Enter Username">

    </div>

    <div id="chat"></div>

    <div class="bottom">

        <input type="text" id="message" placeholder="Type message">

        <button onclick="sendMessage()">Send</button>

    </div>

</div>

<script>

const ws = new WebSocket("ws://localhost:3000");

const chat = document.getElementById("chat");

const online = document.getElementById("online");

ws.onmessage = (event) => {

    const data = JSON.parse(event.data);

    if(data.type === "online"){

        online.innerHTML = "Online Users: " + data.count;

    }

    else{

        chat.innerHTML += \`

            <div class="message">

                <strong>\${data.username}</strong><br>

                \${data.message}

            </div>

        \`;

        chat.scrollTop = chat.scrollHeight;

    }

};

function sendMessage(){

    const username =
    document.getElementById("username").value;

    const message =
    document.getElementById("message").value;

    if(username === "" || message === "") return;

    ws.send(JSON.stringify({
        username,
        message
    }));

    document.getElementById("message").value = "";

}

</script>

</body>

</html>

`);

});

function sendOnlineCount(){

    const data = JSON.stringify({
        type:"online",
        count:onlineUsers
    });

    wss.clients.forEach((client) => {

        if(client.readyState === WebSocket.OPEN){

            client.send(data);

        }

    });

}

wss.on("connection", (ws) => {

    onlineUsers++;

    sendOnlineCount();

    ws.on("message", (message) => {

        wss.clients.forEach((client) => {

            if(client.readyState === WebSocket.OPEN){

                client.send(message.toString());

            }

        });

    });

    ws.on("close", () => {

        onlineUsers--;

        sendOnlineCount();

    });

});

server.listen(3000, () => {

    console.log("Server Running on http://localhost:3000");

});