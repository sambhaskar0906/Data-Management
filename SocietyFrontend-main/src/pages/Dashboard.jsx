import React from "react";
import { Box, Grid, Typography, Paper } from "@mui/material";
import StatCard from "../components/StatCard";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import RealEstateAgentIcon from '@mui/icons-material/RealEstateAgent';
import PeopleIcon from "@mui/icons-material/People";
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import WorkIcon from "@mui/icons-material/Work";

const data = [
    { month: "Feb", income: 15500, expense: 12300 },
    { month: "Mar", income: 18400, expense: 12000 },
    { month: "Apr", income: 20000, expense: 11000 },
    { month: "Jul", income: 68500, expense: 25000 },
];

const Dashboard = () => (
    <Box sx={{ p: 3 }}>
        <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
                <StatCard label="Total Member" value="20" color="#E3F2FD" icon={<PeopleIcon />} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
                <StatCard label="Total Loans" value="59" color="#FFF3E0" icon={<RealEstateAgentIcon />} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
                <StatCard label="Total Loan Amount" value="5,60000 L" color="#FFEBEE" icon={<CurrencyRupeeIcon />} />
            </Grid>
        </Grid>

        <Box mt={3} component={Paper} p={2} borderRadius={2}>
            <Typography variant="h6" fontWeight="bold">
                Total Income - Expense
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="income" fill="#1976d2" />
                    <Bar dataKey="expense" fill="#4caf50" />
                </BarChart>
            </ResponsiveContainer>
        </Box>
    </Box>
);

export default Dashboard;
