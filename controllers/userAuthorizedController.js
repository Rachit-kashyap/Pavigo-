
const User = require('../models/userModel');

const getLoginUser = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  
  res.json({success:true, user });
};

module.exports = { getLoginUser };
