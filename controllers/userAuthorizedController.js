// const User = require("../models/userModel");
// const path = require("path");

// const getLoginUser = async (req, res) => {
//     const io = req.app.locals.io;

//     // Get io from app.locals
// let user = await User.findById(req.user._id);
//     // Safe emit
//  io.on("connection", (socket) => {
//      socket.on("userConnected",async()=>{
//         console.log("user id ",req.user._id);
        
//    let currentUser =     await User.findByIdAndUpdate(req.user._id,{socketId:socket.id},{new:true});
//    let vibeScore = currentUser.vibeScore;
  
//     let min = vibeScore - 5;
//     let max = vibeScore + 5;


    
//     // Get all users in range except current
//     const matchedUsers = await User.find({
//       _id: { $ne: currentUser._id },
//       vibeScore: { $gte: min, $lte: max },
//     }).select("name _id");
// console.log(matchedUsers);

//     // Send them to the client
//     socket.emit("reciveVibeScoreUserRange", {
//       users: matchedUsers,
//     });

    
//      })
// socket.on("connectRequest",async({toUserId})=>{
//   let user = await User.findById(toUserId);
//   let currentUser = await User.findById(toUserId);
//   console.log(user);
//   socket.to().emit("newReqRecived",{_id:currentUser._id,name:currentUser.name})
// })
   

//  socket.on("vibeScore", async ({ vibeScore }) => {
//   try {
//     vibeScore = parseInt(vibeScore);

//     // Save user score
//    await User.findByIdAndUpdate(req.user._id, { vibeScore });

//     // Define matching range logic
//     let min = vibeScore - 5;
//     let max = vibeScore + 5;


    
//     // Get all users in range except current
//     const matchedUsers = await User.find({
//       _id: { $ne: req.user._id },
//       vibeScore: { $gte: min, $lte: max },
//     }).select("name _id");

//     // Send them to the client
//     socket.emit("reciveVibeScoreUserRange", {
//       users: matchedUsers,
//     });

//   } catch (err) {
//     console.error("Error handling vibeScore:", err);
//   }
// });









//  });


//   res.render('index',{user}); // no need to add .ejs

// };

// module.exports = { getLoginUser };
const User = require('../models/userModel');

const getLoginUser = async (req, res) => {
  const user = await User.findById(req.user._id);
  
  // if you’re still using EJS for dev:
  res.render('index', { user });

  // otherwise for a pure API:
  // res.json({ user });
};

module.exports = { getLoginUser };
