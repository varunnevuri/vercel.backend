const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const UserSchema = require("../schemas/UserSchema");

UserSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

module.exports = mongoose.model("User", UserSchema);