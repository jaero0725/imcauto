document.addEventListener('DOMContentLoaded', function() {
    const menuItems = document.querySelectorAll('.sidebar-menu li');
    const comparisonResult = document.getElementById('comparison-result');
    const imcCompanies = document.getElementById('imc-companies');

    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // 모든 메뉴 아이템에서 active 클래스 제거
            menuItems.forEach(i => i.classList.remove('active'));
            // 클릭된 메뉴 아이템에 active 클래스 추가
            this.classList.add('active');

            // 메뉴 텍스트에 따라 해당 섹션 표시
            const menuText = this.textContent.trim();
            if (menuText === '매출 분석') {
                comparisonResult.style.display = 'block';
                imcCompanies.style.display = 'none';
            } else if (menuText === 'IMC 업체 목록') {
                comparisonResult.style.display = 'none';
                imcCompanies.style.display = 'block';
                loadCompanyList();
            } else {
                // 홈 메뉴 클릭 시
                comparisonResult.style.display = 'block';
                imcCompanies.style.display = 'none';
            }
        });
    });
});

function loadCompanyList() {
    const companyListContainer = document.getElementById('company-list-container');
    // 여기에 실제 IMC 업체 데이터를 로드하는 로직을 추가할 수 있습니다
    // 예시 데이터
    const companies = [
        { name: 'IMC 업체 1', status: 'active' },
        { name: 'IMC 업체 2', status: 'active' },
        { name: 'IMC 업체 3', status: 'inactive' }
    ];

    // 업체 목록 HTML 생성
    const companyListHTML = companies.map(company => `
        <div class="company-item">
            <h3>${company.name}</h3>
            <span class="status ${company.status}">${company.status === 'active' ? '활성' : '비활성'}</span>
        </div>
    `).join('');

    companyListContainer.innerHTML = companyListHTML;
} 