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

import styled from "styled-components"

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
import Jobs from "layouts/dashboard/components/Jobs";
import OrderOverview from "layouts/dashboard/components/OrderOverview";

// Data
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import gradientLineChartData from "layouts/dashboard/data/gradientLineChartData";
import { useEffect, useState } from "react";
import axios from 'axios';
import Cookies from 'js-cookie';

import fs from 'fs';

function Dashboard() {
  // We want the dashboard to contain a chart of all jobs. Ongoing and finished?
  // We want the dashbaord to contain info on how much money has been spent?
  // Total number of jobs?

  const { size } = typography;
  const { chart, items } = reportsBarChartData;
  const [dashboardData, setDashboardData] = useState({});

  useEffect(() => {
    var config = JSON.parse(fs.readFileSync(__dirname + '/../../../config/config.json', 'utf8'));
    const host = config.ip_addresses.web_backend_server;
    axios.get(host + "/dashboard-info", {headers: {
      authorization: "Basic " + Cookies.get("token")
    }})
      .then(response => {
        setDashboardData(response.data);
        console.log(response.data);
      })
      .catch(error => {
        alert(error);
    })
  },[]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox py={3}>
        <SoftBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} xl={3}>
              <MiniStatisticsCard
                title={{ text: "Jobs Run This Month" }}
                count= {dashboardData.one_month_job_count ? dashboardData.one_month_job_count : 0}
                icon={{ color: "info", component: "paid" }}
              />
            </Grid>
            <Grid item xs={12} sm={6} xl={3}>
              <MiniStatisticsCard
                title={{ text: "Total Cost" }}
                count={dashboardData.total_cost ? "$" + dashboardData.total_cost :"$" +  0}
                icon={{ color: "info", component: "paid" }}
              />
            </Grid>
            <Grid item xs={12} sm={6} xl={3}>
              <MiniStatisticsCard
                title={{ text: "Average Job Duration" }}
                count={dashboardData.avg_duration ? dashboardData.avg_duration : 0 + " minutes"}
                icon={{ color: "info", component: "emoji_events" }}
              />
            </Grid>
            <Grid item xs={12} sm={6} xl={3}>
              <MiniStatisticsCard
                title={{ text: "Average Job Cost" }}
                count={dashboardData.avg_cost ? "$" +  dashboardData.avg_cost : "$" +  0}
                icon={{
                  color: "info",
                  component: "paid",
                }}
              />
            </Grid>
          </Grid>
        </SoftBox>
        <div>
          <Grid item xs={12} md={6} lg={8}>
            <Jobs />
          </Grid>
        </div>
      </SoftBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
