import * as XLSX from "xlsx";

export const generateMembersExcel = (members) => {
    if (!members || members.length === 0) return;

    const data = members.map((m, index) => {
        const memberTitle = m?.personalDetails?.title || "";
        const memberName = m?.personalDetails?.nameOfMember || "";
        const fullMemberName = `${memberTitle} ${memberName}`.trim() || "—";

        const fatherTitle = m?.personalDetails?.fatherTitle || "";
        const fatherName = m?.personalDetails?.nameOfFather || "";
        const fullFatherName = `${fatherTitle} ${fatherName}`.trim() || "—";

        return {
            "S.No": index + 1,
            "Member No": m?.personalDetails?.membershipNumber || "—",
            "Member Name": fullMemberName,
            "Father Name": fullFatherName,
            "Mobile No": m?.personalDetails?.phoneNo1 || "—",
            "Email": m?.personalDetails?.emailId1 || "—",
            "Introduced By": m?.nomineeDetails?.introduceBy || "—",
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Members List");

    XLSX.writeFile(workbook, "Members_List.xlsx");
};
