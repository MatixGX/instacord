const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  ProfileName: { type: String, required: true },
  Followers: { type: Array, required: true },
  Following: { type: Array, required: true },
  ProfileLink: { type: String, required: true },
  DiscordID: { type: String, required: true },
});

const user = (module.exports = mongoose.model("User", UserSchema));
