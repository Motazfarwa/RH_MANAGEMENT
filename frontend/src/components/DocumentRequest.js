import React, { useEffect, useState } from "react";
import axios from "axios";
import { Upload, Button, Input, Form, message, Dropdown, Badge, Menu } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { BellOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import { Layout, Card, Typography, Space } from 'antd';
const { Header, Content } = Layout;
const { Title, Text } = Typography;

const DocumentRequest = () => {
    const [formData, setFormData] = useState({
        employeeId: "",
        documentType: "",
        otherDocumentType: "",
        documentPurpose: "",
    });

    const [submitting, setSubmitting] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [error, setError] = useState("");
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };
    const token= localStorage.getItem('token');
    useEffect(() => {
        const fetchNotifications = async () => {
          try {
            const response = await axios.get('http://localhost:4000/notificationrequest/notifications', {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
        
            const userRole = localStorage.getItem('userRole');
            
            const filteredNotifications = response.data.filter(notification =>
              (userRole === 'EMPLOYEE' && notification.type === 'approval') ||
              (userRole === 'MANAGER' && notification.type === 'creation')
            );
        
            setNotifications(filteredNotifications);
          } catch (error) {
            console.error('Error fetching notifications:', error);
          }
        };
        
      
        fetchNotifications();
      }, [token]);
      useEffect(() => {
        const unreadNotifications = notifications.filter(n => !n.isRead).length;
        setUnreadCount(unreadNotifications);
      }, [notifications]);
      
      const handleNotificationClick = () => {
        setUnreadCount(0);
      };
  const navigate = useNavigate();
      
  const handleLogout = ()=>{
    localStorage.removeItem('token');
    navigate("/sign-in")
  }
    const handleSubmit = async (values) => {
        const { documentFile } = values;
        setSubmitting(true);

        const newDocumentRequest = {
            employee_id: formData.employeeId,
            document_type:
                formData.documentType === "other"
                    ? formData.otherDocumentType
                    : formData.documentType,
            additional_info: formData.documentPurpose,
        };

        const formDataToSend = new FormData();
        formDataToSend.append("employee_id", newDocumentRequest.employee_id);
        formDataToSend.append("document_type", newDocumentRequest.document_type);
        formDataToSend.append("documentPurpose", newDocumentRequest.additional_info);
        if (documentFile && documentFile.file) {
            formDataToSend.append("documentFile", documentFile.file.originFileObj);
        }

        try {
            await axios.post(
                "http://localhost:4000/documentrequest",
                formDataToSend,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setFormData({
                employeeId: "",
                documentType: "",
                otherDocumentType: "",
                documentPurpose: "",
            });

            setShowSuccessMessage(true);
            message.success("Document Uploaded successfully");
            navigate("/user");
            setTimeout(() => setShowSuccessMessage(false), 3000);

        } catch (err) {
            setError("Failed to submit document request. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };
    const notificationMenu = (
        <Menu>
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <Menu.Item key={index}>
                {notification.message}
              </Menu.Item>
            ))
          ) : (
            <Menu.Item>No notifications</Menu.Item>
          )}
        </Menu>
      );

    return (
        
        <div className="w-full p-4 pt-6 pb-8 mb-4 bg-white rounded shadow-md">
         {/* Navbar */}
      <Header style={{ backgroundColor: '#001529', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="logo">
          <Title level={3} style={{ color: 'white', margin: 0 }}>User Dashboard</Title>
        </div>
        <Button type="primary" onClick={handleLogout}>Logout</Button>
      </Header>
             <div style={{ backgroundColor: "#fff", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ddd" }}>
        <h2>Document Approval Dashboard</h2>
        <Dropdown overlay={notificationMenu} trigger={['click']}>
          <Badge count={unreadCount}>
            <BellOutlined onClick={handleNotificationClick} style={{ fontSize: "24px", cursor: "pointer" }} />
          </Badge>
        </Dropdown>
      </div>
            <Form onFinish={handleSubmit} className="space-y-4">
                <Form.Item
                    name="employeeId"
                    label="Serial Number"
                    rules={[{ required: true, message: "Employee ID is required" }]}
                >
                    <Input
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleChange}
                    />
                </Form.Item>

                <Form.Item
                    name="documentType"
                    label="Type of Document"
                    rules={[{ required: true, message: "Document Type is required" }]}
                >
                    <select
                        name="documentType"
                        value={formData.documentType}
                        onChange={handleChange}
                    >
                        <option value="">-- Select --</option>
                        <option value="salary-certificate">Salary Certificate</option>
                        <option value="work-certificate">Work Certificate</option>
                        <option value="other">Other</option>
                    </select>
                </Form.Item>

                {formData.documentType === "other" && (
                    <Form.Item
                        name="otherDocumentType"
                        label="Please specify"
                        rules={[{ required: true, message: "Please specify the document type" }]}
                    >
                        <Input
                            name="otherDocumentType"
                            value={formData.otherDocumentType}
                            onChange={handleChange}
                        />
                    </Form.Item>
                )}

                <Form.Item name="documentPurpose" label="Document Purpose">
                    <Input
                        name="documentPurpose"
                        value={formData.documentPurpose}
                        onChange={handleChange}
                    />
                </Form.Item>

                <Form.Item name="documentFile" label="Upload Document">
                    <Upload
                        name="documentFile"
                        showUploadList={false}
                        customRequest={({ file, onSuccess }) => {
                            setTimeout(() => {
                                onSuccess(null, file);
                            }, 0);
                        }}
                    >
                        <Button icon={<UploadOutlined />}>Upload</Button>
                    </Upload>
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={submitting}
                    >
                        {submitting ? "Submitting..." : "Apply"}
                    </Button>
                </Form.Item>

                {showSuccessMessage && (
                    <p className="text-green-500 mt-2">
                        Document request submitted successfully!
                    </p>
                )}
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </Form>
        </div>
    );
};

export default DocumentRequest;
