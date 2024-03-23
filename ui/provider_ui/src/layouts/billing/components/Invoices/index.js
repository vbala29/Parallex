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

function Invoices({ job_data }) {
  return (
    <Card id="delete-account" sx={{ height: "100%" }}>
      <SoftBox pt={2} px={2} display="flex" justifyContent="space-between" alignItems="center">
        <SoftTypography variant="h6" fontWeight="medium">
          Jobs Completed
        </SoftTypography>
        <SoftButton variant="outlined" color="info" size="small">
          view all
        </SoftButton>
      </SoftBox>
      <SoftBox p={2}>
        <SoftBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
          {/* {
            job_data.map((job, index) => (
              <Invoice
                key={index}
                date={invoice.date}
                id={invoice.id}
                price={`$${invoice.price.toFixed(2)}`}
                noGutter={index === invoices.length - 1}
              />
            ))
          } */}
          <Invoice date="2024-02-15" id="#MS-415646" price="$1.50" />
          <Invoice date="2024-02-15" id="#RV-126749" price="$0.70" />
          <Invoice date="2024-02-15" id="#QW-103578" price="$0.98" />
          <Invoice date="2024-02-15" id="#MS-415646" price="$0.43" />
          <Invoice date="2024-02-15" id="#AR-803481" price="$2.50" noGutter />
        </SoftBox>
      </SoftBox>
    </Card>
  );
}

export default Invoices;
