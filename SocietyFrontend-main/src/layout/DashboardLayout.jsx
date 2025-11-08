import React from "react";
import { Box } from "@mui/material";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => (
  <Box sx={{ display: "flex", bgcolor: "#f4f6f8" }}>
    <Sidebar />
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Header />
      <Outlet />
    </Box>
  </Box>
);

export default DashboardLayout;
