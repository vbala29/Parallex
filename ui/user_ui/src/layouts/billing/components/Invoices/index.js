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

import config from "../../../../config.json";

function Invoices() {
  const [invoiceData, setInvoiceData] = useState([]);
  const getInvoiceData = () => {
    const host = "http://" + config.ip_addresses.web_backend_server + ":8080";
    axios.get(host + "/job-list", {headers: {
      authorization: "Basic " + Cookies.get("token")
    }})
      .then(response => {
        console.log(response)
        const jobs_list = response.data.jobs_created;
        const invoice_list = jobs_list.map((job) => {
          const invoice_obj = {
            job: job.name,
            end_time : job.termination_time ? new Date(job.termination_time).toLocaleString() : null,
            cost :job.job_cost
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
    if(invoice.end_time){
      return <Invoice date={invoice.end_time} id={invoice.job} price={invoice.cost} key={invoice.job}/>
    }
  })

  return (
    <Card p={2} id="delete-account" sx={{flexGrow:2, margin:"10px"}}>
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
