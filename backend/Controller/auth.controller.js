const jwt = require('jsonwebtoken');
const { checkuser } = require("../helper/helper");
const bcrypt = require("bcryptjs");

const login = async (req, res) => {
  try {
    // Find the user
    const existingUser = await checkuser(req.body.email);
    if (!existingUser) {
      return res.status(404).send("User not found");
    }

    // Compare passwords
    const compare = await bcrypt.compare(req.body.password, existingUser.password);
    if (!compare) {
      return res.status(400).send("Password does not match");
    }

    // Create JWT token
    const payload = {
      id: existingUser._id,
      email: existingUser.email,
      role: existingUser.role,
      FullName: existingUser.FullName,
      profileImage: existingUser.profileImage
    };
    const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "1h" });

    res.send({ token ,user: payload });
  } catch (error) {
    // Log error for debugging
    console.error(error);
    res.status(500).send("Server error");
  }
};

module.exports.authcontroller = {
  login
};
