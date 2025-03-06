function parseTextToTable() {
    const text = document.getElementById("textInput").value;
    const rows = text.split("\n").map(row => row.split("\t"));
    let tableHtml = "<table><tbody>";
    rows.forEach(row => {
        tableHtml += "<tr>" + row.map(cell => `<td>${cell}</td>`).join("") + "</tr>";
    });
    tableHtml += "</tbody></table>";
    document.getElementById("tableContainer").innerHTML = tableHtml;
    document.getElementById("downloadBtn").style.display = "block";
}

function generateExcel() {
    const text = document.getElementById("textInput").value;
    const rows = text.split("\n").map(row => row.split("\t"));
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "generated.xlsx");
} 