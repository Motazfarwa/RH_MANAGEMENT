const { DocumentRequest } = require("../Models/DocumentRequest "); // Import your models
const { users } = require("../Models/user.model"); // Import your models
const path = require("path");
// Function to create a new document request with file upload
const createDocumentRequest = async (employee_id, document_type, fileName) => {
    const documentRequest = new DocumentRequest({
        employee_id,
        document_type,
        file_path: fileName, // Store the file name
        status: fileName ? "Completed" : "Pending" // Set status based on file presence
    });
    return await documentRequest.save();
};

  // Fetch a document request by ID
  const getDocumentRequestById = async (id) => {
    try {
      return await DocumentRequest.findById(id).populate("employee_id").exec();
    } catch (error) {
      throw new Error(`Error fetching document request: ${error.message}`);
    }
  };


// Function to get document requests for an employee
const getDocumentRequestsByEmployee = async (employee_id) => {
    return await DocumentRequest.find({ employee_id }).exec();
  };
  

 // Function to get all document requests (for managers)
const getAllDocumentRequests = async () => {
    return await DocumentRequest.find()
      .populate("employee_id", "FullName email role")
      .sort({ request_date: -1 })
      .exec();
  };

  
  // Function to update a document request with the uploaded file
  const uploadDocument = async (id, fileName) => {
    return await DocumentRequest.findByIdAndUpdate(
      id,
      { file_path: fileName, status: "Completed" },
      { new: true }
    );
  };
  
// Function to update a document request with the uploaded file
const updateDocumentRequestWithFile = async (id, fileName) => {
    return await DocumentRequest.findByIdAndUpdate(
        id,
        { file_path: fileName, status: "Completed" },
        { new: true }
    );
};
// Function to handle file download
const getDocumentFilePath = (fileName) => {
    return path.join(__dirname, "../uploads", fileName);
  };
  
  // Function to delete a document request
  const deleteDocumentRequest = async (id) => {
    try {
      return await DocumentRequest.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Error deleting document request: ${error.message}`);
    }
  };

  
module.exports={
    createDocumentRequest,getDocumentRequestById,getAllDocumentRequests,deleteDocumentRequest,uploadDocument, getDocumentRequestsByEmployee, getDocumentFilePath,updateDocumentRequestWithFile, 
}  