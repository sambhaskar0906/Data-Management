import * as XLSX from "xlsx";

export const generateMembersExcel = (members) => {
    if (!members || members.length === 0) return;

    const data = members.map((m, index) => ({
        "S.No": index + 1,
        "Member No": m?.personalDetails?.membershipNumber || "—",
        "Member Name": m?.personalDetails?.nameOfMember || "—",
        "Father Name": m?.personalDetails?.nameOfFather || "—",
        "Mobile No": m?.personalDetails?.phoneNo || "—",
        "Email": m?.personalDetails?.emailId || "—",
        "Introduced By": m?.nomineeDetails?.introduceBy || "—",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Members List");

    XLSX.writeFile(workbook, "Members_List.xlsx");
};
