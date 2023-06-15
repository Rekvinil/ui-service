import { FileOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import React, { useState } from 'react';

const items = [
  {
    label: 'Файл',
    key: 'SubMenu',
    icon: <FileOutlined />,
    children: [
      {
        label: 'Создать файл',
        key: 'createFile',
      },
      {
        label: 'Создать пакет',
        key: 'createPackage',
      },
      {
        label: 'Удалить файл',
        key: 'deleteFIle',
      }
    ],
  },
  {
    label: 'Запуск',
    key: 'SubMenu2',
    icon: <PlayCircleOutlined />,
    children: [
      {
        label: 'Запустить проект',
        key: 'runProject',
      }
    ],
  },
];


function FileMenu() {
  const [current, setCurrent] = useState('mail');
  const onClick = (e) => {
    console.log('click ', e);
    setCurrent(e.key);
  };
    return (  
    <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items}/>
  );
}

export default FileMenu;