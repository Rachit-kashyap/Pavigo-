

const User = require('../models/userModel');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on("userConnected", async ({ userId }) => {
      try {
        if (!userId) return;

        // Update user status
        const user = await User.findByIdAndUpdate(
          userId, 
          { 
            socketId: socket.id, 
            isActive: true,
            $pull: { offlineNotification: { type: 'connection' } } 
          },
          { new: true }
        ).populate([
          { path: "yourVibeScoreFriendPendingRequest", select: "_id name" },
          { path: "yourVibeScoreFriends", select: "_id name" }
        ]);

        const vibeScore = user.vibeScore || 0;

        // Find matched users
        const matchedUsers = await User.find({
          _id: { $ne: user._id },
          vibeScore: { $gte: vibeScore - 5, $lte: vibeScore + 5 }
        }).select("_id name vibeScore yourVibeScoreFriendPendingRequest yourVibeScoreFriends")
          .populate([
            { path: "yourVibeScoreFriendPendingRequest", select: "_id name" },
            { path: "yourVibeScoreFriends", select: "_id name" }
          ]);

        // Send data to client
        socket.emit("youVibeScore", { vibeScore });
        socket.emit("receiveVibeScoreUserRange", { users: matchedUsers });

        // Handle offline notifications
        if (user.offlineNotification && user.offlineNotification.length > 0) {
          socket.emit("offlineNotification", user.offlineNotification);
          await User.findByIdAndUpdate(userId, { offlineNotification: [] });
        }
      } catch (err) {
        console.error("userConnected error:", err);
      }
    });

    socket.on("vibeScore", async ({ userId, vibeScore }) => {
      try {
        const score = parseInt(vibeScore);
        const user = await User.findByIdAndUpdate(
          userId, 
          { vibeScore: score }, 
          { new: true }
        );

        const matchedUsers = await User.find({
          _id: { $ne: userId },
          vibeScore: { $gte: score - 5, $lte: score + 5 }
        }).select("_id name vibeScore yourVibeScoreFriendPendingRequest yourVibeScoreFriends")
          .populate([
            { path: "yourVibeScoreFriendPendingRequest", select: "_id name" },
            { path: "yourVibeScoreFriends", select: "_id name" }
          ]);

        socket.emit("youVibeScore", { vibeScore: user.vibeScore });
        socket.emit("receiveVibeScoreUserRange", { users: matchedUsers });
      } catch (err) {
        console.error("vibeScore error:", err);
      }
    });

    socket.on("connectRequest", async ({ friendId, myId }) => {
      try {
        const friend = await User.findById(friendId).select("socketId isActive yourVibeScoreFriendPendingRequest");
        const myUser = await User.findById(myId).select("name");
        
        if (!friend || !myUser) return;

        // Check if request already exists
        let requestExists = false;
        for (let i = 0; i < friend.yourVibeScoreFriendPendingRequest.length; i++) {
          if (friend.yourVibeScoreFriendPendingRequest[i].toString() === myId.toString()) {
            requestExists = true;
            break;
          }
        }

        if (!requestExists) {
          await User.findByIdAndUpdate(
            friendId,
            { 
              $addToSet: { yourVibeScoreFriendPendingRequest: myId },
              $addToSet: { 
                offlineNotification: {
                  type: 'connection',
                  from: myId,
                  message: `${myUser.name} sent you a connection request.`,
                } 
              }
            }
          );
        }

        if (friend.socketId && friend.isActive) {
          socket.to(friend.socketId).emit("newRequestReceived", { 
            from: { _id: myId, name: myUser.name } 
          });
        }
      } catch (err) {
        console.error("connectRequest error:", err);
      }
    });

    socket.on("connectionApproved", async ({ fromUserId, toUserId }) => {
      try {
        await User.findByIdAndUpdate(fromUserId, {
          $addToSet: { yourVibeScoreFriends: toUserId },
          $pull: { yourVibeScoreFriendPendingRequest: toUserId }
        });
        
        await User.findByIdAndUpdate(toUserId, {
          $addToSet: { yourVibeScoreFriends: fromUserId },
          $pull: { yourVibeScoreFriendPendingRequest: fromUserId }
        });

        const fromUser = await User.findById(fromUserId).select("socketId name");
        const toUser = await User.findById(toUserId).select("name");

        if (fromUser && fromUser.socketId) {
          socket.to(fromUser.socketId).emit("requestApproved", {
            by: toUser.name,
            byId: toUser._id
          });
        }
      } catch (err) {
        console.error("connectionApproved error:", err);
      }
    });

    socket.on("connectionRejected", async ({ fromUserId, toUserId }) => {
      try {
        await User.findByIdAndUpdate(toUserId, {
          $pull: { yourVibeScoreFriendPendingRequest: fromUserId }
        });

        const fromUser = await User.findById(fromUserId).select("socketId name");
        const toUser = await User.findById(toUserId).select("name");

        if (fromUser && fromUser.socketId) {
          socket.to(fromUser.socketId).emit("requestRejected", {
            name: toUser.name
          });
        }
      } catch (err) {
        console.error("connectionRejected error:", err);
      }
    });

    socket.on("removeFriend", async ({ fromUserId, toUserId }) => {
      try {
        await User.findByIdAndUpdate(fromUserId, {
          $pull: { yourVibeScoreFriends: toUserId }
        });
        
        await User.findByIdAndUpdate(toUserId, {
          $pull: { yourVibeScoreFriends: fromUserId }
        });

        const fromUser = await User.findById(fromUserId).select("socketId");
        if (fromUser && fromUser.socketId) {
          socket.to(fromUser.socketId).emit("friendRemoved", { friendId: toUserId });
        }

        const toUser = await User.findById(toUserId).select("socketId");
        if (toUser && toUser.socketId) {
          socket.to(toUser.socketId).emit("friendRemoved", { friendId: fromUserId });
        }
      } catch (err) {
        console.error("removeFriend error:", err);
      }
    });

    socket.on("disconnect", async () => {
      try {
        await User.findOneAndUpdate(
          { socketId: socket.id },
          { 
            socketId: null,
            isActive: false
          }
        );
        console.log("Client disconnected:", socket.id);
      } catch (err) {
        console.error("Disconnect update error:", err);
      }
    });
  });
};