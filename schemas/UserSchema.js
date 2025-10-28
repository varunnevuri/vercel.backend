const { Schema } = require("mongoose");

const UserSchema = new Schema({
  email: {
    type: String,
    required: [true, "email is required"],
    unique: true,
  },
  username: {
    type: String,
    required: [true, "username is required"],
  },
  password: {
    type: String,
    required: [true, "password is required"],
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

module.exports = UserSchema;