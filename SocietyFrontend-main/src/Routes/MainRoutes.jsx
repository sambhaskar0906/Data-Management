// MainRoutes.jsx - Sirf do naye routes add karein
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
import MemberDetailsPage from '../pages/Member/MemberDetail.jsx';
import GuarantorList from '../pages/GuarantorList/GuarantorList.jsx'
import MemberViewPage from '../pages/Member/MemberView.jsx';
import MemberEditPage from '../pages/Member/MemberEdit.jsx';
import NoticePage from '../pages/Notice/Notice.jsx'
import Login from "../components/Login.jsx";
import LoanForm from '../pages/Loan/LoanForm.jsx';
import PDCDetails from '../pages/Loan/PdcDetail.jsx';
import LoanView from '../pages/Loan/LoanView.jsx';
import LoanCreationWizard from '../pages/Loan/LoanCreationWizard.jsx';
import ExpPdf from '../pages/Exp/ExpPdf.jsx';
import SuretyReport from '../pages/SuretyReport/SuretyReport.jsx';


const MainRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/addmember" element={<MemberDossierForm />} />
        <Route path="/report" element={<MissingMembersTable />} />
        <Route path="/loan" element={<LoanCreationWizard />}></Route>
        <Route path="/pdc" element={<PDCDetails />}></Route>
        <Route path="/view-loan" element={<LoanView />}></Route>
        <Route path="/greeting" element={<FestivalGreetingPage />} />
        <Route path="/member-details/:id" element={<MemberDetails />} />
        <Route path="/member-pdf/:id" element={<MemberPDF />} />
        <Route path="/addguarantor" element={<GuarantorPage />} />
        <Route path="/memberdetail" element={<MemberDetailsPage />} />
        <Route path="/guarantorList" element={<GuarantorList />} />
        <Route path="/member/view/:id" element={<MemberViewPage />} />
        <Route path="/member/edit/:id" element={<MemberEditPage />} />
        <Route path="/notice" element={<NoticePage />} />
        <Route path="/exppdf/:membershipNumber" element={<ExpPdf />} />
        <Route path="/surety-report" element={<SuretyReport />} />
      </Route>
    </Routes>
  )
}

export default MainRoutes