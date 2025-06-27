const User = require('../models/userModel');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // USER CONNECTED
    socket.on("userConnected", async ({ userId }) => {
      try {
        if (!userId) return;

        const user = await User.findByIdAndUpdate(
          userId,
          { socketId: socket.id },
          { new: true }
        );

        const vibeScore = user.vibeScore || 0;
        const matchedUsers = await User.find({
          _id: { $ne: user._id },
          vibeScore: { $gte: vibeScore - 5, $lte: vibeScore + 5 }
        }).select("name _id");

        socket.emit("youVibeScore", { vibeScore });
        socket.emit("receiveVibeScoreUserRange", { users: matchedUsers });

        if (user.offlineNotification?.length > 0) {
          socket.emit("offlineNotification", user.offlineNotification);
          await User.findByIdAndUpdate(userId, { offlineNotification: [] });
        }
      } catch (err) {
        console.error("Error in userConnected:", err);
      }
    });

    // VIBE SCORE UPDATE
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
        }).select("name _id");

        socket.emit("youVibeScore", { vibeScore: user.vibeScore });
        socket.emit("receiveVibeScoreUserRange", { users: matchedUsers });
      } catch (err) {
        console.error("Error in vibeScore:", err);
      }
    });

    // SEND CONNECTION REQUEST
    socket.on("connectRequest", async ({ myUserId, friendUserId }) => {
      try {
        const friendUserId = await User.findByIdAndUpdate(friendUserId, {
          $addToSet: { yourVibeScoreFriendPendingRequest: myUserId }
        });

        const myUserId = await User.findById(myUserId);

        if (friendUserId?.socketId) {
          socket.to(friendUserId.socketId).emit("newRequestReceived", { from: myUserId });
        } else {
          await User.findByIdAndUpdate(friendUserId, {
            $push: {
              offlineNotification: {
                from: myUserId,
                message: `${myUserId.name} sent you a connection request.`
              }
            }
          });
        }
      } catch (err) {
        console.error("Error in connectRequest:", err);
      }
    });

    // APPROVE CONNECTION
    socket.on("connectionApproved", async ({ fromUserId, toUserId }) => {
      try {
        const fromUser = await User.findById(fromUserId);
        const toUser = await User.findById(toUserId);

        if (!fromUser || !toUser) return;

        await User.findByIdAndUpdate(fromUserId, {
          $addToSet: { yourVibeScoreFriends: toUserId },
          $pull: { yourVibeScoreFriendPendingRequest: toUserId }
        });

        await User.findByIdAndUpdate(toUserId, {
          $addToSet: { yourVibeScoreFriends: fromUserId }
        });

        if (fromUser.socketId) {
          socket.to(fromUser.socketId).emit("requestApproved", {
            by: toUser.name,
            byId: toUser._id
          });
        }
      } catch (err) {
        console.error("Error in connectionApproved:", err);
      }
    });

    // REJECT CONNECTION
    socket.on("connectionRejected", async ({ fromUserId, toUserId }) => {
      try {
        const fromUser = await User.findById(fromUserId);
        const toUser = await User.findById(toUserId);

        await User.findByIdAndUpdate(toUserId, {
          $pull: { yourVibeScoreFriendPendingRequest: fromUserId }
        });

        if (fromUser?.socketId) {
          socket.to(fromUser.socketId).emit("requestRejected", {
            name: toUser.name
          });
        }
      } catch (err) {
        console.error("Error in connectionRejected:", err);
      }
    });

    // REMOVE FRIEND
    socket.on("removeFriend", async ({ fromUserId, toUserId }) => {
      try {
        await User.findByIdAndUpdate(fromUserId, {
          $pull: { yourVibeScoreFriends: toUserId }
        });

        await User.findByIdAndUpdate(toUserId, {
          $pull: { yourVibeScoreFriends: fromUserId }
        });

        const fromUser = await User.findById(fromUserId);
        const toUser = await User.findById(toUserId);

        if (fromUser?.socketId) {
          socket.to(fromUser.socketId).emit("friendRemoved", { friendId: toUserId });
        }
      } catch (err) {
        console.error("Error in removeFriend:", err);
      }
    });

    // DISCONNECT
    socket.on("disconnect", async () => {
      await User.findOneAndUpdate({ socketId: socket.id }, { socketId: null });
      console.log("Client disconnected:", socket.id);
    });
  });
};
