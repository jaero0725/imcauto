let file1Data = null;
let file2Data = null;

document.addEventListener('DOMContentLoaded', function() {
    const file1Input = document.getElementById('file1');
    const file2Input = document.getElementById('file2');
    const compareBtn = document.getElementById('compare-btn');

    file1Input.addEventListener('change', function(e) {
        handleFileSelect(e, 'file1-info', 1);
    });

    file2Input.addEventListener('change', function(e) {
        handleFileSelect(e, 'file2-info', 2);
    });

    compareBtn.addEventListener('click', compareFiles);
});

function handleFileSelect(event, infoId, fileNum) {
    const file = event.target.files[0];
    const fileInfo = document.getElementById(infoId);
    
    if (!file) {
        fileInfo.textContent = '파일이 선택되지 않았습니다.';
        return;
    }

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        fileInfo.textContent = 'CSV 파일만 업로드 가능합니다.';
        event.target.value = ''; // 파일 선택 초기화
        return;
    }
    
    fileInfo.textContent = `선택된 파일: ${file.name}`;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csvData = parseCSV(e.target.result);
            if (fileNum === 1) {
                file1Data = csvData;
            } else {
                file2Data = csvData;
            }
        } catch (error) {
            fileInfo.textContent = '파일 처리 중 오류가 발생했습니다: ' + error.message;
        }
    };
    
    reader.readAsText(file, 'EUC-KR'); // 한글 인코딩 처리
}

function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // 빈 줄 건너뛰기

        // 쉼표로 분리하되, 따옴표 안의 쉼표는 보존
        const values = [];
        let currentValue = '';
        let inQuotes = false;
        
        for (let char of line) {
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(currentValue);
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        values.push(currentValue);

        const row = {};

        headers.forEach((header, index) => {
            let value = values[index] || '';
            // 따옴표와 공백 제거
            value = value.replace(/^["'\s]+|["'\s]+$/g, '');
            
            // 공급가액 등 숫자 데이터는 숫자로 변환하여 저장
            if (header === '공급가액' || header === '문자(CBDM)' || header === '알림톡') {
                // 쉼표와 공백 제거 후 숫자로 변환
                value = Number(value.replace(/[,\s]/g, '')) || 0;
            }
            
            row[header] = value;
        });

        result.push(row);
    }

    return result;
}

function compareFiles() {
    if (!file1Data || !file2Data) {
        alert('두 개의 CSV 파일을 모두 선택해주세요.');
        return;
    }
    
    // 비교 테이블 생성
    generateComparisonTable(file1Data, file2Data);
    
    // PDF 생성 버튼 활성화
    document.getElementById('generate-pdf').disabled = false;
}

// 총액 계산 함수
function calculateTotals(data) {
    let totalSupply = 0;
    
    data.forEach(row => {
        // 계 행이 아닌 경우에만 합산
        if (row['사업자 번호'] !== '계') {
            // 공급가액이 이미 숫자로 변환되어 있으므로 바로 합산
            totalSupply += row['공급가액'] || 0;
        }
    });
    
    return { total: totalSupply };
}

// 요약 정보 업데이트 함수
function updateSummary(totals1, totals2) {
    document.getElementById('base-year-total').textContent = totals1.total.toLocaleString();
    document.getElementById('compare-year-total').textContent = totals2.total.toLocaleString();
    
    const change = totals2.total - totals1.total;
    const changeRate = totals1.total !== 0 ? ((change / totals1.total) * 100).toFixed(2) : '0.00';
    
    const totalChangeElement = document.getElementById('total-change');
    totalChangeElement.textContent = change.toLocaleString();
    totalChangeElement.className = 'amount ' + (change >= 0 ? 'positive' : 'negative');
    
    const totalChangeRateElement = document.getElementById('total-change-rate');
    totalChangeRateElement.textContent = changeRate + '%';
    totalChangeRateElement.className = 'amount ' + (parseFloat(changeRate) >= 0 ? 'positive' : 'negative');
} 