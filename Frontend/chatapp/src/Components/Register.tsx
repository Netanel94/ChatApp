import {
  Box,
  Input,
  Paper,
  Typography,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiRequest from "../Api/apiRequest.";
import { AxiosError } from "axios";

interface User {
  username: string;
  password: string;
}

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSumbit = async () => {
    const user: User = { username: username, password: password };
    if (username === "" || password === "") {
      setErrorMessage("Username and password cannot be empty");
      setOpen(true);
      return;
    }
    try {
      await apiRequest.post(`/users`, user);
      navigate("/");
    } catch (err: any) {
      setErrorMessage(err.response.data);
      setOpen(true);
    }
  };

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Typography sx={{ padding: "8px", color: "white" }} variant="h2">
        Chat App
      </Typography>
      <Paper
        elevation={4}
        sx={{
          display: "flex",
          flexDirection: "column",
          // border: "1px solid black",
          height: "300px",
          width: "350px",
          borderRadius: "10px",
        }}
      >
        <Box
          sx={{
            height: "60px",
            // border: "1px solid black",
            textAlign: "center",
            backgroundColor: "rgb(106, 219, 130)",
            mb: "30px",
            color: "white",
            borderRadius: "10px",
          }}
        >
          <h3>Create an Acoount</h3>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", px: 2 }}>
          <Input
            placeholder="Username"
            disableUnderline
            onChange={(e) => setUsername(e.target.value)}
            sx={{
              mb: 2,
              backgroundColor: "#f0f0f0",
              borderRadius: "25px",
              padding: "8px 20px",
              fontSize: "10px",
              height: "35px",
              "&:before": { display: "none" },
              "&:after": { display: "none" },
            }}
          ></Input>
          <Input
            placeholder="Password"
            disableUnderline
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            sx={{
              mb: 2,
              backgroundColor: "#f0f0f0",
              borderRadius: "25px",
              padding: "8px 20px",
              fontSize: "10px",
              height: "35px",
              "&:before": { display: "none" },
              "&:after": { display: "none" },
            }}
          ></Input>
          <Box
            sx={{
              fontSize: 12,
              mt: 2,
              display: "flex",
              justifyContent: "space-between",
              p: 0.5,
            }}
          ></Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              //   border: "1px solid black",
            }}
          >
            <Button
              onClick={handleSumbit}
              sx={{
                color: "white",
                mb: 2,
                backgroundColor: "rgb(106, 219, 130)",
                borderRadius: "30px",
                padding: "8px 20px",
                fontSize: "10px",
                height: "35px",
                width: "1500px",
                "&:before": { display: "none" },
                "&:after": { display: "none" },
              }}
            >
              Create
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
