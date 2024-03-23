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

function BuyPCU() {
  const [numPCUs, setNumPCUs] = useState(0);
  const purchase = () => {
    const host = "http://" + config.ip_addresses.web_backend_server + ":8080";
    axios.post(host + "/buy-pcu", {pcu_bought: numPCUs},{headers: {
      authorization: "Basic " + Cookies.get("token")
    }
    })
    .then(response => {
      alert("Purchase Successful");
    })
    .catch(error => {
      alert(error);
  })
  }
  return (
    <Card sx={{ flexGrow: 1 }}>
      <SoftBox pt={2} px={2} display="flex" justifyContent="space-between" alignItems="center">
        <SoftTypography variant="h6" fontWeight="medium">
          Buy PCUs
        </SoftTypography>
      </SoftBox>
      <SoftBox p={4} display="flex" aligntItems="center">
        <SoftInput value={numPCUs} onChange={(e) => {setNumPCUs(e.target.value)}}>
        </SoftInput>
        <SoftButton variant="gradient" color="dark" onClick={purchase}>
          Buy PCUs
        </SoftButton>
      </SoftBox>
    </Card>
  );
}

export default BuyPCU;
