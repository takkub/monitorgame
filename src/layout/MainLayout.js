import React from "react";
import {Layout, Menu} from "antd";
const { Header, Footer } = Layout;
const MainLayout = ({ children }) => {
  return (
    <Layout style={{ overflow: 'hidden'}}>
      <Header>
        <div className="logo" />
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
          <Menu.Item key="1">Home</Menu.Item>
          <Menu.Item key="2">Kolobok</Menu.Item>
          <Menu.Item key="3">nav 3</Menu.Item>
        </Menu>
      </Header>
      <Layout>
        <Layout.Content style={{ padding: 18, background: '#fff', minHeight: 280, overflow: 'auto'}}>
          <div className="site-layout-content">{children}</div>
        </Layout.Content>
      </Layout>
      <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer>
    </Layout>
  )
};

export default MainLayout;
