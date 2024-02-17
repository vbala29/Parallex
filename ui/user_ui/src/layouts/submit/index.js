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

import Cookies from 'js-cookie';

function Submit() {
  const onDrop = useCallback((acceptedFiles) => {
    // Do something with the uploaded files
    console.log(acceptedFiles);
  }, []);

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/zip': ['.zip']
    }, // Accept only image files, you can change this to whatever you need
    multiple: true, // Enable multiple file selection
    directory: true, // Enable directory upload
    onDrop,
  });

  const acceptedFilesList = acceptedFiles.map(file => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  const submitJobs = () => {
    try {
      const formData = new FormData();
      formData.append('name', "test")
      formData.append('cpu_count', "3")
      formData.append('memory_count', "100")
      acceptedFiles.map(file => (
        formData.append('file', file)
      ));
      axios.put('http://localhost:8080/create-job', formData, {
        headers:{
          authorization: "Basic " + Cookies.get("token")
        },
      })
      .then(response =>{
        console.log(response);
      })
      .catch(error =>{
        console.log(error);
      })

    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }

  const dropzoneStyles = {
    border: '2px dashed #cccccc',
    borderRadius: '15px',
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer',
    width: '100%'
  };
  return (
    <DashboardLayout>
      <DashboardNavbar/>
      <SoftBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={8}>
            <Card>
            {/* <input type="file" id="filepicker" name="fileList" webkitdirectory="" multiple /> */}
              <div style={{display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', padding:'5px'}}>
              {/* <SoftTypography>
              Submit Jobs
              </SoftTypography> */}
                <div {...getRootProps()} style={dropzoneStyles}>
                  <input {...getInputProps()} />
                  <LuUpload style={{ width: '200px', height: '250px' }}></LuUpload>
                  <p>Drag and drop some files here, or click to select files</p>
                </div>
                <ul>
                  {acceptedFilesList}
                </ul>
              </div>
              {/* <SoftButton>
                Browse Files
              </SoftButton> */}
            </Card>
          </Grid>
          <Grid item xs={3}>
            <Card style={{
                  padding: '10px', 
                  'font-family': ["Roboto","Helvetica","Arial","sans-serif"],
                  "font-size": "1.25rem",
                  "font-weight": "400",
                  "line-height": "1.625",
                  "letter-spacing": "0.00938em",
                  height: '100%'
                }} >
              <SoftTypography>
                Job Specifications
              </SoftTypography>
              <p>
              CPU Cores
              </p>

              <SoftInput></SoftInput>
              <br/>
              MiB RAM
              <SoftInput></SoftInput>
              <br/>
              Estimated Cost Per Hour: 5 USD
              <br/>
            </Card> 
          </Grid>
        </Grid>
        <div style={{display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', padding:'5px', width:'90%'}}>
          <SoftButton onClick={submitJobs} style={{'margin':'10px'}} size="large" color="gray">
              Submit Job
          </SoftButton>
        </div>
      </SoftBox>
    </DashboardLayout>
  );
}

export default Submit;
