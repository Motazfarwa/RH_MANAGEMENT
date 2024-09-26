import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Table, Space, message } from "antd";
import { DeleteOutlined, FilePdfOutlined, FileExcelOutlined } from "@ant-design/icons";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx"; // Importing xlsx library
import "antd/dist/antd.css"; // Importing Ant Design styles
import Chatboat from "components/Chatbot/chatboat";
import { Layout, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function ComplexTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const { Header, Content } = Layout;
const { Title, Text } = Typography;
  useEffect(() => {
    const fetchData = async () => {

      setLoading(true);
      try {
        const response = await axios.get("http://localhost:4000/api/getalluser", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setData(response.data);
      } catch (error) {
        message.error("Error fetching data");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`http://localhost:4000/api/deleteuser/${userId}`,{

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setData((prevData) => prevData.filter((user) => user._id !== userId));
      message.success("User deleted successfully");
    } catch (error) {
      message.error("Error deleting user");
      console.error("Error deleting user:", error);
    }
  };
  
  const handleDownloadPDF = (user) => {
    const doc = new jsPDF();
    doc.text(`User Details`, 20, 10);
    doc.autoTable({
      startY: 20,
      head: [["Field", "Value"]],
      body: [
        ["Full Name", user.FullName],
        ["Email", user.email],
        ["Role", user.role],
      ],
    });
    doc.save(`${user.FullName}_details.pdf`);
  };

  const handleDownloadExcel = (user) => {
    const worksheet = XLSX.utils.json_to_sheet([
      {
        FullName: user.FullName,
        Email: user.email,
        Role: user.role,
      },
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "User Details");
    XLSX.writeFile(workbook, `${user.FullName}_details.xlsx`);
  };

  const columns = [
    {
      title: "Full Name",
      dataIndex: "FullName",
      key: "FullName",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          >
            Delete
          </Button>
          <Button
            type="default"
            icon={<FilePdfOutlined />}
            onClick={() => handleDownloadPDF(record)}
          >
            PDF
          </Button>
          <Button
            type="default"
            icon={<FileExcelOutlined />}
            onClick={() => handleDownloadExcel(record)}
          >
            Excel
          </Button>
        </Space>
      ),
    },
  ];
  const navigate = useNavigate();

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate("/sign-in");
  };
    
  return (
    <div style={{ padding: "24px" }}>
       <Header style={{ backgroundColor: '#001529', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="logo">
          <Title level={3} style={{ color: 'white', margin: 0 }}> DOCUMENT Validation</Title>
        </div>
        <Button type="primary" onClick={handleLogout}>Logout</Button>
      </Header>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="_id"
        loading={loading}
        bordered
        pagination={false}
        style={{
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      />
     <div style={{ margin: "0", position: "fixed", bottom: "20px", right: "20px" }}>
     <Chatboat />
     </div>

      
    </div>
  );
}
