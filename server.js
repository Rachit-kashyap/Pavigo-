
const express = require('express');
require("dotenv").config();
const http = require('http');
const { Server } = require("socket.io");
const DataBaseConnectionSetup = require("./Utils/DatabaseConnection");
const userAuthRoutes = require("./routes/userAuthRoutes");
const userAuthorizedRoutes = require("./routes/userAuthorizedRoutes");
const path = require('path');
const socketHandlers = require('./sockets/socketHandlers');
const app = express();
const server = http.createServer(app);
const cors = require("cors");

// for temproary it allow all ports to acces this server
app.use(cors());

const io = new Server(server, {
    cors: {
        origin: "*",
    }
});

// attach your handlers
socketHandlers(io);

// Socket connection listener


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", userAuthRoutes);
app.use("/api/u", userAuthorizedRoutes);

DataBaseConnectionSetup()
    .then(() => {
        server.listen(process.env.PORT || 8080, () => {
            console.log(`Server running at http://localhost:${process.env.PORT || 8080}`);
        });
    })
    .catch((err) => {
        console.error("Database connection failed:", err.message);
    });

