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
import CardHeader from "@mui/material/CardHeader";
import Grid from "@mui/material/Grid";
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

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

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import Cookies from 'js-cookie';
import { CardContent } from "@mui/material";

function Submit() {
  const [cores, setCores] = useState(0);
  const [ram, setRam] = useState(0);
  const [status, setStatus] = useState("");
  const [myFiles, setMyFiles] = useState([]);
  const [jobName, setJobName] = useState("test");

  const onDrop = useCallback(acceptedFiles => {
    setMyFiles([...myFiles, ...acceptedFiles])
  }, [myFiles]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/zip': ['.zip']
    }, // Accept only image files, you can change this to whatever you need
    multiple: false, // Enable multiple file selection
    onDrop,
  });

  const acceptedFilesList = myFiles.map(file => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  const submitJobs = () => {
    try {
      const formData = new FormData();
      formData.append('name', jobName)
      formData.append('cpu_count', cores)
      formData.append('memory_count', ram)
      myFiles.map(file => (
        formData.append('file', file)
      ));
      axios.put('http://localhost:8080/create-job', formData, {
        headers:{
          authorization: "Basic " + Cookies.get("token")
        },
      })
      .then(response =>{
        console.log(response);
        setStatus("Job successfully submitted!");
        setMyFiles([]);
      })
      .catch(error =>{
        console.log(error);
        setStatus("Job failed to submit!");
        setMyFiles([]);
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
    width: '100%',
    height: '100%'
  };
  return (
    <DashboardLayout>
      <DashboardNavbar/>
      <SoftBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={8}>
            <Card style={{height:'100%'}}>
              <div style={{display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', padding:'5px', height:'100%'}}>
                <div {...getRootProps()} style={dropzoneStyles}>
                  <input {...getInputProps()} />
                  <LuUpload style={{ width: '200px', height: '250px' }}></LuUpload>
                  <p>Drag and drop some files here, or click to select files</p>
                </div>
                <ul>
                  {acceptedFilesList}
                </ul>
              </div>
            </Card>
          </Grid>
          <Grid item xs={3}>
            <Card style={{
                  padding: '10px', 
                  height: '100%'
                }} >
                <Box
                  component="form"
                  sx={{
                    '& > :not(style)': { m: 1 },
                  }}
                  noValidate
                  autoComplete="off"
                >
              <CardHeader title="Job Specifications"/>
                <TextField required  id="outlined-name" variant="outlined" label="Job Name" defaultValue="test" margin="normal" value={jobName} onChange={(e) => setJobName(e.target.value)}></TextField>  
                <div style={{height:"8px"}}></div>
                <TextField required  id="outlined-cores" variant="outlined" label="CPU Cores" defaultValue="0" margin="normal" value={cores} onChange={(e) => setCores(e.target.value)}></TextField>  
                <div style={{height:"8px"}}></div>
                <TextField required  id="outlined-ram" variant="outlined" label="MiB RAM" defaultValue="0" margin="normal" value={ram} onChange={(e) => setRam(e.target.value)}></TextField>
                <div style={{height:"6px"}}></div>
                <SoftTypography variant="body2">
                  Estimated Cost Per Hour: {ram * cores / 100}
                </SoftTypography>
              </Box>
            </Card> 
          </Grid>
        </Grid>
        <div style={{display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', padding:'5px', width:'90%', color:'green'}}>
          <SoftButton onClick={submitJobs} style={{'margin':'10px'}} size="large" color="gray">
              Submit Job
          </SoftButton>
          <SoftTypography>
            {status}
          </SoftTypography>
        </div>
      </SoftBox>
    </DashboardLayout>
  );
}

export default Submit;
