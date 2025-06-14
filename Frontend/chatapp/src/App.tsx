import { useState } from "react";
import Login from "./Components/Login";
import { Route, Routes } from "react-router-dom";
import Main from "./Components/mainPage/Main";
import { Box } from "@mui/material";
import Register from "./Components/Register";

function App() {
  return (
    <Box sx={{ width: "100%", height: "100%", bgcolor: "grey.900" }}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/main" element={<Main />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Box>
  );
}

export default App;
