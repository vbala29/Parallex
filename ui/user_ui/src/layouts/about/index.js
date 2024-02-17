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
import axios from "axios";
// Icons
import { LuUpload } from "react-icons/lu";

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

import logo from 'assets/images/logo-ct.png';

import Cookies from 'js-cookie';

function About() {

  return (
    <DashboardLayout>
      <DashboardNavbar/>
      <div style={{display:"flex", justifyContent:"center", alignItems:"center", flexDirection:"column"}}>
      <SoftBox component="img" src={logo}>
      </SoftBox>
      <SoftTypography fontWeight="bold" >
        Parallex
      </SoftTypography>
      <SoftTypography >
        Providing Parallel Computing for All.
      </SoftTypography>
      </div>
    </DashboardLayout>
  );
}

export default About;
