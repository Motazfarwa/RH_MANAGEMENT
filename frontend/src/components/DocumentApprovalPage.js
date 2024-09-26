import React, { useState, useEffect } from "react";
import { Table, Button, message, Spin, Modal, Badge, Dropdown, Menu } from "antd";
import axios from "axios";
import Chatboat from "./Chatbot/chatboat";
import { BellOutlined } from "@ant-design/icons";
import io from "socket.io-client";
import { useNavigate } from 'react-router-dom';
import { Layout, Card, Typography, Space } from 'antd';
import { fixControlledValue } from "antd/lib/input/Input";
const { Header, Content } = Layout;
const { Title, Text } = Typography;

const DocumentApprovalPage = () => {
  const [documentRequests, setDocumentRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
const navigate = useNavigate();
  useEffect(() => {
    const fetchDocumentRequests = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:4000/documentrequest");
        setDocumentRequests(response.data);
      } catch (error) {
        message.error("Failed to fetch document requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentRequests();
  }, []);
  useEffect(() => {
  const unreadNotifications = notifications.filter(n => !n.isRead).length;
  setUnreadCount(unreadNotifications);
}, [notifications]);


  useEffect(() => {
    const socket = io('http://localhost:4000', {
      transports: ['websocket', 'polling'], // Ensure proper transport methods are used
      withCredentials: true, // Include credentials like cookies
    });
  
    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });
    
    socket.on('documentCreated', (data) => {
      console.log(data.message);
    });
  
    return () => socket.disconnect();
  }, []);
  
  const token = localStorage.getItem("token");

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
  

  const handleApprove = async (documentId) => {
    console.log(`Approve button clicked for document ID: ${documentId}`);
    setApproving(documentId);

    const token = localStorage.getItem("token");

    try {
      const response = await axios.put(
        `http://localhost:4000/documentrequest/handleapprovment/${documentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      message.success(response.data.message);

      // Ensure the state is updated correctly
      setDocumentRequests((prev) =>
        prev.map((doc) =>
          doc._id === documentId ? { ...doc, isApproved: true } : doc
        )
      );
    } catch (error) {
      message.error("Failed to approve the document request.");
    } finally {
      setApproving(null);
    }
  };
  
  const handleViewFile = async (fileName) => {
    try {
      const response = await axios.get(`http://localhost:4000/documentrequest/download/${fileName}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      setPdfUrl(url);
      setIsModalVisible(true);
    } catch (error) {
      message.error("Failed to load the file.");
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setPdfUrl(null);
  };

  const handleNotificationClick = () => {
    setUnreadCount(0);
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
  
  const handleLogout = ()=>{
    localStorage.removeItem('token');
    navigate("/sign-in")
  }

  const columns = [
    {
      title: "Document Type",
      dataIndex: "document_type",
      key: "document_type",
    },
    {
      title: "Employee",
      dataIndex: "employee_id",
      key: "employee_id",
      render: (employee) => employee?.FullName || "Unknown",
    },
    {
      title: "Request Date",
      dataIndex: "request_date",
      key: "request_date",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Status",
      dataIndex: "isApproved",
      key: "isApproved",
      render: (isApproved) =>
        isApproved ? (
          <span style={{ color: "green" }}>Approved</span>
        ) : (
          <span style={{ color: "red" }}>Pending</span>
        ),
    },
    {
      title: "File",
      key: "file",
      render: (_, record) => (
        record.file_path ? (
          <Button type="link" onClick={() => handleViewFile(record.file_path)}>
            View File
          </Button>
        ) : (
          "No file"
        )
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => {
            console.log(`Approving document with ID: ${record._id}`);
            handleApprove(record._id);
          }}
          disabled={record.isApproved || approving === record._id}
        >
          {approving === record._id ? <Spin /> : "Approve"}
        </Button>
      ),
    },
  ];

  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
        {/* Navbar */}
        <Header style={{ backgroundColor: '#001529', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="logo">
          <Title level={3} style={{ color: 'white', margin: 0 }}> DOCUMENT Validation</Title>
        </div>
        <Button type="primary" onClick={handleLogout}>Logout</Button>
      </Header>
      <div style={{ backgroundColor: "#fff", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ddd" }}>
        <h2>Manager Dashboard</h2>
        <Dropdown overlay={notificationMenu} trigger={['click']}>
          <Badge count={unreadCount}>
            <BellOutlined onClick={handleNotificationClick} style={{ fontSize: "24px", cursor: "pointer" }} />
          </Badge>
        </Dropdown>
      </div>

      <div style={{ padding: "20px" }}>
        <Table
          columns={columns}
          dataSource={documentRequests}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 5 }}
          style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px" }}
        />
      </div>

      <Modal
        visible={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width="80%"
      >
        {pdfUrl && (
          <iframe
            src={pdfUrl}
            title="PDF Viewer"
            width="100%"
            height="600px"
            style={{ border: "none" }}
          />
        )}
      </Modal>
      <div style={{ display: 'flex', position: "fixed", bottom: "20px", right: "20px" }}>
     <Chatboat />
     </div>

    </div>
  );
};

export default DocumentApprovalPage;
