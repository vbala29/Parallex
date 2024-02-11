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
import Grid from "@mui/material/Grid";

// Soft UI Dashboard React components
import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton"
import SoftTypography from "components/SoftTypography";
import SoftInput from "components/SoftInput";

// Soft UI Dashboard React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Table from "examples/Tables/Table";

// Data
// import authorsTableData from "layouts/submit/data/authorsTableData";
// import projectsTableData from "layouts/tables/data/projectsTableData";

// Icons
import { LuUpload } from "react-icons/lu";

function Submit() {
  return (
    <DashboardLayout>
      <DashboardNavbar/>
      <SoftBox py={3}>
        <Grid container spacing={3}>
          <Grid item>
            <Card>
              Submit Jobs
              <LuUpload></LuUpload>
              <SoftButton>
                Upload
              </SoftButton>
            </Card>
          </Grid>
          <Grid item>
            <Card>
              Uploaded Files
            </Card>
          </Grid>
          <Grid item>
            <Card>
              CPU Cores
              <SoftInput></SoftInput>
              <br/>
              MiB RAM
              <SoftInput></SoftInput>
              <br/>
              Estimated Cost Per Hour
              <br/>
              Terminate Job after X Dollars
              <SoftInput></SoftInput>
            </Card>
          </Grid>
        </Grid>
        <SoftButton>
            Submit Job
        </SoftButton>
      </SoftBox>
    </DashboardLayout>
    // <DashboardLayout>
    //   <DashboardNavbar />
    //   <SoftBox py={3}>
    //     <SoftBox mb={3}>
    //       <Card>
    //         <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
    //           <SoftTypography variant="h6">Authors table</SoftTypography>
    //         </SoftBox>
    //         <SoftBox
    //           sx={{
    //             "& .MuiTableRow-root:not(:last-child)": {
    //               "& td": {
    //                 borderBottom: ({ borders: { borderWidth, borderColor } }) =>
    //                   `${borderWidth[1]} solid ${borderColor}`,
    //               },
    //             },
    //           }}
    //         >
    //           <Table columns={columns} rows={rows} />
    //         </SoftBox>
    //       </Card>
    //     </SoftBox>
    //     <Card>
    //       <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
    //         <SoftTypography variant="h6">Projects table</SoftTypography>
    //       </SoftBox>
    //       <SoftBox
    //         sx={{
    //           "& .MuiTableRow-root:not(:last-child)": {
    //             "& td": {
    //               borderBottom: ({ borders: { borderWidth, borderColor } }) =>
    //                 `${borderWidth[1]} solid ${borderColor}`,
    //             },
    //           },
    //         }}
    //       >
    //         <Table columns={prCols} rows={prRows} />
    //       </SoftBox>
    //     </Card>
    //   </SoftBox>
    //   <Footer />
    // </DashboardLayout>
  );
}

export default Submit;
