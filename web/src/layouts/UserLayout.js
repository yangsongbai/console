import React, { Fragment } from "react";
import { formatMessage, getLocale } from "umi/locale";
import Link from "umi/link";
import { Icon } from "antd";
import GlobalFooter from "@/components/GlobalFooter";
import SelectLang from "@/components/SelectLang";
import styles from "./UserLayout.less";
import logo from "../assets/logo.svg";

const links = [
  {
    key: "help",
    title: formatMessage({ id: "layout.user.link.help" }),
    href: "",
  },
  {
    key: "privacy",
    title: formatMessage({ id: "layout.user.link.privacy" }),
    href: "",
  },
  {
    key: "terms",
    title: formatMessage({ id: "layout.user.link.terms" }),
    href: "",
  },
];

const copyright = (
  <Fragment>
    Copyright <Icon type="copyright" /> {new Date().getFullYear()} {APP_AUTHOR}
  </Fragment>
);
const appslogon = formatMessage({ id: "layout.user.appslogon" });

class UserLayout extends React.PureComponent {
  render() {
    const { children } = this.props;
    return (
      <div className={styles.container}>
        <div className={styles.lang}>
          <SelectLang />
        </div>
        <div className={styles.content}>
          <div className={styles.top}>
            <div className={styles.header}>
              <Link to="/">
                <img alt="logo" className={styles.logo} src={logo} />
              </Link>
            </div>
            <div className={styles.desc}>{appslogon}</div>
          </div>
          {children}
        </div>
        <GlobalFooter links={[]} copyright={copyright} />
      </div>
    );
  }
}

export default UserLayout;
