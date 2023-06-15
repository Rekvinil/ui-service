import React from "react";
import { Menu } from "antd";

const LeftMenu = ({ mode }) => {
  return (
    <Menu mode={mode}>
      <Menu.Item key="explore">Комнаты</Menu.Item>
      <Menu.Item key="features">Редактор кода</Menu.Item>
      <Menu.Item key="contact">Поддержка</Menu.Item>
    </Menu>
  );
};

export default LeftMenu;