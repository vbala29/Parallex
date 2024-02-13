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
import { useSelector, useDispatch } from 'react-redux'

// @mui material components
import Divider from "@mui/material/Divider";
import Switch from "@mui/material/Switch";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// @mui icons
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookIcon from "@mui/icons-material/Facebook";

// Soft UI Dashboard React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";

// Custom styles for the Configurator
import ConfiguratorRoot from "examples/Configurator/ConfiguratorRoot";
import { setCores, setMemory, setDuration, selectCores, selectMemory, selectDuration } from "examples/Configurator/ProviderState";
import { calculatePCU } from "utils/format";

// Soft UI Dashboard React context
import {
  useSoftUIController,
  setOpenConfigurator,
  setTransparentSidenav,
  setFixedNavbar,
  setSidenavColor,
} from "context";

function memoryText(value) {
  return `${value} MiB`;
}



function Configurator() {
  const os = require('os');

  // Get total system memory
  // const totalMemory = os.totalmem();

  // Get free system memory
  // const freeMemory = os.freemem();
  // const totalMemory = os.totalmem():
  // const totalMemoryBytes = os.totalmem();
  const totalMemoryBytes = 15.987 * 1e9;

  const totalMemoryMiB = totalMemoryBytes / 1024 / 1024;


  // Get the number of CPU cores
  // const cpuCores = os.cpus().length;
  const cpuCores = 8;





  const [controller, softui_dispatch] = useSoftUIController();
  const { openConfigurator, transparentSidenav, fixedNavbar, sidenavColor } = controller;
  const [disabled, setDisabled] = useState(false);
  const sidenavColors = ["primary", "dark", "info", "success", "warning", "error"];
  const currCores = useSelector(selectCores);
  const currMemory = useSelector(selectMemory);
  const currDurration = useSelector(selectDuration);
  const providerStateDispatch = useDispatch();

  const handleTimeChange = (time) => {
    providerStateDispatch(setDuration(time))
  };

  // Use the useEffect hook to change the button state for the sidenav type based on window size.
  useEffect(() => {
    // A function that sets the disabled state of the buttons for the sidenav type.
    function handleDisabled() {
      return window.innerWidth > 1200 ? setDisabled(false) : setDisabled(true);
    }

    // The event listener that's calling the handleDisabled function when resizing the window.
    window.addEventListener("resize", handleDisabled);

    // Call the handleDisabled function to set the state with the initial value.
    handleDisabled();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleDisabled);
  }, []);

  const handleCloseConfigurator = () => setOpenConfigurator(softui_dispatch, false);
  const handleTransparentSidenav = () => setTransparentSidenav(softui_dispatch, true);
  const handleWhiteSidenav = () => setTransparentSidenav(softui_dispatch, false);
  const handleFixedNavbar = () => setFixedNavbar(softui_dispatch, !fixedNavbar);

  // sidenav type buttons styles
  const sidenavTypeButtonsStyles = ({
    functions: { pxToRem },
    boxShadows: { buttonBoxShadow },
  }) => ({
    height: pxToRem(42),
    boxShadow: buttonBoxShadow.main,

    "&:hover, &:focus": {
      opacity: 1,
    },
  });

  return (
    <ConfiguratorRoot variant="permanent" ownerState={{ openConfigurator }}>
      <SoftBox
        display="flex"
        justifyContent="space-between"
        alignItems="baseline"
        pt={3}
        pb={0.8}
        px={3}
      >
        <SoftBox>
          <SoftTypography variant="h5">Provider Options</SoftTypography>
          <SoftTypography variant="body2" color="text">
            Adjust compute settings
          </SoftTypography>
        </SoftBox>

        <Icon
          sx={({ typography: { size, fontWeightBold }, palette: { dark } }) => ({
            fontSize: `${size.md} !important`,
            fontWeight: `${fontWeightBold} !important`,
            stroke: dark.main,
            strokeWidth: "2px",
            cursor: "pointer",
            mt: 2,
          })}
          onClick={handleCloseConfigurator}
        >
          close
        </Icon>
      </SoftBox>

      <Divider />

      <SoftBox pt={1.25} pb={3} px={3}>
        <SoftBox>
          <SoftTypography variant="h6">CPU Cores</SoftTypography>

          {/* <SoftBox mb={0.5}>
            {sidenavColors.map((color) => (
              <IconButton
                key={color}
                sx={({ borders: { borderWidth }, palette: { white, dark }, transitions }) => ({
                  width: "24px",
                  height: "24px",
                  padding: 0,
                  border: `${borderWidth[1]} solid ${white.main}`,
                  borderColor: sidenavColor === color && dark.main,
                  transition: transitions.create("border-color", {
                    easing: transitions.easing.sharp,
                    duration: transitions.duration.shorter,
                  }),
                  backgroundImage: ({ functions: { linearGradient }, palette: { gradients } }) =>
                    linearGradient(gradients[color].main, gradients[color].state),

                  "&:not(:last-child)": {
                    mr: 1,
                  },

                  "&:hover, &:focus, &:active": {
                    borderColor: dark.main,
                  },
                })}
                onClick={() => setSidenavColor(softui_dispatch, color)}
              />
            ))}
          </SoftBox> */}
          <Slider
            aria-label="CPU Cores"
            defaultValue={0}
            valueLabelDisplay="auto"
            shiftStep={1}
            step={1}
            marks
            min={0}
            max={16}
            onChange={(event, newValue) => providerStateDispatch(setCores(newValue))}
          />


        </SoftBox>

        <SoftBox>
          <SoftTypography variant="h6">Memory</SoftTypography>
          <Slider
            aria-label="Memory (GiB)"
            defaultValue={0}
            valueLabelDisplay="auto"
            getAriaValueText={memoryText}
            valueLabelFormat={memoryText}
            shiftStep={1}
            step={Math.round(totalMemoryMiB / 16)}
            marks
            min={0}
            max={Math.round(totalMemoryMiB)}
            onChange={(event, newValue) => providerStateDispatch(setMemory(newValue))}
          />

        </SoftBox>

        <SoftBox>
          <SoftTypography variant="h6">Estimated PCU per Hour: {calculatePCU(currCores, currMemory)}</SoftTypography>

        </SoftBox>

        <SoftBox mt={3} lineHeight={1}>
          <SoftTypography variant="h6">Scheduled Start</SoftTypography>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
              format="hh:mm A"
              onChange={(newValue) => providerStateDispatch(setDuration(newValue))}
            />
          </LocalizationProvider>
        </SoftBox>

        <SoftBox mt={3} lineHeight={1}>
          <SoftTypography variant="h6">Scheduled End</SoftTypography>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
              format="hh:mm A"
              onChange={(newValue) => providerStateDispatch(setDuration(newValue))}
            />
          </LocalizationProvider>
        </SoftBox>






        {/* 
        <SoftBox mt={3} lineHeight={1}>
          <SoftTypography variant="h6">Sidenav Type</SoftTypography>
          <SoftTypography variant="button" color="text" fontWeight="regular">
            Choose between 2 different sidenav types.
          </SoftTypography>

          <SoftBox
            sx={{
              display: "flex",
              mt: 2,
            }}
          >
            <SoftButton
              color="info"
              variant={transparentSidenav ? "gradient" : "outlined"}
              onClick={handleTransparentSidenav}
              disabled={disabled}
              fullWidth
              sx={{
                mr: 1,
                ...sidenavTypeButtonsStyles,
              }}
            >
              Transparent
            </SoftButton>
            <SoftButton
              color="info"
              variant={transparentSidenav ? "outlined" : "gradient"}
              onClick={handleWhiteSidenav}
              disabled={disabled}
              fullWidth
              sx={sidenavTypeButtonsStyles}
            >
              White
            </SoftButton>
          </SoftBox>
        </SoftBox>
        <SoftBox mt={3} mb={2} lineHeight={1}>
          <SoftTypography variant="h6">Navbar Fixed</SoftTypography>

          <Switch checked={fixedNavbar} onChange={handleFixedNavbar} />
        </SoftBox>

        <Divider />

        <SoftBox mt={3} mb={2}>
          <SoftBox mb={2}>
            <SoftButton
              component={Link}
              href="https://www.creative-tim.com/product/soft-ui-dashboard-react"
              target="_blank"
              rel="noreferrer"
              color="dark"
              variant="gradient"
              fullWidth
            >
              free download
            </SoftButton>
          </SoftBox>
          <SoftButton
            component={Link}
            href="https://www.creative-tim.com/learning-lab/react/quick-start/soft-ui-dashboard/"
            target="_blank"
            rel="noreferrer"
            color="dark"
            variant="outlined"
            fullWidth
          >
            view documentation
          </SoftButton>
        </SoftBox>
        <SoftBox display="flex" justifyContent="center">
          <a
            className="github-button"
            href="https://github.com/creativetimofficial/soft-ui-dashboard-react"
            data-icon="octicon-star"
            data-size="large"
            data-show-count="true"
            aria-label="Star creativetimofficial/soft-ui-dashboard-react on GitHub"
          >
            Star
          </a>
        </SoftBox>
        <SoftBox mt={3} textAlign="center">
          <SoftBox mb={0.5}>
            <SoftTypography variant="h6">Thank you for sharing!</SoftTypography>
          </SoftBox>

          <SoftBox display="flex" justifyContent="center">
            <SoftBox mr={1.5}>
              <SoftButton
                component={Link}
                href="//twitter.com/intent/tweet?text=Check%20Soft%20UI%20Dashboard%20React%20made%20by%20%40CreativeTim%20%23webdesign%20%23dashboard%20%23react%23mui&url=https%3A%2F%2Fwww.creative-tim.com%2Fproduct%2Fsoft-ui-dashboard-react"
                target="_blank"
                rel="noreferrer"
                color="dark"
              >
                <TwitterIcon />
                &nbsp; Tweet
              </SoftButton>
            </SoftBox>
            <SoftButton
              component={Link}
              href="https://www.facebook.com/sharer/sharer.php?u=https://www.creative-tim.com/product/soft-ui-dashboard-react"
              target="_blank"
              rel="noreferrer"
              color="dark"
            >
              <FacebookIcon />
              &nbsp; Share
            </SoftButton>
          </SoftBox>
        </SoftBox> */}
      </SoftBox>
    </ConfiguratorRoot >
  );
}

export default Configurator;
