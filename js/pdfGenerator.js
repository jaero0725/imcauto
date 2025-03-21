document.getElementById('generate-pdf').addEventListener('click', generatePDF);

function generatePDF() {
    const element = document.getElementById('table-container');
    
    // HTML을 캔버스로 변환
    html2canvas(element).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF();
        
        // 이미지 크기 계산
        const imgWidth = 210; // A4 가로 크기 (mm)
        const pageHeight = 295; // A4 세로 크기 (mm)
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        // 첫 페이지 추가
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // 필요한 경우 여러 페이지 추가
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        // PDF 저장
        pdf.save('comparison-result.pdf');
    });
}