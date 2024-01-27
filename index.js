const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();

//Middlewares
app.use(express.json());
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: ["https://chantlo.netlify.app/", "https://chantlo.netlify.app", "chantlo.netlify.app", "www.chantlo.netlify.app"],
});

let userData = [];

io.on("connection", (socket) => {

  socket.on('join-room', (data)=>{
    const {roomNo} = data;
    userData.push({...data, socketID: socket.id})
    socket.join(roomNo)
    socket.to(roomNo).emit("new-person", data);
  })

  socket.on("send-message", (data)=>{
    socket.to(data?.roomNo).emit("received-message", data);
  })

  socket.on("disconnect", ()=>{
    let leftUserSocketID = socket.id;
    let leftUserDetails = userData.find((item)=> item.socketID = leftUserSocketID)
    socket.to(leftUserDetails?.roomNo).emit('left-room', {...leftUserDetails})
    userData = userData.filter((item)=> item.socketID !== leftUserSocketID)
  })

});

app.get("/", (req, res) => {
  res.send("Welcome to Chantlo Backend");
});

server.listen(8080, () => {
  console.log("Server is connected to PORT 8080");
});
