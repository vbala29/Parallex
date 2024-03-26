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

import { useState, useEffect } from "react";

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Link } from "@mui/material";

// Soft UI Dashboard React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";

// Soft UI Dashboard Materail-UI example components
import Table from "examples/Tables/Table";

// Data
import data from "layouts/dashboard/components/Jobs/data";

import axios from 'axios';

import Cookies from 'js-cookie';

import { FaCheckCircle } from "react-icons/fa";
import { LuClock3 } from "react-icons/lu";
import { green } from "@mui/material/colors";

import config from "../../../../config.json"

function Jobs() {
  const { columns } = data();
  const [menu, setMenu] = useState(null);

  const openMenu = ({ currentTarget }) => setMenu(currentTarget);
  const closeMenu = () => setMenu(null);
  const [rows, setRows] = useState([]);

  const updateJobs = () => {
    const host = "http://" + config.ip_addresses.web_backend_server + ":8080";
    axios.get(host + "/job-list", {headers: {
      authorization: "Basic " + Cookies.get("token")
    }})
    .then(response => {
      console.log(response)
      const jobs_list = response.data.jobs_created;
      const new_jobs = jobs_list.map((job) => {
        const job_obj = {
          job: <Link href={job.url}>{job.name}</Link>,
          'status' : job.termination_time ? (<div style={{color: "green"}}><FaCheckCircle/> Done</div>) : (<div style={{color: "orange"}}><LuClock3/> Running</div>),
          'start time': new Date(job.creation_time).toLocaleString(),
          'end time' : job.termination_time ? new Date(job.termination_time).toLocaleString() : null,
          'cost' : job.job_cost + " USD"
        }
        return job_obj;
      });
      setRows(new_jobs);
    })
    .catch( error => {
      console.log(error)
    });

    setTimeout(() => {
      updateJobs();
    }, 3000);
  }

  useEffect (() => {
    updateJobs();
  }, []);

  return (
    <Card>
      <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
        <SoftBox>
          <SoftTypography variant="h6" gutterBottom>
            Jobs
          </SoftTypography>
        </SoftBox>
      </SoftBox>
      <SoftBox
        sx={{
          "& .MuiTableRow-root:not(:last-child)": {
            "& td": {
              borderBottom: ({ borders: { borderWidth, borderColor } }) =>
                `${borderWidth[1]} solid ${borderColor}`,
            },
          },
        }}
      >
        {/* we will need some sort of backend call here to get the columns and rows */}
        <Table columns={columns} rows={rows} /> 
      </SoftBox>
    </Card>
  );
}

export default Jobs;
