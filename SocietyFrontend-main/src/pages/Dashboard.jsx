import React from "react";
import { Box, Grid, Typography, Paper } from "@mui/material";
import StatCard from "../components/StatCard";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    CartesianGrid,
    LineChart,
    Line
} from "recharts";

import RealEstateAgentIcon from '@mui/icons-material/RealEstateAgent';
import PeopleIcon from "@mui/icons-material/People";
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";

const incomeExpenseData = [
    { month: "Feb", income: 15500, expense: 12300 },
    { month: "Mar", income: 18400, expense: 12000 },
    { month: "Apr", income: 20000, expense: 11000 },
    { month: "Jul", income: 68500, expense: 25000 },
];

const loanGrowthData = [
    { month: "Feb", loans: 10 },
    { month: "Mar", loans: 18 },
    { month: "Apr", loans: 25 },
    { month: "Jul", loans: 59 },
];

const Dashboard = () => (
    <Box sx={{ p: 3 }}>

        {/* ---------------- STAT CARDS ---------------- */}
        <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 3 }}>
                <StatCard
                    label="Total Members"
                    value="20"
                    icon={<PeopleIcon />}
                    color="#E8F0FE"
                />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
                <StatCard
                    label="Total Loans"
                    value="59"
                    icon={<RealEstateAgentIcon />}
                    color="#FFF4E5"
                />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
                <StatCard
                    label="Total Loan Amount"
                    value="₹5,60,000"
                    icon={<CurrencyRupeeIcon />}
                    color="#FDECEA"
                />
            </Grid>

            {/* ⭐ Newly Added Field */}
            <Grid size={{ xs: 12, md: 3 }}>
                <StatCard
                    label="Pending Loans"
                    value="12"
                    icon={<WorkHistoryIcon />}
                    color="#E8F5E9"
                />
            </Grid>
        </Grid>

        {/* ---------------- CHART SECTION 1 ---------------- */}
        <Box
            mt={4}
            component={Paper}
            elevation={1}
            sx={{
                p: 3,
                borderRadius: 3,
                background: "#ffffff",
                boxShadow: "0 3px 8px rgba(0,0,0,0.08)",
            }}
        >
            <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mb: 2, color: "#1a237e" }}
            >
                Income vs Expense Overview
            </Typography>

            <ResponsiveContainer width="100%" height={320}>
                <BarChart data={incomeExpenseData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip contentStyle={{ borderRadius: 10, borderColor: "#e0e0e0" }} />
                    <Legend />

                    <Bar dataKey="income" fill="#1976d2" radius={[5, 5, 0, 0]} />
                    <Bar dataKey="expense" fill="#4caf50" radius={[5, 5, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </Box>

        {/* ---------------- CHART SECTION 2 ---------------- */}
        <Box
            mt={4}
            component={Paper}
            elevation={1}
            sx={{
                p: 3,
                borderRadius: 3,
                background: "#ffffff",
                boxShadow: "0 3px 8px rgba(0,0,0,0.08)",
            }}
        >
            <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mb: 2, color: "#1a237e" }}
            >
                Loan Growth Trend
            </Typography>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={loanGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip contentStyle={{ borderRadius: 10, borderColor: "#e0e0e0" }} />

                    <Line
                        type="monotone"
                        dataKey="loans"
                        stroke="#ff5722"
                        strokeWidth={3}
                        dot={{ r: 5, fill: "#ff5722" }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </Box>

    </Box>
);

export default Dashboard;
