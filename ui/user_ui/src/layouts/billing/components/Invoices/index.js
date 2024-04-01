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

// Billing page components
import Invoice from "layouts/billing/components/Invoice";
import { useEffect, useState } from "react";

import axios from 'axios';

import Cookies from 'js-cookie';

const { v4: uuidv4 } = require('uuid');

import config from "../../../../config.json";

function Invoices() {
  const [invoiceData, setInvoiceData] = useState([]);
  const getInvoiceData = () => {
    const host = "http://" + config.ip_addresses.web_backend_server + ":8080";
    axios.get(host + "/transaction-history", {headers: {
      authorization: "Basic " + Cookies.get("token")
    }})
      .then(response => {
        console.log(response)
        const transactions_list = response.data.pcu_transactions;
        const invoice_list = transactions_list.map((transaction) => {
          const uniqueID = uuidv4();
          const invoice_obj = {
            time: new Date(transaction.time).toLocaleString('en-US', {year : 'numeric', month : 'long', day: 'numeric'}),
            pcu_amount : transaction.pcu_amount,
            usd_cost : transaction.usd_cost,
            unique_id : uniqueID
          }
          return invoice_obj;
        });
        setInvoiceData(invoice_list.slice(0,6)); //slice array to just show first 6, can implement show all feature later
      })
      .catch(error => {
        console.log(error);
      })
  };
  useEffect(() => {
    setInterval(() => {
      getInvoiceData();
    }, 2000);
  },[]);

  const invoices_list = invoiceData.map((invoice) => {
    return <Invoice time={invoice.time} pcu_amount={invoice.pcu_amount} price={invoice.usd_cost.toFixed(2)} key={invoice.unique_id}/>
  })

  return (
    <Card p={2} id="delete-account" sx={{width:"300px", margin:"10px"}}>
      <SoftBox pt={2} px={2} display="flex" justifyContent="space-between" alignItems="center">
        <SoftTypography variant="h6" fontWeight="medium">
          Invoices
        </SoftTypography>
      </SoftBox>
      <SoftBox p={2}>
        <SoftBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
          {invoices_list}
        </SoftBox>
      </SoftBox>
    </Card>
  );
}

export default Invoices;
