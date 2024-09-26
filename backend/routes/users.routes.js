const express=  require("express");
const { usercontroller } = require("../Controller/user.controller");
const router= express.Router();
const passport= require("passport");
const { rolemiddleware } = require("../middleware/role");
const multer = require("multer");
const path = require("path");
const {inRole,Roles}= rolemiddleware


router.get("/getuser/:id", passport.authenticate('jwt',{session:false}) , inRole(Roles.ADMIN),
usercontroller.getuserbyid);
router.post("/Adduser",usercontroller.Register);
router.delete("/deleteuser/:id",passport.authenticate('jwt',{session:false}) , inRole(Roles.ADMIN), usercontroller.deleteuser);
router.get('/me', passport.authenticate('jwt', { session: false }), (req, res) => {
    // If authenticated, send user data
    res.send({ user: req.user });
  });
router.get("/getalluser",passport.authenticate('jwt', {session:false}), usercontroller.getAlluser);
// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename
  },
});
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, and PNG are allowed.'), false);
  }
};

const upload = multer({ storage, fileFilter });
router.post("/upload/:userId",upload.single('profileImage'), usercontroller.uploadProfileImage);
  // Route to serve profile images
  router.get('/profileimage/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);
    console.log(`File path: ${filePath}`); // Log the file path
    res.sendFile(filePath, err => {
      if (err) {
        console.error('Error sending file:', err); // Log any error
        res.status(err.status).end();
      }
    });
  });
  




module.exports.userRouter= router;