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

import RealEstateAgentIcon from "@mui/icons-material/RealEstateAgent";
import PeopleIcon from "@mui/icons-material/People";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupsIcon from "@mui/icons-material/Groups";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";

// ------------------ SAMPLE DATA ------------------
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
    <Box sx={{ p: 3, background: "#F7F9FF", minHeight: "100vh" }}>

        {/* ---------------- SECTION TITLE STRIP ---------------- */}
        <Box
            sx={{
                background: "linear-gradient(100deg, #1A237E, #1976D2)",
                p: 2,
                borderRadius: 3,
                mb: 4,
                boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
            }}
        >
            <Typography
                variant="h5"
                sx={{
                    color: "#fff",
                    fontWeight: 700,
                    letterSpacing: "0.5px"
                }}
            >
                Dashboard Overview
            </Typography>
        </Box>

        {/* ---------------- STAT CARDS ---------------- */}
        <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 3 }}>
                <StatCard
                    label="Total Members"
                    value="20"
                    icon={<PeopleIcon sx={{ color: "#1A237E", fontSize: 40 }} />} // Dark blue icon
                    color="#E3F2FD" // Light background
                />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
                <StatCard
                    label="Members Joined in Last 30 Days"
                    value="15"
                    icon={<PersonAddIcon sx={{ color: "#388E3C", fontSize: 40 }} />} // Dark green icon
                    color="#C8E6C9" // Light green background
                />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
                <StatCard
                    label="Active Members"
                    value="18"
                    icon={<GroupsIcon sx={{ color: "#F57C00", fontSize: 40 }} />} // Orange icon
                    color="#FFF3E0" // Light orange background
                />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
                <StatCard
                    label="Inactive Member"
                    value="3"
                    icon={<PendingActionsIcon sx={{ color: "#D32F2F", fontSize: 40 }} />} // Red icon
                    color="#FFEBEE" // Light red background
                />
            </Grid>
        </Grid>


        {/* ---------------- CHART SECTION 1 ---------------- */}
        <Box
            mt={4}
            component={Paper}
            elevation={0}
            sx={{
                p: 3,
                borderRadius: 3,
                background: "#FFFFFF",
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                borderTop: "4px solid #1A237E",
            }}
        >
            <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mb: 2, color: "#1A237E" }}
            >
                Income vs Expense Overview
            </Typography>

            <ResponsiveContainer width="100%" height={320}>
                <BarChart data={incomeExpenseData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip contentStyle={{
                        borderRadius: 8,
                        borderColor: "#e0e0e0",
                        background: "#fff"
                    }} />
                    <Legend />

                    <Bar dataKey="income" fill="#1976D2" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="expense" fill="#4FC3F7" radius={[6, 6, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </Box>

        {/* ---------------- CHART SECTION 2 ---------------- */}
        {/* <Box
            mt={4}
            component={Paper}
            elevation={0}
            sx={{
                p: 3,
                borderRadius: 3,
                background: "#FFFFFF",
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                borderTop: "4px solid #1976D2",
            }}
        >
            <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mb: 2, color: "#1A237E" }}
            >
                Loan Growth Trend
            </Typography>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={loanGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip contentStyle={{
                        borderRadius: 10,
                        background: "#fff",
                        borderColor: "#ddd"
                    }} />

                    <Line
                        type="monotone"
                        dataKey="loans"
                        stroke="#D32F2F"
                        strokeWidth={3}
                        dot={{ r: 6, fill: "#D32F2F" }}
                        activeDot={{ r: 8 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </Box> */}

    </Box>
);

export default Dashboard;
