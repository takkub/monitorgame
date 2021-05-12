import React from "react";
import { Menu } from "antd";
import SubMenu from "antd/lib/menu/SubMenu";
import { useHistory } from "react-router-dom";

const SideNav = (props) => {
  const history = useHistory();
  const openKeys = history.location.pathname.split("/").filter((i) => i);
  const selectedKeys = [openKeys[openKeys.length - 1]];

  let child = [];
  for (let item of props.menu) {
    let Icon = null;
    if (item.icon) {
      Icon = React.createElement(item.icon, { key: item.name + "icon" });
    }
    if (item.items && !item.path) {
      let title = item.label;
      child.push(
        React.createElement(SideNav, {
          key: item.name,
          type: "SubMenu",
          menu: item.items,
          title,
          icon: Icon,
        })
      );
    } else if (item.items && item.path) {
      let title = item.label;
      child.push(
        React.createElement(SideNav, {
          key: item.name,
          type: "SubMenu",
          menu: item.items,
          title,
          icon: Icon,
          onTitleClick: () =>history.push(item.path)
        })
      );
    } else {
      child.push(
        React.createElement(
          Menu.Item,
          {
            key: item.name,
            onClick: () => history.push(item.path),
            icon: Icon,
          },
          [item.label]
        )
      );
    }
  }
  const Props = props.type ? props : {};
  const { menuItems, ...rest } = Props;

  if (props.type) {
    return React.createElement(
      SubMenu,
      { title: props.title, ...rest },
      ...child
    );
  } else {
    return React.createElement(
      Menu,
      {
        mode: "inline",
        defaultOpenKeys: openKeys,
        defaultSelectedKeys: selectedKeys,
        ...props,
      },
      ...child
    );
  }
};

export default SideNav;
