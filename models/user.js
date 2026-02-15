const mongoose = require('mongoose');
require("dotenv").config()
mongoose.connect(process.env.MONGO_URI);

const userSchema = mongoose.Schema({
    name: String,
    username: String,
    email: String,
    password: String,
    post:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "post"
    }]
})

module.exports = mongoose.model("user",userSchema);