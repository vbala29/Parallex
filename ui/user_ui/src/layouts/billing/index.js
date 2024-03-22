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
import Grid from "@mui/material/Grid";

// Soft UI Dashboard React components
import SoftBox from "components/SoftBox";

// Soft UI Dashboard React components
import DefaultInfoCard from "examples/Cards/InfoCards/DefaultInfoCard";

// Soft UI Dashboard React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Billing page components
import PaymentMethod from "layouts/billing/components/PaymentMethod";
import Invoices from "layouts/billing/components/Invoices";
import BuyPCU from "./components/BuyPCU";

import {useEffect, useState} from 'react';

import axios from 'axios';

import Cookies from 'js-cookie';

import fs from 'fs';

function Billing() {
  const [availablePCUs, setAvailablePCUs] = useState(0);
  const getPCUs = () => {
    var config = JSON.parse(fs.readFileSync(__dirname + '/../../../config/config.json', 'utf8'));
    const host = config.ip_addresses.web_backend_server;
    axios.get(host + "/available-pcu-count", {headers: {
      authorization: "Basic " + Cookies.get("token")
    }})
      .then(response => {
        setAvailablePCUs(response.data.available_pcu_count)
      })
      .catch(error => {
        alert(error);
      })
  }
  useEffect(() => {
    getPCUs();
  },[]);
  return (
    <DashboardLayout>
      <DashboardNavbar />
        <SoftBox display="flex" flex-direction="row">
          <PaymentMethod/>
          <Invoices />
        </SoftBox>
        <SoftBox display="flex" flex-direction="row">
          <DefaultInfoCard
            icon="account_balance"
            title="PCUs"
            value={availablePCUs}
          />
          <BuyPCU/>
        </SoftBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Billing;
