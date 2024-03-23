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
import Icon from "@mui/material/Icon";

// Soft UI Dashboard React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";

// Soft UI Dashboard React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MiniStatisticsCard from "examples/Cards/StatisticsCards/MiniStatisticsCard";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import GradientLineChart from "examples/Charts/LineCharts/GradientLineChart";

// Soft UI Dashboard React base styles
import typography from "assets/theme/base/typography";

// Dashboard layout components
import BuildByDevelopers from "layouts/dashboard/components/BuildByDevelopers";
import WorkWithTheRockets from "layouts/dashboard/components/WorkWithTheRockets";
import Projects from "layouts/dashboard/components/Projects";
import OrderOverview from "layouts/dashboard/components/OrderOverview";
import StartStop from "layouts/dashboard/components/StartStop";

// Data
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import gradientLineChartData from "layouts/dashboard/data/gradientLineChartData";

import DefaultInfoCard from "examples/Cards/InfoCards/DefaultInfoCard";


import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'


import { secondsToTime, pcuToDisplay } from "utils/format";
import { setPCUContributed, setProviderDuration, setReliabilityScore, selectPCUContributed, selectProviderDuration, selectReliability, incrementProviderDuration } from "layouts/dashboard/metricsState";
import { selectIsStarted } from "layouts/dashboard/components/StartStop/startState";
import axios from 'axios';
import Cookies from 'js-cookie';

import config from "../../config.json"
// ...




function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function setDashboardData(redux_dispatch, initial_fetch_done, data) {
  if (!initial_fetch_done) {
    // Only update the provider duration counter from remote on first fetch
    redux_dispatch(setProviderDuration(data.provider_duration));
  }
  redux_dispatch(setPCUContributed(data.pcu_contributed));
  redux_dispatch(setReliabilityScore(data.reliability_score));
}


function Dashboard() {
  const { size } = typography;
  const { chart, items } = reportsBarChartData;

  const lifetimePCU = useSelector(selectPCUContributed);
  const lifetimeProviderDuration = useSelector(selectProviderDuration);
  const reliability = useSelector(selectReliability);

  const isOnline = useSelector(selectIsStarted);
  const dispatch = useDispatch();
  const [initialFetchDone, setInitialFetchDone] = useState(false);


  useEffect(() => {
    const timeDelayMillisRemote = 5000
    const timeDelayMillisLocal = 1000
    const fetchAndUpdateData = async () => {

      const host = "http://" + config.ip_addresses.web_backend_server + ":8080";
      axios.get(host + "/provider/dashboard-info", {
        headers: {
          authorization: "Basic " + Cookies.get("token")
        }
      }).then(response => {
        console.log(response.data);
        setDashboardData(dispatch, initialFetchDone, response.data);
      }).catch(error => {
        console.log(error);
      })

      if (initialFetchDone) {
        // Update the provider duration from the local counter
        console.log('Updating provider duration to', lifetimeProviderDuration)
        axios.post(host + "/provider/update-duration", {
          'provider_duration': lifetimeProviderDuration
        }, {
          headers: {
            'Authorization': "Basic " + Cookies.get("token"),
            'Content-Type': 'application/json'
          }
        }).then(response => {
          console.log(response.data);
        }).catch(error => {
          console.log(error);
        })
      }

      if (!initialFetchDone) {
        setInitialFetchDone(true);
      }

    };
    fetchAndUpdateData();
    const intervalIdRemote = setInterval(fetchAndUpdateData, timeDelayMillisRemote); // Refresh every 60 seconds


    const updateLocalCounter = async () => {
      if (isOnline) {
        dispatch(incrementProviderDuration(Math.round(timeDelayMillisLocal / 1000.0)));
      }
    }
    const intervalIdLocal = setInterval(updateLocalCounter, timeDelayMillisLocal)

    // Clean up function
    return () => { clearInterval(intervalIdRemote); clearInterval(intervalIdLocal) }
  }, [isOnline, initialFetchDone, incrementProviderDuration, lifetimeProviderDuration]); // Empty dependency array means this effect runs once on mount and clean up on unmount

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox py={3}>
        <SoftBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} xl={3}>
              <MiniStatisticsCard
                title={{ text: "PCU Contributed" }}
                count={pcuToDisplay(lifetimePCU)}
                icon={{ color: "info", component: "memory" }}
              />
            </Grid>
            <Grid item xs={12} sm={6} xl={3}>
              <MiniStatisticsCard
                title={{ text: "Provider Duration" }}
                count={secondsToTime(lifetimeProviderDuration)}
                icon={{ color: "info", component: "access_time" }}
              />
            </Grid>
            <Grid item xs={12} sm={6} xl={3}>
              <MiniStatisticsCard
                title={{ text: "Reliability Score" }}
                count={`${reliability.toFixed(1)}/5.0`}
                icon={{ color: "info", component: "gpp_good" }}
              />
            </Grid>
          </Grid>
        </SoftBox>
        <SoftBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={7}>
              <BuildByDevelopers />
            </Grid>
            {/* <Grid item xs={12} lg={5}>
              <WorkWithTheRockets />
            </Grid> */}
          </Grid>
        </SoftBox>
        {/* <SoftBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={5}>
              <ReportsBarChart
                title="active users"
                description={
                  <>
                    (<strong>+23%</strong>) than last week
                  </>
                }
                chart={chart}
                items={items}
              />
            </Grid>
            <Grid item xs={12} lg={7}>
              <GradientLineChart
                title="Sales Overview"
                description={
                  <SoftBox display="flex" alignItems="center">
                    <SoftBox fontSize={size.lg} color="success" mb={0.3} mr={0.5} lineHeight={0}>
                      <Icon className="font-bold">arrow_upward</Icon>
                    </SoftBox>
                    <SoftTypography variant="button" color="text" fontWeight="medium">
                      4% more{" "}
                      <SoftTypography variant="button" color="text" fontWeight="regular">
                        in 2021
                      </SoftTypography>
                    </SoftTypography>
                  </SoftBox>
                }
                height="20.25rem"
                chart={gradientLineChartData}
              />
            </Grid>
          </Grid>
        </SoftBox> */}


        {/* <Grid item xs={12} md={6} lg={4}>
            <OrderOverview />
          </Grid> */}
      </SoftBox>
      <Footer />
    </DashboardLayout >
  );
}

export default Dashboard;
