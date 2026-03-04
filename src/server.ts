import http from "http";
import { Server } from "socket.io";
import { app } from "./app.js";

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Connected client:", socket.id);

  socket.on("join-company", (companyId) => {
    socket.join(companyId);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Server running on localhost://${process.env.PORT}`);
});
