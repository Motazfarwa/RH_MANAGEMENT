const {
    createDocumentRequest,
    getDocumentRequestsByEmployee,
    getAllDocumentRequests,
    getDocumentRequestById,
    uploadDocument,
    deleteDocumentRequest,
    getDocumentFilePath,
    updateDocumentRequestWithFile
  } = require("../services/docservice");
  const multer = require("multer");
  const path = require("path");
  const fs = require("fs");
  const nodemailer = require("nodemailer");
const { DocumentRequest } = require("../Models/DocumentRequest ");
const express = require("express");
const { io } = require('../app');
const NotificationModel = require("../Models/NotificationModel");
const { userModel } = require("../Models/user.model");
const router = express.Router();
  

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, "..", "uploads");
      cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendApprovalEmail = async (userEmail, documentId) => {
  const approvalLink = `${process.env.FRONTEND_URL}/approve/${documentId}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "mootaz.farwa@avocarbon.com",
    subject: "Document Approval Required",
    text: `A document has been uploaded for your approval. Please click the link below to approve it: ${approvalLink}`,
  };

  await transporter.sendMail(mailOptions);
};
// Route to test sending approval email
const sendemail = ('/send-approval-email', async (req, res) => {
  const { userEmail, documentId } = req.body; // Get email and document ID from the request body

  try {
    if (!userEmail || !documentId) {
      return res.status(400).json({ error: "userEmail and documentId are required" });
    }

    // Call sendApprovalEmail function
    await sendApprovalEmail(userEmail, documentId);

    // Return success message
    res.status(200).json({ message: "Approval email sent successfully" });
  } catch (error) {
    console.error("Error sending approval email:", error);
    res.status(500).json({ error: error.message });
  }
});

const handleCreateDocumentRequest = [
  upload.single("documentFile"),
  async (req, res) => {
    const { employee_id, document_type } = req.body;
    const file = req.file;
    console.log(req.file);
    try {
      if (!employee_id || !document_type) {
        return res.status(400).json({ error: "Employee ID and Document Type are required" });
      }

      // Create document request
      const request = await createDocumentRequest(
        employee_id,
        document_type,
        file ? file.filename : null
      );
     
      if (file) {
        await updateDocumentRequestWithFile(request._id, file.filename);
      }

      // Find all users with the 'MANAGER' role
      const managers = await userModel.find({ role: 'MANAGER' });
       // Find the employee's details (including FullName)
       const employee = await userModel.findById(employee_id);
       if (!employee) {
         return res.status(404).json({ error: "Employee not found" });
       }
    
      if (managers.length > 0) {
        // Create and save notifications for each manager
        const notificationPromises = managers.map(async (manager) => {
          const message = `A document has been created by ${employee.FullName}.`;
          await createNotification(manager._id, message, 'creation'); // Include type

          // Emit socket event to notify each manager
          const ioInstance = require('../app').io;
          if (ioInstance && typeof ioInstance.emit === 'function') {
            ioInstance.emit('documentCreated', { message, requestId: request._id, managerId: manager._id });
          } else {
            console.error('Socket.io instance is not initialized or io.emit is not a function.');
          }
        });

        await Promise.all(notificationPromises);
      }

     

      res.status(201).json(request);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];



const handleApproveDocumentRequest = async (req, res) => {
  const { id: documentId } = req.params;

  if (!documentId) {
    return res.status(400).json({ error: "Document ID is required" });
  }

  try {
    const userId = req.user._id; // The manager who approves the document

    const request = await DocumentRequest.findByIdAndUpdate(
      documentId,
      { isApproved: true, approvedBy: userId, approvedAt: new Date() },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ error: "Document request not found" });
    }

    // Notify the Employee only
    const employee = await userModel.findById(request.employee_id);

    if (employee) {
      // Create notification for the employee
      await createNotification(employee._id, `Your document ${request.document_type} has been approved by ${employee.FullName}`, 'approval'); // Include type

      // Emit socket event to notify the employee
      const ioInstance = require('../app').io;
      if (ioInstance && typeof ioInstance.emit === 'function') {
        ioInstance.emit('documentApproved', { message: `Your document ${request.document_type} has been approved`, requestId: request._id, employeeId: employee._id });
      } else {
        console.error('Socket.io instance is not initialized or io.emit is not a function.');
      }
    }

    res.status(200).json({ message: "Document request approved successfully", request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


  // Get document request by ID
  const handleDocumentRequestById = async (req, res) => {
    const id = req.params.id;
    try {
      const documentRequest = await getDocumentRequestById(id);
      if (!documentRequest) {
        res.status(404).json({ error: "Document request not found" });
        return;
      }
      res.status(200).json(documentRequest);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  const handleGetDocumentRequestsByEmployee = async (req, res) => {
    const { employee_id } = req.params;
    try {
      const requests = await getDocumentRequestsByEmployee(employee_id);
      res.status(200).json(requests);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  const handleGetAllDocumentRequests = async (req, res) => {
    try {
      const requests = await getAllDocumentRequests();
      res.status(200).json(requests);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  const handleUploadDocument = [
    upload.single("documentFile"),
    async (req, res) => {
      const { id } = req.params;
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      try {
        const request = await uploadDocument(id, file.filename);
        res.status(200).json(request);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },
  ];
  
  // Handle deleting a document request
  const handleDeleteDocumentRequest = async (req, res) => {
    const id = req.params.id;
    try {
      const deletedRequest = await deleteDocumentRequest(id);
      if (!deletedRequest) {
        return res.status(404).json({ error: "Document request not found" });
      }
      res.status(200).json({ message: "Document request deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Handle downloading a document
  const handleDownloadDocument = (req, res) => {
    const { fileName } = req.params;
    const filePath = getDocumentFilePath(fileName);
    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).json({ error: "File not found" });
    }
  };
  
  // Emit a notification and save it to the database
  const createNotification = async (userId, message, type) => {
    try {
      // Create and save a new notification in the database
      const notification = new NotificationModel({ user: userId, message, type });
      await notification.save();
  
      // Access io directly from the app.js
      const ioInstance = require('../app').io;
  
      // Check if Socket.io instance and its emit method are available
      if (ioInstance && typeof ioInstance.emit === 'function') {
        // Emit notification to clients via Socket.io
        ioInstance.emit('notification', { userId, message });
      } else {
        console.error('Socket.io instance is not initialized or io.emit is not a function.');
      }
    } catch (error) {
      // Log any errors that occur
      console.error('Error creating notification:', error);
    }
  };
  
  
  
  
  
  module.exports = {
    handleCreateDocumentRequest,
    handleGetDocumentRequestsByEmployee,
    handleGetAllDocumentRequests,
    handleDocumentRequestById,
    handleUploadDocument,
    handleApproveDocumentRequest,
    handleDeleteDocumentRequest,
    handleDownloadDocument,
    sendemail,
    createNotification
  };