import React from 'react'
import DashboardLayout from '../layout/DashboardLayout'
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from '../pages/Dashboard';
import MemberDossierForm from '../pages/MemberDossierForm';
import MissingMembersTable from '../pages/MamberReport/Report';
import FestivalGreetingPage from '../pages/Greeting'
import MemberDetails from '../pages/MamberReport/MemberDetails';
import MemberPDF from '../components/MemberPDF';
import GuarantorPage from '../pages/Guarantor/Guarantor';
import MemberDetailsPage from '../pages/MemberDetail';
import GuarantorList from '../pages/GuarantorList/GuarantorList.jsx'

const MainRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/society" element={<MemberDossierForm />} />
        <Route path="/report" element={<MissingMembersTable />} />
        <Route path="/greeting" element={<FestivalGreetingPage />} />
        <Route path="/member-details/:id" element={<MemberDetails />} />
        <Route path="/member-pdf/:id" element={<MemberPDF />} />
        <Route path="/guarantor" element={<GuarantorPage />} />
        <Route path="/memberdetail" element={<MemberDetailsPage />} />
        <Route path="/guarantorList" element={<GuarantorList />} />
      </Route>
    </Routes>
  )
}

export default MainRoutes