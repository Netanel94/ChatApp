import { Alert, Box, Button, Input, Paper, Snackbar } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { Typography } from "@mui/material";
import { useState } from "react";
import apiRequest from "../Api/apiRequest.";
import { useDispatch } from "react-redux";

import { useUserStore } from "../../zustand_Store/store";

interface User {
  username: string;
  password: string;
}

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { setUser, setLoading, setError, loading } = useUserStore();

  // const dispatch = useDispatch();

  const checkUser = async () => {
    // dispatch({ type: "Login" });
    setLoading(true);
    const user: User = { username: username, password: password };
    const res = await apiRequest.post("/users/login", user);
    if (res.data === "Not Allowed") {
      // dispatch({ type: "LOGIN_FAIL", payload: res.data });
      setErrorMessage("Wrong username or password please try again");
      setError("Wrong username or password");
      setOpen(true);
      return;
    } else {
      setUser(res.data._doc);
      // dispatch({ type: "LOGIN_SUCCESS", payload: res.data._doc });
      setTimeout(() => {
        navigate("/main");
      }, 100);
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
          height: "350px",
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
          <h3>Sign In</h3>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", px: 2 }}>
          <Input
            placeholder="Username"
            disableUnderline
            onChange={(e) => {
              setUsername(e.target.value);
            }}
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
            onChange={(e) => {
              setPassword(e.target.value);
            }}
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
              mb: 2,
            }}
          >
            <Typography sx={{ fontSize: 12 }}>
              Don't have an account?
            </Typography>
            <Link to={"/register"}>Create Account</Link>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              //   border: "1px solid black",
            }}
          >
            <Button
              onClick={checkUser}
              sx={{
                color: "white",
                mb: 2,
                backgroundColor: "rgb(106, 219, 130)",
                borderRadius: "25px",
                padding: "8px 20px",
                fontSize: "10px",
                height: "35px",
                width: "1500px",
                "&:before": { display: "none" },
                "&:after": { display: "none" },
              }}
            >
              SIGN IN
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

export default Login;
