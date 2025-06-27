const mongoose = require('mongoose');
require("dotenv").config("")
const DataBaseConnectionSetup = async () => {
const DatabaseUrl = process.env.MONGODB_CLOUD_URL;
    
    await mongoose.connect(DatabaseUrl);
    console.log("MongoDB connected successfully");
};

module.exports = DataBaseConnectionSetup;
