/* const User = require("../models/user");
const bcrypt = require("bcryptjs");
const validator = require("validator");

module.exports = {
  hello() {
    // return "hello world";
    return {
      text: "hello world",
      value: 9999,
    };
  },
  createUser: async ({ UserInput }, req) => {
    // return User.findById(...)
    try {
      const errors = [];

      const user = await User.findOne({ email: UserInput.email });
      if (user) {
        const error = new Error("Email already registered!");
        error.statusCode = 409;
        throw error;
      }
      const hashedPw = await bcrypt.hash(UserInput.password, 12);
      const newUser = new User({
        name: UserInput.name,
        email: UserInput.email,
        password: hashedPw,
      });
      const result = await newUser.save();
      console.log(result);
      return { ...newUser._doc, _id: result._id.toString() };
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      console.log(err);
    }
  },
};
 */
