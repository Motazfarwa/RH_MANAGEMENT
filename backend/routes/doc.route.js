const express = require("express");
const router = express.Router();
const {
  handleCreateDocumentRequest,
  handleGetDocumentRequestsByEmployee,
  handleGetAllDocumentRequests,
  handleDocumentRequestById,

  handleDeleteDocumentRequest,
  handleDownloadDocument,
  handleUploadDocument,
  handleApproveDocumentRequest,
  sendemail
} = require("../Controller/DocsController")
const passport= require("passport");
const NotificationModel = require("../Models/NotificationModel");

// Create a new document request
router.post("/", handleCreateDocumentRequest);

// Get all document requests (for managers)
router.get("/", handleGetAllDocumentRequests);

// Get document requests by employee ID
router.get("/:employee_id", handleGetDocumentRequestsByEmployee);

// Get a document request by ID
router.get("/:id", handleDocumentRequestById);

// Upload a document for a request
router.post("/upload/:id", handleUploadDocument);

// Delete a document request
router.delete("/:id", handleDeleteDocumentRequest);

// Download a document
router.get("/download/:fileName", handleDownloadDocument);


router.put("/handleapprovment/:id" ,passport.authenticate('jwt', {session:false}), handleApproveDocumentRequest);

router.post("/sendemail", sendemail);
router.get('/notifications', async (req, res) => {
  console.log('User ID:', req.user._id); // Check if req.user._id is populated
  try {
    const notifications = await NotificationModel.find({ user: req.user._id }).sort({ createdAt: -1 });
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


module.exports.documentrouter = router;