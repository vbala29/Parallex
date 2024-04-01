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


// Soft UI Dashboard React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";

// Soft UI Dashboard React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import logo from 'assets/images/logo-ct.png';

import Footer from "examples/Footer";


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
        Accessible Computing for All
      </SoftTypography>
      </div>
    </DashboardLayout>
  );
}

export default About;
