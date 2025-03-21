function generateComparisonTable(data1, data2) {
    const tableContainer = document.getElementById('table-container');
    tableContainer.innerHTML = ''; // 기존 내용 초기화
    
    // 컨트롤 패널 추가
    const controlPanel = document.createElement('div');
    controlPanel.className = 'control-panel';
    
    // 변화율 기준 필터 추가
    const filterDiv = document.createElement('div');
    filterDiv.innerHTML = `
        <label>변화율 필터: </label>
        <select id="changeFilter">
            <option value="0">전체 보기</option>
            <option value="10">10% 이상 변화</option>
            <option value="20">20% 이상 변화</option>
            <option value="50">50% 이상 변화</option>
        </select>
    `;
    controlPanel.appendChild(filterDiv);
    tableContainer.appendChild(controlPanel);
    
    // 테이블 생성
    const table = document.createElement('table');
    
    // 헤더 설정
    const headers = [
        'No.', '사업자 번호', '고객사명',
        '기준년 공급가', '비교년 공급가', '변화액', '변화율(%)'
    ];
    
    // 헤더 행 생성
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // 데이터 매핑 생성 (사업자 번호 기준)
    const data2Map = new Map(
        data2.map(row => [row['사업자 번호'], row])
    );

    // 데이터 행 생성
    const rows = [];
    const businessNumberCheck = new Map(); // 사업자 번호 체크를 위한 Map
    let totalAmount1 = 0; // 기준년도 총액
    let totalAmount2 = 0; // 비교년도 총액

    data1.forEach((row1) => {
        // 총합계 행 제외
        if (row1['사업자 번호'] === '계') return;

        const businessNumber = row1['사업자 번호'].toString().trim();
        
        // 이미 처리된 사업자 번호인지 확인
        if (businessNumberCheck.has(businessNumber)) {
            console.warn(`중복된 사업자 번호 발견: ${businessNumber} (${row1['고객사명(To-Be)']}, 이전 고객사: ${businessNumberCheck.get(businessNumber)})`);
            return; // 중복된 사업자 번호는 건너뛰기
        }
        
        const row2 = data2Map.get(businessNumber);
        
        // 두 년도 모두 데이터가 있는 경우만 처리
        if (!row2) return;

        // 사업자 번호에 대한 고객사명 저장
        businessNumberCheck.set(businessNumber, row1['고객사명(To-Be)']);

        // 데이터는 이미 파싱할 때 숫자로 변환되어 있음
        const amount1 = row1['공급가액'] || 0;
        const amount2 = row2['공급가액'] || 0;
        
        // 총액 계산
        totalAmount1 += amount1;
        totalAmount2 += amount2;
        
        // 변화액과 변화율 계산
        const change = amount2 - amount1; // 비교년도 - 기준년도
        const changeRate = amount1 !== 0 ? (change / amount1) * 100 : 0;

        const tr = document.createElement('tr');
        
        // 데이터 채우기
        const rowData = [
            row1['No.'],
            businessNumber,
            row1['고객사명(To-Be)'],
            amount1.toLocaleString('ko-KR'),
            amount2.toLocaleString('ko-KR'),
            change.toLocaleString('ko-KR'),
            changeRate.toFixed(2)
        ];

        rowData.forEach((value, i) => {
            const td = document.createElement('td');
            
            // 금액 컬럼 처리
            if (i >= 3 && i <= 5) {
                td.textContent = value;
                td.style.textAlign = 'right';
                if (i === 5) {
                    if (change !== 0) {
                        td.classList.add(change > 0 ? 'increase' : 'decrease');
                    }
                }
            } else if (i === 6) { // 변화율 컬럼
                td.textContent = `${value}%`;
                td.style.textAlign = 'right';
                if (Math.abs(Number(value)) >= 20) {
                    td.classList.add('significant-change');
                }
            } else {
                td.textContent = value;
            }
            
            tr.appendChild(td);
        });

        tr.dataset.changeRate = Math.abs(changeRate);
        rows.push(tr);
    });

    // 모든 행을 테이블에 추가
    rows.forEach(tr => table.appendChild(tr));
    
    // 테이블 추가
    tableContainer.appendChild(table);

    // 필터 이벤트 리스너 추가
    const filterSelect = document.getElementById('changeFilter');
    if (filterSelect) {
        filterSelect.addEventListener('change', function(e) {
            const threshold = Number(e.target.value);
            rows.forEach(tr => {
                const changeRate = Number(tr.dataset.changeRate);
                tr.style.display = threshold === 0 || changeRate >= threshold ? '' : 'none';
            });
        });
    }

    // 요약 정보 업데이트
    updateSummarySection({
        baseYearTotal: totalAmount1,
        compareYearTotal: totalAmount2,
        totalChange: totalAmount2 - totalAmount1,
        totalChangeRate: totalAmount1 !== 0 ? ((totalAmount2 - totalAmount1) / totalAmount1) * 100 : 0
    });
}

