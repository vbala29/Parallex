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

import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";

// Soft UI Dashboard React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";
import SoftInput from "components/SoftInput";

import axios from 'axios';
import Cookies from 'js-cookie';
import { useState } from "react";

import config from "../../../../config.json"

function BuyPCU(props) {
  const { open, numPCUs, setNumPCUs } = props;
  const purchase = () => {
    const host = "http://" + config.ip_addresses.web_backend_server + ":8080";
    // Round PCU buying to a whole number!
    axios.post(host + "/buy-pcu", {pcu_bought: parseInt(numPCUs)},{headers: {
      authorization: "Basic " + Cookies.get("token")
    }
    })
    .then(response => {
      alert("Purchase Successful");
    })
    .catch(error => {
      console.log(error);
  })
  }
  return (
    <Card p={2} sx={{flexGrow:1, margin:"10px"}}>
      <SoftBox pt={2} px={2} display="flex" justifyContent="space-between" alignItems="center">
        <SoftTypography variant="h6" fontWeight="medium">
          Buy PCUs
        </SoftTypography>
      </SoftBox>
      <SoftBox p={4} display="flex" aligntItems="center" justifyContent="space-between">
        <SoftInput value={numPCUs} sx={{margin:"10px"}} onChange={(e) => {setNumPCUs(e.target.value)}}>
        </SoftInput>
        <SoftButton variant="gradient" color="dark" onClick={open} sx={{margin:"10px"}}>
          Buy PCUs
        </SoftButton>
      </SoftBox>
    </Card>
  );
}

BuyPCU.propTypes = {
  open: PropTypes.func.isRequired,
  numPCUs: PropTypes.number.isRequired,
  setNumPCUs: PropTypes.func.isRequired
};

export default BuyPCU;
