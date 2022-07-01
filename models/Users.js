const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const path = require("path");
mongoose.pluralize(null);

const UserSchema = new Schema({
  user_id: String,
  access_token: String,
  user_name: String,
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