// 숫자 포맷팅 함수
function formatNumber(number) {
    return new Intl.NumberFormat('ko-KR').format(number);
}

// 요약 정보 업데이트 함수
function updateSummarySection(totals) {
    const baseYearTotal = document.getElementById('base-year-total');
    const compareYearTotal = document.getElementById('compare-year-total');
    const totalChange = document.getElementById('total-change');
    const totalChangeRate = document.getElementById('total-change-rate');

    baseYearTotal.textContent = formatNumber(totals.baseYearTotal);
    compareYearTotal.textContent = formatNumber(totals.compareYearTotal);
    
    // 총 변화액 설정
    totalChange.textContent = formatNumber(totals.totalChange);
    totalChange.className = 'amount ' + (totals.totalChange >= 0 ? 'positive' : 'negative');
    
    // 총 변화율 설정
    totalChangeRate.textContent = totals.totalChangeRate.toFixed(2) + '%';
    totalChangeRate.className = 'amount ' + (totals.totalChangeRate >= 0 ? 'positive' : 'negative');
}

// CSS 스타일 추가
const style = document.createElement('style');
style.textContent = `
    .different {
        background-color: #fff3cd;
        position: relative;
    }
    
    td {
        padding: 8px;
        border: 1px solid #ddd;
    }
    
    th {
        position: sticky;
        top: 0;
        background-color: #f8f9fa;
        z-index: 1;
    }
    
    .increase {
        color: #28a745;
        font-weight: bold;
    }
    
    .decrease {
        color: #dc3545;
        font-weight: bold;
    }
    
    .significant-change {
        background-color: #fff3cd;
        font-weight: bold;
    }
`;
document.head.appendChild(style);

// 총합계 계산 함수
function calculateTotals(data) {
    const totals = {
        '공급가액': 0,
        '문자(CBDM)': 0,
        '알림톡': 0
    };
    
    data.forEach(row => {
        if (row['사업자 번호'] !== '계') {
            ['공급가액', '문자(CBDM)', '알림톡'].forEach(key => {
                totals[key] += cleanNumber(row[key]);
            });
        }
    });
    
    return totals;
}

// 숫자 정제 함수
function cleanNumber(str) {
    if (!str) return 0;
    return parseFloat(str.replace(/[^\d.-]/g, ''));
}

function calculateTotalAmounts(data) {
    let baseYearTotal = 0;
    let compareYearTotal = 0;

    data.forEach(row => {
        baseYearTotal += parseFloat(row.baseYearAmount) || 0;
        compareYearTotal += parseFloat(row.compareYearAmount) || 0;
    });

    const totalChange = compareYearTotal - baseYearTotal;
    const totalChangeRate = baseYearTotal !== 0 ? (totalChange / baseYearTotal) * 100 : 0;

    return {
        baseYearTotal,
        compareYearTotal,
        totalChange,
        totalChangeRate
    };
}

function generateTable(data) {
    const tableContainer = document.getElementById('table-container');
    
    // 요약 정보 업데이트
    const totals = calculateTotalAmounts(data);
    updateSummarySection(totals);

    // 테이블 생성
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>업체명</th>
                <th>기준년 공급가</th>
                <th>비교년 공급가</th>
                <th>변화액</th>
                <th>변화율</th>
            </tr>
        </thead>
        <tbody>
            ${data.map(row => {
                const baseAmount = parseFloat(row.baseYearAmount) || 0;
                const compareAmount = parseFloat(row.compareYearAmount) || 0;
                const change = compareAmount - baseAmount;
                const changeRate = baseAmount !== 0 ? (change / baseAmount) * 100 : 0;
                const changeClass = change >= 0 ? 'increase' : 'decrease';
                
                return `
                    <tr>
                        <td>${row.companyName}</td>
                        <td>${formatNumber(baseAmount)}</td>
                        <td>${formatNumber(compareAmount)}</td>
                        <td class="${changeClass}">${formatNumber(change)}</td>
                        <td class="${changeClass}">${changeRate.toFixed(2)}%</td>
                    </tr>
                `;
            }).join('')}
        </tbody>
    `;

    tableContainer.innerHTML = '';
    tableContainer.appendChild(table);
}

// 파일 비교 버튼 이벤트는 fileHandler.js에서 이미 처리됨 ㄴ