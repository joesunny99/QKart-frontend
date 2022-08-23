import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState,useEffect } from "react";
import { useHistory, Link } from "react-router-dom";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Register.css";

const Register = () => {
  const { enqueueSnackbar } = useSnackbar();
  let [formData,setFormData] = useState({username:"", password:"", confirmPassword:""});
  let [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

  /**
   * Definition for register handler
   * - Function to be called when the user clicks on the register button or submits the register form
   *
   * @param {{ username: string, password: string, confirmPassword: string }} formData
   *  Object with values of username, password and confirm password user entered to register
   *
   * API endpoint - "POST /auth/register"
   *
   * Example for successful response from backend for the API call:
   * HTTP 201
   * {
   *      "success": true,
   * }
   *
   * Example for failed response from backend for the API call:
   * HTTP 400
   * {
   *      "success": false,
   *      "message": "Username is already taken"
   * }
   */
  const register = async (event, formData) => {
    event.preventDefault();   
    if(validateInput(formData)) {
      setIsLoading(true);
      let {confirmPassword, ...userData} = formData;

    
      try {      
      const response = await axios.post(config.endpoint+"/auth/register", userData);     
      if(response.status == 201)  
        enqueueSnackbar('Registered successfully',{variant: 'success'});
        history.push("/login", { from: "register" })
        
      } catch (error) {
        if(error.response.status>399 && error.response.status<500){
          enqueueSnackbar(error.response.data.message);
      }
        else
          enqueueSnackbar("Something went wrong. Check that the backend is running, reachable and returns valid JSON.")
      }
      setIsLoading(false);
    
    }

  };

  /**
   * Validate the input values so that any bad or illegal values are not passed to the backend.
   *
   * @param {{ username: string, password: string, confirmPassword: string }} data
   *  Object with values of username, password and confirm password user entered to register
   *
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * Return false if any validation condition fails, otherwise return true.
   * (NOTE: The error messages to be shown for each of these cases, are given with them)
   * -    Check that username field is not an empty value - "Username is a required field"
   * -    Check that username field is not less than 6 characters in length - "Username must be at least 6 characters"
   * -    Check that password field is not an empty value - "Password is a required field"
   * -    Check that password field is not less than 6 characters in length - "Password must be at least 6 characters"
   * -    Check that confirmPassword field has the same value as password field - Passwords do not match
   */
  const validateInput = (data) => {
    if(!data.username)
      enqueueSnackbar("Username is a required field", {variant: 'error'});
    else if(data.username.length<6)
      enqueueSnackbar("Username must be at least 6 characters", {variant: 'error'});
    else if(!data.password)
      enqueueSnackbar("Password is a required field", {variant: 'error'});
    else if(data.password.length<6)
      enqueueSnackbar("Password must be at least 6 characters", {variant: 'error'});
    else if(data.password.length !== data.confirmPassword.length)
      enqueueSnackbar("Passwords do not match", {variant: 'error'});
    else
      return true;
  return false;
  };

  useEffect(() => {
    console.log(formData);
  });

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons />
      <Box className="content">
        <Stack spacing={2} className="form">
          <h2 className="title">Register</h2>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            placeholder="Enter Username"
            value = {formData.username}
            onChange ={e=>setFormData({...formData, [e.target.name]: e.target.value})}
            fullWidth
          />
          <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            helperText="Password must be atleast 6 characters length"
            fullWidth
            placeholder="Enter a password with minimum 6 characters"
            value = {formData.password}
            onChange ={e=>setFormData({...formData, [e.target.name]: e.target.value})}
          />
          <TextField
            id="confirmPassword"
            variant="outlined"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
            value = {formData.confirmPassword}
            onChange ={async(e)=>setFormData({...formData, [e.target.name]: e.target.value})}
          />
          
           {
             isLoading? (          
                <Box display="flex"
                  justifyContent="center"
                  alignItems="center">
                  <CircularProgress/>
                </Box>                         
             ):(
              <Button className="button" variant="contained" onClick={e=>register(e, formData)}>
                Register Now
              </Button>
             )
           }
          <p className="secondary-action">
            Already have an account?{" "}
             <Link to="/login" className="link">
              Login here
             </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Register;
