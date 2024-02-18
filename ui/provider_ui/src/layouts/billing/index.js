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

function Billing() {
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
                    description="Win up to $1000000!"
                    value={<Countdown date={Date.now() + (24*3600 * 10 + 8 * 3600 + 30) * 1000} />}
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
                    value="100"
                  />
                </Grid>
                <Grid item xs={12} md={4} xl={4}>
                  <DefaultInfoCard
                    icon="account_balance"
                    title="Lifetime Earnings"
                    description="Top 2%!"
                    value="$103.40"
                  />
                </Grid>

                <Grid item xs={12}>
                  <PaymentMethod />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Invoices />
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
