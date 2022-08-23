import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack} from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import "./Header.css";
import { useHistory} from "react-router-dom";

const Header = ({children, hasHiddenAuthButtons }) => {
  const history = useHistory();

  const Logout = () =>{
    window.location.reload(); 
    localStorage.clear();
      
  }

    return (
      <Box className="header">
        <Box className="header-title">
            <img src="logo_light.svg" alt="QKart-icon"></img>
        </Box>
        {children && (
        <Box>{children}</Box>
        ) 
        }        
          {hasHiddenAuthButtons?
            (
              <Button
              className="explore-button"
              startIcon={<ArrowBackIcon />}
              variant="text"onClick={() => history.push("/")}
            >
              Back to explore
            </Button>
            ):localStorage.getItem('username')?       
            (
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar alt={localStorage.getItem('username')} src="avatar.png" ></Avatar>
                <span>{localStorage.getItem('username')}</span>
                <Button onClick={Logout}>LOGOUT</Button>
              </Stack>
            ):(
              <Box>
                <Button onClick={() => history.push("/login", { from: "register" })}>Login</Button>
                <Button variant="contained" onClick={() => history.push("/register", { from: "login" })}>Register</Button>
              </Box>
            )
          }
      </Box>
    );
};

export default Header;
