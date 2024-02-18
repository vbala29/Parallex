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
import { selectPCUContributed, selectProviderDuration, selectReliability, incrementProviderDuration } from "layouts/dashboard/metricsState";
import { selectIsStarted } from "layouts/dashboard/components/StartStop/startState";

// ...


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}



function Dashboard() {
  const { size } = typography;
  const { chart, items } = reportsBarChartData;

  const lifetimePCU = useSelector(selectPCUContributed);
  const lifetimeProviderDuration = useSelector(selectProviderDuration);
  const reliability = useSelector(selectReliability);

  const isOnline = useSelector(selectIsStarted);
  const dispatch = useDispatch();


  useEffect(() => {
    const timeDelayMillis = 1000
    const fetchData = async () => {
      console.log(`online: ${isOnline}`)

      // Replace with your actual API call
      // const response = await fetch('https://your-api-url.com');
      // const data = await response.json();

      // setLifetimePCU(142);
      // setLifetimeProviderDuration(8 * 3600 + 30 * 60 + 16);
      if (isOnline) {
        dispatch(incrementProviderDuration(Math.round(timeDelayMillis/1000.0)));
      }


    };

    fetchData();
    const intervalId = setInterval(fetchData, timeDelayMillis); // Refresh every 60 seconds

    // Clean up function
    return () => clearInterval(intervalId);
  }, [isOnline, incrementProviderDuration]); // Empty dependency array means this effect runs once on mount and clean up on unmount

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
