import React, { useEffect, useState } from "react";
import { Typography, Row, Col } from "antd";
import ReactApexChart from "react-apexcharts";
import axios from "axios";

const { Title, Paragraph } = Typography;

export default function Echat() {
  const [users, setUsers] = useState([]);
  const [chartData, setChartData] = useState({
    series: [],
    options: {
      chart: {
        type: "bar",
        height: 350,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded'
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      xaxis: {
        categories: [], // will be filled with email addresses
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val;
          }
        }
      }
    }
  });

  const token = localStorage.getItem('token');

  // Fetch users and set chart data
  useEffect(() => {
    const fetchUsers = async () => {
      const response = await axios.get("http://localhost:4000/api/getalluser", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const fetchedUsers = response.data;
      setUsers(fetchedUsers);

      // Prepare chart data using email and FullName
      const emails = fetchedUsers.map(user => user.email); // Set user email as chart labels
      const fullNameLengths = fetchedUsers.map(user => user.FullName.length); // Example: Using FullName length as a data point

      setChartData({
        series: [
          {
            name: "FullName Length",
            data: fullNameLengths, // Set FullName lengths as data points
          },
        ],
        options: {
          ...chartData.options,
          xaxis: {
            categories: emails, // Set user email as x-axis labels
          },
        },
      });
    };
    fetchUsers();
  }, []);

  return (
    <>
      <div id="chart">
        <ReactApexChart
          series={chartData.series} // Dynamically set series
          options={chartData.options} // Dynamically set options
          height={350}
          className="bar-chart"
          type="bar"
        />
      </div>
      <div className="chart-visitor">
        <Title level={5}>Active Users</Title>
        <Paragraph className="lastweek">
          than last week <span className="bnb2">+30%</span>
        </Paragraph>
        <Paragraph className="lastweek">
          We have created multiple options for you to put together and customise
          into pixel perfect pages.
        </Paragraph>
        <Row>
          {users.map((user, index) => (
            <Col xs={6} key={index}>
              <div className="chart-visitor-count">
                <Title level={4}>{user.FullName}</Title>
                <span>{user.email}</span>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </>
  );
}
