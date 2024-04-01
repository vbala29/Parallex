/**
=========================================================
* Soft UI Dashboard React - v4.0.1
=========================================================

* Product Page: https://www.creative-tim.com/product/soft-ui-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState, useEffect } from "react";

// react-router components
import { useLocation, Link, useNavigate } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @material-ui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Icon from "@mui/material/Icon";

// Soft UI Dashboard React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftInput from "components/SoftInput";

import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';


// Soft UI Dashboard React examples
import Breadcrumbs from "examples/Breadcrumbs";
import NotificationItem from "examples/Items/NotificationItem";

import Cookies from 'js-cookie';

import axios from 'axios';

// Custom styles for DashboardNavbar
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarMobileMenu,
} from "examples/Navbars/DashboardNavbar/styles";

// Soft UI Dashboard React context
import {
  useSoftUIController,
  setTransparentNavbar,
  setMiniSidenav,
  setOpenConfigurator,
} from "context";

// Images
import team2 from "assets/images/team-2.jpg";
import logoSpotify from "assets/images/small-logos/logo-spotify.svg";

import config from "../../../config.json"

import { FaMicrochip } from "react-icons/fa6";
import { FaArrowRight } from "react-icons/fa";
import { FaMoneyBill } from "react-icons/fa";

function DashboardNavbar({ absolute, light, isMini }) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useSoftUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, openConfigurator } = controller;
  const [openMenu, setOpenMenu] = useState(false);
  const [username, setUsername] = useState("");
  const route = useLocation().pathname.split("/").slice(1);
  const navigate = useNavigate();
  const [availablePCUs, setAvailablePCUs] = useState(0)
  const [pcuCost, setPCUCost] = useState(0);

  const logout = () => {
    Cookies.set("token", "");
    navigate("/authentication/sign-in");
  }

  useEffect(() => {
    // Setting the navbar type
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }
    setUsername(Cookies.get("username"))

    // A function that sets the transparent state of the navbar.
    function handleTransparentNavbar() {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }

    const host = "http://" + config.ip_addresses.web_backend_server + ":8080";
    function update() {
      axios.get(host + "/available-pcu-count", {
        headers: {
          authorization: "Basic " + Cookies.get("token")
        }
      })
        .then(response => {
          setAvailablePCUs(response.data.available_pcu_count)
        })
        .catch(error => {
          console.log(error);
        })

      axios.get(host + "/pcu-cost", {
        headers: {
          authorization: "Basic " + Cookies.get("token")
        }
      })
        .then(response => {
          setPCUCost(response.data.pcu_cost)
        })
        .catch(error => {
          console.log(error);
        })
    }
    update();
    setInterval(update, 2000);

    /** 
     The event listener that's calling the handleTransparentNavbar function when 
     scrolling the window.
    */
    window.addEventListener("scroll", handleTransparentNavbar);

    // Call the handleTransparentNavbar function to set the state with the initial value.
    handleTransparentNavbar();

    // Remove event listener on cleanup
    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  // const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  // const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);
  // const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);
  const handleCloseMenu = () => setOpenMenu(false);

  // Render the notifications menu
  const renderMenu = () => (
    <Menu
      anchorEl={openMenu}
      anchorReference={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      open={Boolean(openMenu)}
      onClose={handleCloseMenu}
      sx={{ mt: 2 }}
    >
      <NotificationItem
        image={<img src={team2} alt="person" />}
        title={["New message", "from Laur"]}
        date="13 minutes ago"
        onClick={handleCloseMenu}
      />
      <NotificationItem
        image={<img src={logoSpotify} alt="person" />}
        title={["New album", "by Travis Scott"]}
        date="1 day"
        onClick={handleCloseMenu}
      />
      <NotificationItem
        color="secondary"
        image={
          <Icon fontSize="small" sx={{ color: ({ palette: { white } }) => white.main }}>
            payment
          </Icon>
        }
        title={["", "Payment successfully completed"]}
        date="2 days"
        onClick={handleCloseMenu}
      />
    </Menu>
  );

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={{ background: "#f6f6f6", borderRadius:"0px"}}
    >
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        <SoftBox color="inherit" mb={{ xs: 1, md: 0 }} sx={(theme) => navbarRow(theme, { isMini })}>
          <Breadcrumbs icon="home" title={route[route.length - 1]} route={route} light={light} />
        </SoftBox>
        <SoftBox display="flex" flex-direction="row">
          <SoftBox pr={15}>
            <Link to="/billing">
              <div>
                <FaMicrochip style={{ color: "#555555" }} />
                <FaArrowRight style={{ color: "#555555", padding: "3px" }} />
                <FaMoneyBill style={{ color: "#5cab6b" }} />
              </div>
              <SoftTypography variant="h6">
                {pcuCost} USD
              </SoftTypography>
            </Link>
          </SoftBox>
          <SoftBox pr={0}>
            <Link to="/billing">
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                <FaMicrochip style={{ color: "#555555", marginBottom: "10px", marginTop: "2px" }} />
                <SoftTypography variant="h6" pl={1}>
                  PCUs: {availablePCUs}
                </SoftTypography>
              </div>
            </Link>
          </SoftBox>
        </SoftBox>
        {isMini ? null : (
          <SoftBox sx={(theme) => navbarRow(theme, { isMini })}>
              <Link to="/dashboard">
                <SoftTypography variant="h6">
                  {username}
                </SoftTypography>
              </Link>

            <Link to="/dashboard">
              <IconButton sx={navbarIconButton} size="small">
                <AccountCircleIcon />
              </IconButton>
            </Link>

            <IconButton
              size="small"
              color="inherit"
              sx={navbarIconButton}
              onClick={logout}
            >
              <LogoutIcon />
            </IconButton>
          </SoftBox>
        )}
      </Toolbar>
    </AppBar>
  );
}

// Setting default values for the props of DashboardNavbar
DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

// Typechecking props for the DashboardNavbar
DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;
