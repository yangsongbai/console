import React, { PureComponent } from "react";
import { Icon, Layout } from "antd";
import pathToRegexp from "path-to-regexp";
import classNames from "classnames";
import Link from "umi/link";
import styles from "./index.less";
import BaseMenu, { getMenuMatches } from "./BaseMenu";
import { urlToList } from "../_utils/pathTools";
import Debounce from "lodash-decorators/debounce";
import BottomMenu from "./BottomMenu";

const { Sider } = Layout;

/**
 * 获得菜单子节点
 * @memberof SiderMenu
 */
const getDefaultCollapsedSubMenus = (props) => {
  const {
    location: { pathname },
    flatMenuKeys,
  } = props;
  return urlToList(pathname)
    .map((item) => getMenuMatches(flatMenuKeys, item)[0])
    .filter((item) => item);
};

/**
 * Recursively flatten the data
 * [{path:string},{path:string}] => {path,path2}
 * @param  menu
 */
export const getFlatMenuKeys = (menu) =>
  menu.reduce((keys, item) => {
    keys.push(item.path);
    if (item.children) {
      return keys.concat(getFlatMenuKeys(item.children));
    }
    return keys;
  }, []);

/**
 * Find all matched menu keys based on paths
 * @param  flatMenuKeys: [/abc, /abc/:id, /abc/:id/info]
 * @param  paths: [/abc, /abc/11, /abc/11/info]
 */
export const getMenuMatchKeys = (flatMenuKeys, paths) =>
  paths.reduce(
    (matchKeys, path) =>
      matchKeys.concat(
        flatMenuKeys.filter((item) => pathToRegexp(item).test(path))
      ),
    []
  );

export default class SiderMenu extends PureComponent {
  constructor(props) {
    super(props);
    this.flatMenuKeys = getFlatMenuKeys(props.menuData);
    this.state = {
      openKeys: getDefaultCollapsedSubMenus(props),
    };
  }

  static getDerivedStateFromProps(props, state) {
    const { pathname } = state;
    if (props.location.pathname !== pathname) {
      return {
        pathname: props.location.pathname,
        openKeys: getDefaultCollapsedSubMenus(props),
      };
    }
    return null;
  }

  isMainMenu = (key) => {
    const { menuData } = this.props;
    return menuData.some((item) => {
      if (key) {
        return item.key === key || item.path === key;
      }
      return false;
    });
  };

  handleOpenChange = (openKeys) => {
    const moreThanOne =
      openKeys.filter((openKey) => this.isMainMenu(openKey)).length > 1;
    this.setState({
      openKeys: moreThanOne ? [openKeys.pop()] : [...openKeys],
    });
  };

  renderIcon(collapsed, icon, logo) {
    if (collapsed) {
      return (
        <div className={styles.icon} id="logo">
          <Link to="/">
            <img src={icon} alt="logo" />
          </Link>
        </div>
      );
    }

    return (
      <div className={styles.logo} id="logo">
        <Link to="/">
          <img src={logo} alt="logo" />
        </Link>
      </div>
    );
  }

  @Debounce(600)
  triggerResizeEvent() {
    // eslint-disable-line
    const event = document.createEvent("HTMLEvents");
    event.initEvent("resize", true, false);
    window.dispatchEvent(event);
  }

  toggle = () => {
    const { collapsed, onCollapse } = this.props;
    onCollapse(!collapsed);
    this.triggerResizeEvent();
  };

  render() {
    const {
      icon,
      logo,
      collapsed,
      onCollapse,
      fixSiderbar,
      theme,
    } = this.props;
    const { openKeys } = this.state;
    const defaultProps = collapsed ? {} : { openKeys };

    const siderClassName = classNames(styles.sider, {
      [styles.fixSiderbar]: fixSiderbar,
      [styles.light]: theme === "light",
    });

    return (
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        onCollapse={onCollapse}
        width={256}
        theme={theme}
        className={siderClassName}
      >
        {this.renderIcon(collapsed, icon, logo)}
        <BaseMenu
          {...this.props}
          mode="inline"
          handleOpenChange={this.handleOpenChange}
          onOpenChange={this.handleOpenChange}
          style={{ padding: "10px 0", width: "100%", overflowX: "hidden" }}
          {...defaultProps}
          collapsed={collapsed}
        />
        <BottomMenu {...this.props} {...defaultProps} />
      </Sider>
    );
  }
}
