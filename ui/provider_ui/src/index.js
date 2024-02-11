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
/* eslint-disable react/prop-types */ //

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "App";
import AlertTemplate from 'react-alert-template-basic'
import { transitions, positions, Provider as AlertProvider } from 'react-alert'
import SoftAlert from "components/SoftAlert";

// optional configuration
const options = {
  // you can also just use 'bottom center'
  position: positions.BOTTOM_RIGHT,
  timeout: 5000,
  offset: '30px',
  // you can also just use 'scale'
  transition: transitions.FADE
}

// function optionsMap(options) {
//   if (options.type === 'info') {
//     return 'info';
//   } else if (options.type === 'success') {
//     return 'success';
//   }
// }

// const AlertTemplate = ({ style, options, message, close }) => (
//   <div style={style}>
//     <SoftAlert
//       color={options.type}
//       dismissible={true}
//     >
//       {message}
//     </SoftAlert >
//   </div>
// )

//TODO implement custom `AlertTemplate` using SoftAlert...



import { SoftUIControllerProvider } from "context";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <SoftUIControllerProvider>
      <AlertProvider template={AlertTemplate} {...options}>
        <App />
      </AlertProvider>
    </SoftUIControllerProvider>
  </BrowserRouter>
);
