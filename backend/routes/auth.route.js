const express= require("express");
const { authcontroller } = require("../Controller/auth.controller");
const router = express.Router();

router.post("/login", authcontroller.login )


module.exports.Authrouter= router;