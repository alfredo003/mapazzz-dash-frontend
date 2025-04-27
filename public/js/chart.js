
let riskChart;
let institutionsData = JSON.parse(localStorage.getItem('institutions')) || [];
let blogsData = JSON.parse(localStorage.getItem('blogs')) || [];
let awardsData = JSON.parse(localStorage.getItem('awards')) || [];


function checkAuth() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        return firebase.auth().currentUser !== null;
    }
    return true;
}

async function loadReportsData() {
    try {
        const response = await fetch('/api/reports/statistics');
        const data = await response.json();

        riskChart.data.datasets[0].data = [
            data.lowRisk || 0,
            data.mediumRisk || 0,
            data.highRisk || 0
        ];

        riskChart.update();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    try {
        const ctx = document.getElementById('riskChart');
        if (!ctx) {
            console.error('Elemento canvas "riskChart" não encontrado');
            return;
        }

        riskChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Baixo', 'Médio', 'Alto'],
                datasets: [{
                    label: 'Número de Casos',
                    data: [0, 0, 0],
                    backgroundColor: [
                        'rgba(39, 174, 96, 0.6)',
                        'rgba(243, 156, 18, 0.6)',
                        'rgba(231, 76, 60, 0.6)'
                    ],
                    borderColor: [
                        'rgba(39, 174, 96, 1)',
                        'rgba(243, 156, 18, 1)',
                        'rgba(231, 76, 60, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Número de Casos'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Nível de Risco'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });

        // Load data
        loadReportsData();
        loadInstitutionsData();
        loadBlogsData();
        loadAwardsData();

        // Refresh buttons
        document.getElementById('refreshMap').addEventListener('click', loadReportsData);
        document.getElementById('refreshChart').addEventListener('click', loadReportsData);
        document.getElementById('refreshActiveCases').addEventListener('click', loadReportsData);
        document.getElementById('refreshResolvedCases').addEventListener('click', loadReportsData);
        document.getElementById('refreshInstitutions').addEventListener('click', loadInstitutionsData);
        document.getElementById('refreshBlogs').addEventListener('click', loadBlogsData);
        document.getElementById('refreshAwards').addEventListener('click', loadAwardsData);

        // Institution form submission
        document.getElementById('institutionForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const institution = {
                id: institutionsData.length + 1,
                name: document.getElementById('name').value,
                type: document.getElementById('type').value,
                address: document.getElementById('address').value,
                contact: document.getElementById('contact').value,
                location: document.getElementById('location').value
            };
            institutionsData.push(institution);
            localStorage.setItem('institutions', JSON.stringify(institutionsData));
            alert('Instituição adicionada com sucesso!');
            this.reset();
            loadInstitutionsData();
        });

        // Blog form submission
        document.getElementById('blogForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const blog = {
                id: blogsData.length + 1,
                title: document.getElementById('blogTitle').value,
                description: document.getElementById('blogDescription').value,
                photoUrl: document.getElementById('blogPhoto').value
            };
            blogsData.push(blog);
            localStorage.setItem('blogs', JSON.stringify(blogsData));
            alert('Blog adicionado com sucesso!');
            this.reset();
            loadBlogsData();
        });

        // Award form submission
        document.getElementById('awardForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const award = {
                id: awardsData.length + 1,
                title: document.getElementById('awardTitle').value,
                description: document.getElementById('awardDescription').value,
                photoUrl: document.getElementById('awardPhoto').value
            };
            awardsData.push(award);
            localStorage.setItem('awards', JSON.stringify(awardsData));
            alert('Prêmio adicionado com sucesso!');
            this.reset();
            loadAwardsData();
        });
    } catch (error) {
        console.error('Initialization error:', error);
        alert('Erro na inicialização: ' + error.message);
    }
});
