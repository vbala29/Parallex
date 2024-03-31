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
import React, { useState, useEffect } from 'react';

// Soft UI Dashboard React components
import SoftBox from "components/SoftBox";

// Soft UI Dashboard React components
import MasterCard from "examples/Cards/MasterCard";
import DefaultInfoCard from "examples/Cards/InfoCards/DefaultInfoCard";

// Soft UI Dashboard React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Billing page components
import PaymentMethod from "layouts/billing/components/PaymentMethod";
import Invoices from "layouts/billing/components/Invoices";
import BillingInformation from "layouts/billing/components/BillingInformation";
import Transactions from "layouts/billing/components/Transactions";

import Countdown from 'react-countdown';

import { selectToken, setToken } from "utils/authState";
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios';

import config from "../../config.json"

function Billing() {
  const [lotteryDate, setLotteryDate] = useState(Date.now() + (24 * 3600 * 10 + 8 * 3600 + 30) * 1000);
  const [lotteryAmount, setLotteryAmount] = useState(0);
  const [lotteryEntries, setLotteryEntries] = useState(0);
  const [lifetimeEarnings, setLifetimeEarnings] = useState(0);
  const [job_data, setJobData] = useState([]);
  const token = useSelector(selectToken);

  useEffect(() => {
    const fetchAndUpdateData = async () => {
      const host = "http://" + config.ip_addresses.web_backend_server + ":8080";
      axios.get(host + "/provider/rewards", {
        headers: {
          authorization: "Basic " + token
        }
      }).then(response => {
        console.log(response.data);
        setLotteryEntries(response.data.lottery_entries);
        setLifetimeEarnings(response.data.total_reward);
      }).catch(error => {
        console.log(error);
      })

      axios.get(host + "/provider/job-summary", {
        headers: {
          authorization: "Basic " + token
        }
      }).then(response => {
        console.log(response.data);
        setJobData(response.data);
      }).catch(error => {
        console.log(error);
      })
    }

    const host = "http://" + config.ip_addresses.web_backend_server + ":8080";
    axios.get(host + "/provider/lottery-info", {
      headers: {
        authorization: "Basic " + token
      }
    }).then(response => {
      console.log(response.data);
      setLotteryDate(response.data.unix_time);
      setLotteryAmount(response.data.prize)
    }).catch(error => {
      console.log(error);
    })

    fetchAndUpdateData();

    const interval = setInterval(fetchAndUpdateData, 5000); // 5000 milliseconds = 5 seconds

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, []); // Empty dependency array means this effect runs once on mount and cleanup on unmount

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox mt={4}>
        <SoftBox mb={1.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4} xl={4}>
                  <DefaultInfoCard
                    icon="hourglass_bottom"
                    title="Lottery Drawing"
                    description={`Win up to $${Math.round(lotteryAmount)}!`}
                    value={<Countdown date={lotteryDate} />}
                  >
                  </DefaultInfoCard>
                  {/* <Countdown date={Date.now() + 10000} /> */}
                  {/* <MasterCard number={4562112245947852} holder="jack peterson" expires="11/22" /> */}
                </Grid>
                <Grid item xs={12} md={4} xl={4}>
                  <DefaultInfoCard
                    icon="local_activity"
                    title="Lottery Entries"
                    description="90th Percentile"
                    value={`${Math.trunc(lotteryEntries)}`}
                  />
                </Grid>
                <Grid item xs={12} md={4} xl={4}>
                  <DefaultInfoCard
                    icon="account_balance"
                    title="Lifetime Earnings"
                    description="Top 2%!"
                    value={`$${(lifetimeEarnings).toFixed(2)}`}
                  />
                </Grid>

                <Grid item xs={12}>
                  <PaymentMethod />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Invoices job_data={job_data} />
            </Grid>
          </Grid>
        </SoftBox>
        <SoftBox my={3}>
          {/* <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <BillingInformation />
            </Grid>
            <Grid item xs={12} md={5}>
              <Transactions />
            </Grid>
          </Grid> */}
        </SoftBox>
      </SoftBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Billing;
