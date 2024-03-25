import { useEffect, useState } from 'react';
import { Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import axios from "axios";
import PropTypes from 'prop-types';
  
import { selectToken, setToken } from "utils/authState";
import { useSelector, useDispatch } from 'react-redux'

import config from "../config.json"

const PrivateRoutes = () => {
  const { pathname } = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = useSelector(selectToken);


  useEffect(() => {
    const fetchData = async () => {
      if (pathname !== "/authentication/sign-in" && pathname !== "/authentication/sign-up") {
        console.log('trying to authorize')
        const host = "http://" + config.ip_addresses.web_backend_server + ":8080";
        try {
          const response = await axios.get(host + "/authorize", {
            headers: {
              authorization: "Basic " + token
            }
          });
          setIsAuthenticated(response.status === 200);
          console.log('is authenticated', isAuthenticated);
        } catch(err) {
          console.log(err);
          console.log("is not authenticated")
          setIsAuthenticated(false);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [pathname]);

  if (loading) {
    return null; // Or your own loading component
  }

  console.log('is authenticated', isAuthenticated)
  console.log('hit children return path')
  return isAuthenticated ? <Outlet /> : <Navigate to="/authentication/sign-in" replace state={{from: pathname}} />;
}

export default PrivateRoutes;