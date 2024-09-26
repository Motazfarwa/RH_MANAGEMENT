import React, { useState, useContext } from "react";
import { Layout, Button, Typography, Form, Input, Col, Row, Switch, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from '../contexts/AuthContext';
import signinbg from "../assets/images/id-12775-01.png";
import { Header, Footer } from "components/Layout";

const { Content } = Layout;
const { Title } = Typography;

const SignIn = () => {
  const [rememberMe, setRememberMe] = useState(true);
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const response = await axios.post('http://localhost:4000/api/login', {
        email: values.email,
        password: values.password,
      });

      console.log('API:', response.data);

      // Save token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.user.role);
      localStorage.setItem('FullName', response.data.user.FullName);
      localStorage.setItem('profileImage', response.data.user.profileImage);
      setUser(response.data.user); // Update AuthContext with user data

      // Navigate based on user role
      if (response.data.user.role === 'ADMIN') {
        navigate('/admin');
      } else if (response.data.user.role==='MANAGER') {
        navigate('/Managerapprovment');
      } else {
        navigate('/documentrequest');
      }

      message.success("Login successful!");
    } catch (error) {
      console.error('Login failed', error);
      message.error("Login failed. Please try again.");
    }
  };

  const onFinishFailed = (errInfo) => {
    console.log("Error:", errInfo);
  };

  const onChange = (checked) => {
    setRememberMe(checked);
    console.log(`Switch to ${checked}`);
  };

  return (
    <div className="layout-default layout-signin">
      <Header btn="primary" />
      <Content className="signin">
        <Row gutter={[24, 0]} justify="space-around">
          <Col
            xs={{ span: 24, offset: 0 }}
            lg={{ span: 6, offset: 2 }}
            md={{ span: 12 }}
          >
            <Title className="mb-15">Sign In</Title>
            <Title className="font-regular text-muted" level={5}>
              Enter your email and password to sign in
            </Title>
            <Form
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              layout="vertical"
              className="row-col"
            >
              <Form.Item
                className="username"
                label="Email"
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Please input your email!",
                  },
                ]}
              >
                <Input placeholder="Email" />
              </Form.Item>

              <Form.Item
                className="username"
                label="Password"
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Please input your password!",
                  },
                ]}
              >
                <Input.Password placeholder="Password" />
              </Form.Item>

              <Form.Item
                name="remember"
                className="align-center"
                valuePropName="checked"
              >
                <Switch defaultChecked onChange={onChange} />
                Remember me
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ width: "100%" }}
                >
                  SIGN IN
                </Button>
              </Form.Item>
              <p className="font-semibold text-muted">
                Don't have an account?{" "}
                <Link to="/sign-up" className="text-dark font-bold">
                  Sign Up
                </Link>
              </p>
            </Form>
          </Col>
          <Col
            className="sign-img"
            style={{ padding: 12 }}
            xs={{ span: 24 }}
            lg={{ span: 12 }}
            md={{ span: 12 }}
          >
            <img src={signinbg} alt="" />
          </Col>
        </Row>
      </Content>
    
    </div>
  );
};

export default SignIn;
