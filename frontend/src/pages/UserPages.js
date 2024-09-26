import React, { useState, useEffect } from "react";
import { Table, Button, message, Spin, Badge, Dropdown, Menu, Modal } from "antd";
import axios from "axios";
import { BellOutlined } from "@ant-design/icons";
import io from "socket.io-client";
import { useNavigate } from 'react-router-dom';
import { Layout, Typography } from 'antd';
import { useAuthContext } from '../contexts/AuthContext';
import  {} from  '../'
const { Header } = Layout;
const { Title } = Typography;

const UserPages = () => {
  const [documentRequests, setDocumentRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user: authUser, loading: authLoading } = useAuthContext();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);


  // Fetch document requests for a specific employee
  useEffect(() => {
    const fetchDocumentRequests = async () => {
      if (!authUser?._id) return; // Ensure userId (from authUser) exists

      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:4000/documentrequest/${authUser._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDocumentRequests(response.data);
      } catch (error) {
        message.error("Failed to fetch document requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentRequests();
  }, [ token]);

  // Fetch notifications and count unread ones
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://localhost:4000/notificationrequest/notifications', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        const userRole = localStorage.getItem('userRole');
        const filteredNotifications = response.data.filter(notification =>
          (userRole === 'EMPLOYEE' && notification.type === 'approval') ||
          (userRole === 'MANAGER' && notification.type === 'creation')
        );
        setNotifications(filteredNotifications);
        setUnreadCount(filteredNotifications.filter(n => !n.isRead).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, [token]);

  // Handle notifications click
  const handleNotificationClick = () => {
    setUnreadCount(0);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate("/sign-in");
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
      render: (employee) => employee?.FullName || "Unknown", // Display FullName of Employee
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
      render: (_, record) =>
        record.file_path ? (
          <Button type="link" onClick={() => handleViewFile(record.file_path)}>
            View File
          </Button>
        ) : (
          "No file"
        ),
    },
  ];

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
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Navbar */}
      <Header style={{ backgroundColor: '#001529', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="logo">
          <Title level={3} style={{ color: 'white', margin: 0 }}>ADD DOCUMENT</Title>
        </div>
        <Button type="primary" onClick={handleLogout}>Logout</Button>
      </Header>
      
      <div style={{ backgroundColor: "#fff", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ddd" }}>
        <h2>Employee Dashboard</h2>
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
    </div>
  );
};

export default UserPages;
