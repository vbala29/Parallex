/* eslint-disable react/prop-types */
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

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Dialog from "@mui/material/Dialog";
import { DialogTitle } from "@mui/material";
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

// Soft UI Dashboard React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";

import axios from 'axios';
import Cookies from 'js-cookie';
import { useState } from "react";

import config from "../../../../config.json"

function ConfirmPayment(props) {
  const { onClose, selectedValue, open, numPCUs } = props;

  const handleClose = () => {
    onClose();
  };

  const buy = () => {
    const host = "http://" + config.ip_addresses.web_backend_server + ":8080";
    axios.post(host + "/buy-pcu", {pcu_bought: parseInt(numPCUs)},{headers: {
      authorization: "Basic " + Cookies.get("token")
    }
    })
    .then(response => {
      onClose();
      alert("Purchase Successful");
    })
    .catch(error => {
      console.log(error);
   })
  }

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Confirm Payment</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Buy {numPCUs} PCUs for {1.23 * numPCUs}?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
          <Button onClick={handleClose}>Disagree</Button>
          <Button onClick={buy} autoFocus>
            Agree
          </Button>
        </DialogActions>
    </Dialog>
  );
}

ConfirmPayment.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  selectedValue: PropTypes.string.isRequired,
  numPCUs: PropTypes.number.isRequired
};

export default ConfirmPayment;