import React from "react";
import { Menu, Avatar } from "antd";
import { UserOutlined, CodeOutlined, LogoutOutlined } from "@ant-design/icons";

const RightMenu = ({ mode }) => {
  return (
    <Menu mode={mode}>
      <Menu.SubMenu
        title={
          <>
            <Avatar icon={<UserOutlined />} />
            <span className="username">John Doe</span>
          </>
        }
      >
        <Menu.Item key="project">
          <CodeOutlined /> Мои проекты
        </Menu.Item>
        <Menu.Item key="about-us">
          <UserOutlined /> Мой профиль
        </Menu.Item>
        <Menu.Item key="log-out">
          <LogoutOutlined /> Выход
        </Menu.Item>
      </Menu.SubMenu>
    </Menu>
  );
};

export default RightMenu;