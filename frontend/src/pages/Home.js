import {
  Card,
  Row,
  Col,
  Typography,
  Radio,
  Upload,
  message,
  Button,
  Timeline,
} from "antd";
import Echat from "components/charts/Echat";
import LineChart from "components/charts/LineChart";
import React, { useEffect, useState } from "react";
import { count, list } from "utils/HomeData";
import { Iconify } from "utils/Iconify";
import AntCard from "components/AntCard";
import axios from "axios";

const { Title, Paragraph, Text } = Typography;

export default function Home() {
  const [reverse, setReverse] = useState(false);
  const [users, setUsers] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  const token = localStorage.getItem('token');
  
  // Fetch users and set chart data
  useEffect(() => {
    const fetchUsers = async () => {
      const response = await axios.get("http://localhost:4000/api/getalluser", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(response.data);

      // Prepare chart data using email and FullName
      const labels = response.data.map(user => user.email); // Set user email as chart labels
      const datasetFullNameLengths = response.data.map(user => user.FullName.length); // Example: Using FullName length as a data point
      
      setChartData({
        labels,
        datasets: [
          {
            label: 'FullName Length by Email',
            data: datasetFullNameLengths,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          }
        ]
      });
    };
    fetchUsers();
  }, []);

  return (
    <>
      <div className="layout-content">
        {/* Render the charts with the user data */}
        <Row gutter={[24, 0]}>
          <AntCard xl={10}>
            <Echat data={chartData} /> {/* Pass updated chartData to Echat */}
          </AntCard>
          <AntCard xl={14}>
            <LineChart data={chartData} /> {/* Pass updated chartData to LineChart */}
          </AntCard>
        </Row>

        {/* Rest of your component code */}
      </div>
    </>
  );
}
