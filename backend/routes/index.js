const express = require("express");
const authController = require("../controller/authController");
const router = express.Router();

//testing

router.get("/test", (req, res) => res.json({ msg: "working!" }));

// user

//register
router.post("/register", authController.register);
//login
router.post("/login", authController.login);
//logout
router.post("/logout",authController.logout)



//refresh

//blogs

//create
//read
//update
//delete
//read all blogs
//read blog by id

//comments

//create comment
//read comments by blog id

module.exports = router;
