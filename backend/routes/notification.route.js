const express = require("express");
const router = express.Router();
const passport= require("passport");
const NotificationModel = require("../Models/NotificationModel");




router.get('/notifications', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const notifications = await NotificationModel.find()
      .populate('user', 'FullName email'); // Populate FullName and email from User

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



router.put('/notifications/:id/read', async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await NotificationModel.findByIdAndUpdate(id, { isRead: true }, { new: true });
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports.notificationrouter = router;