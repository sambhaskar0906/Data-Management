import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getGuarantorRelationsByMember } from "../../features/loan/loanSlice";

const ExpPdf = () => {
  const dispatch = useDispatch();
  const { membershipNumber } = useParams(); // Get membershipNumber from URL params

  const { guarantorRelations, guarantorLoading } = useSelector(
    (state) => state.loan
  );

  // 🔥 Fetch data from API using route parameter
  useEffect(() => {
    if (membershipNumber) {
      dispatch(getGuarantorRelationsByMember(membershipNumber));
    }
  }, [membershipNumber, dispatch]);

  // 📌 Show loader while fetching
  if (guarantorLoading) return <p>Loading...</p>;

  // 📌 If no data yet
  if (!guarantorRelations) return <p>No data found.</p>;

  // ===========================
  // 🔥 Extract Data From API
  // ===========================
  const memberInfo = guarantorRelations.member;
  const suretyGiven = guarantorRelations.forWhomIAmGuarantor;
  const suretyTaken = guarantorRelations.myGuarantors;

  // Initial state with all the data
  const reportData = {
    societyInfo: {
      name: "C.A. CO-OPERATIVE THRIFT & CREDIT SOCIETY LTD.",
      address: "D-251/10, 2nd Floor, Laxmi Nagar, Delhi-110092",
      phone: "43710659",
    },

    reportInfo: {
      title: "Surety Given and Taken Report",
      date: `As on ${new Date().toLocaleDateString()}`,
    },

    memberInfo: {
      accountNo: memberInfo.membershipNumber,
      name: memberInfo.name,
      address: memberInfo.address || "N/A",
      mobileNo: memberInfo.phoneNo || "N/A",
    },

    suretyGiven: suretyGiven?.map((item) => ({
      actType: "Loan",
      accountNo: item.membershipNumber,
      file: item.loanId,
      acName: `${item.name} ${item.mobileNumber}`,
      principal: item.amountOfLoan,
      loanDate: item.loanDate,
      prd: "",
      rate: "",
      balance: "",
      loanStatus: "",
    })),

    suretyTaken: suretyTaken?.map((item) => ({
      actType: "Loan",
      accountNo: item.membershipNumber,
      file: item.loanId,
      acName: `${item.name} ${item.mobileNumber}`,
      principal: item.amountOfLoan,
      loanDate: item.loanDate,
      prd: "",
      rate: "",
      balance: "",
      loanStatus: "",
    })),
  };

  const handleDownloadPdf = () => {
    const printWindow = window.open("", "_blank");

    // Generate table rows for Surety Given
    const suretyGivenRows = reportData.suretyGiven
      .map(
        (item) => `
      <tr>
        <td>${item.actType}</td>
        <td>${item.accountNo}</td>
        <td>${item.file}</td>
        <td>${item.acName}</td>
        <td>${item.principal}</td>
        <td>${item.loanDate}</td>
        <td>${item.prd}</td>
        <td>${item.rate}</td>
        <td>${item.balance}</td>
        <td>${item.loanStatus}</td>
      </tr>
    `
      )
      .join("");

    // Generate table rows for Surety Taken
    const suretyTakenRows = reportData.suretyTaken
      .map(
        (item) => `
      <tr>
        <td>${item.accountNo}</td>
        <td>${item.acName}</td>
        <td>${item.mobileNo}</td>
        <td>${item.surety}</td>
        <td>${item.amt}</td>
        <td>${item.loanDetails}</td>
        <td>${item.balance}</td>
        <td>${item.remarks}</td>
      </tr>
    `
      )
      .join("");

    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>SURETY GIVEN AND TAKEN</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0;
            padding: 20px;
            font-size: 15px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .society-info {
            font-weight: bold;
            margin-bottom: 10px;
          }
          .member-info {
            margin-bottom: 20px;
            line-height: 1.4;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 15px;
          }
          th, td {
            border: 1px solid #000;
            padding: 4px;
            text-align: left;
          }
          th {
            background-color: #f0f0f0;
            font-weight: bold;
          }
          .section-title {
            font-weight: bold;
            margin: 15px 0 10px 0;
            background-color: #e0e0e0;
            padding: 5px;
          }
          .page-info {
            text-align: center;
            margin-top: 20px;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="society-info">
            ${reportData.societyInfo.name}<br>
            ${reportData.societyInfo.address}<br>
            ${reportData.societyInfo.phone}
          </div>
          <div style="font-weight: bold; margin: 10px 0;">
            ${reportData.reportInfo.title} ${reportData.reportInfo.date}
          </div>
        </div>

        <div class="member-info">
          <strong>A/c.No. :</strong> ${reportData.memberInfo.accountNo}<br>
          <strong>A/c.Name :</strong> ${reportData.memberInfo.name}<br>
          <strong>Address :</strong> ${reportData.memberInfo.address}<br>
          <strong>Mobile No. :</strong> ${reportData.memberInfo.mobileNo}
        </div>

        <div class="section-title">MEMBER GIVEN THE SURETY FOR THE FOLLOWING ACCOUNTS</div>
        <table>
          <thead>
            <tr>
              <th>ActType</th>
              <th>A/c.No.</th>
              <th>File</th>
              <th>AcName</th>
              <th>Principal</th>
              <th>Loan Date</th>
              <th>PRD</th>
              <th>Rate</th>
              <th>Balance</th>
              <th>Loan Status</th>
            </tr>
          </thead>
          <tbody>
            ${suretyGivenRows}
          </tbody>
        </table>

        <div class="section-title">MEMBER TAKEN THE SURETY FROM THE FOLLOWING ACCOUNTS</div>
        <table>
          <thead>
            <tr>
              <th>A/c.No.</th>
              <th>A/c.Name</th>
              <th>Address</th>
              <th>Surety</th>
              <th>Amt</th>
              <th>Loan Details</th>
              <th>Balance</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${suretyTakenRows}
          </tbody>
        </table>

        <div class="page-info">
          Generated on: ${reportData.reportInfo.date}
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(pdfContent);
    printWindow.document.close();
  };

  return (
    <div>
      <button
        onClick={handleDownloadPdf}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        Download PDF
      </button>
    </div>
  );
};

export default ExpPdf;