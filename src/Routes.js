import {BrowserRouter, Link, Route, Switch} from "react-router-dom";
import React, {useState} from "react";
import MainLayout from "./layout/MainLayout";
import ListAdventures from "./page/kolobok/adventures";
import {Layout, Menu} from "antd";
import {ContainerFilled} from "@ant-design/icons";
import Staked from "./page/r-planet/staked";
import Home from "./page/Home";
import AWAccount from "./page/AWAccount";
import Login from "./page/Login";
import Bot from "./page/kolobok/bot";
const { Header, Content, Footer, Sider } = Layout;

const Routes = () => {
  return (
    <BrowserRouter>
      <Layout style={{ minHeight: "100vh" }}>
          <Sider
            collapsible
          >
            <div className="logo" />
            <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
              <Menu.Item key="1">
                <ContainerFilled/>
                <span>Home</span>
                <Link to="/" />
              </Menu.Item>
              <Menu.Item key="2">
                <ContainerFilled/>
                <span>Kolobok Adventures</span>
                <Link to="/kolobok/adventures" />
              </Menu.Item>
              <Menu.Item key="3">
                <ContainerFilled/>
                <span>R-Planet Staked</span>
                <Link to="/rplanet/staked" />
              </Menu.Item>
              <Menu.Item key="4">
                <ContainerFilled/>
                <span>AW Account</span>
                <Link to="/alienworld/account" />
              </Menu.Item>
              <Menu.Item key="5">
                <ContainerFilled/>
                <span>Login</span>
                <Link to="/login" />
              </Menu.Item>
              <Menu.Item key="6">
                <ContainerFilled/>
                <span>Bot</span>
                <Link to="/bot" />
              </Menu.Item>

            </Menu>
          </Sider>
          <Layout>
            <Header style={{ background: "#fff", padding: 0, paddingLeft: 16 }}>
              <ContainerFilled/>
            </Header>
            <Content
              style={{
                margin: "24px 16px",
                padding: 24,
                background: "#fff",
                minHeight: 280
              }}
            >
              <Route exact path="/" component={Home} />
              <Route path="/kolobok/adventures" component={ListAdventures} />
              <Route path="/rplanet/staked" component={Staked} />
              <Route path="/alienworld/account" component={AWAccount} />
              <Route path="/bot" component={Bot} />
              <Route path="/login" component={Login} />
            </Content>
            <Footer style={{ textAlign: "center" }}>
              Ant Design ©2016 Created by Ant UED
            </Footer>
          </Layout>
        </Layout>
    </BrowserRouter>
  )
}
export default Routes;

