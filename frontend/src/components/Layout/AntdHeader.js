import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  openDrawer,
  handleFixedNavbar,
  handleSideNavColor,
  handleSidenavType,
  handleSidebar,
} from "Redux/features/MainSlice";
import {
  Row,
  Col,
  Breadcrumb,
  Badge,
  Dropdown,
  List,
  Avatar,
  Button,
  Drawer,
  Typography,
  Switch,
  Input,
} from "antd";
import {
  data,
  bell,
  logsetting,
  toggler,
  profileSVg,
  setting,
} from "utils/HeaderData";
import { Link, NavLink } from "react-router-dom";
import styled from "styled-components";
import { Iconify } from "utils/Iconify";
const ButtonContainer = styled.div`
  .ant-btn-primary {
    background-color: #1890ff;
  }
  .ant-btn-success {
    background-color: #52c41a;
  }
  .ant-btn-yellow {
    background-color: #fadb14;
  }
  .ant-btn-black {
    background-color: #262626;
    color: #fff;
    border: 0px;
    border-radius: 5px;
  }
  .ant-switch-active {
    background-color: #1890ff;
  }
`;
const { Title, Text } = Typography;
const menu = (
  <List
    min-width="100%"
    className="header-notifications-dropdown"
    style={{
      backgroundColor: "#fff",
      boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.1)",
      borderRadius: "1rem",
    }}
    itemLayout="horizontal"
    dataSource={data}
    renderItem={(item) => (
      <List.Item style={{ borderRadius: "1rem" }}>
        <List.Item.Meta
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: "1rem",
          }}
          avatar={<Avatar shape="square" src={item.avatar} />}
          title={item.title}
          description={item.description}
        />
      </List.Item>
    )}
  />
);

export default function AntdHeader({ name }) {
  const { sideNavType, visible, placement } = useSelector(
    (state) => state.mainSlice
  );
  const dispatch = useDispatch();

  return (
    <>
      <div className="setting-drwer" onClick={() => dispatch(openDrawer(true))}>
        {setting}
      </div>
   
    </>
  );
}
