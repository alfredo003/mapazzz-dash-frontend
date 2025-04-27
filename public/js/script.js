// Global variables
let map;
let riskChart;
let reportsData = [];
let institutionsData = JSON.parse(localStorage.getItem('institutions')) || [];
let blogsData = JSON.parse(localStorage.getItem('blogs')) || [];
let awardsData = JSON.parse(localStorage.getItem('awards')) || [];




// Update stats cards
function updateStats(data) {
    const totalReports = data.length;
    const highRisk = data.filter(item => item.riskLevel === 3).length;
    const mediumRisk = data.filter(item => item.riskLevel === 2).length;
    
    document.getElementById('totalReports').textContent = totalReports;
    document.getElementById('reportsChange').textContent = `${highRisk} alto risco`;
    
    document.getElementById('activeAlerts').textContent = highRisk + mediumRisk;
    document.getElementById('alertsChange').textContent = `${highRisk} críticos`;
    
    document.getElementById('riskZones').textContent = new Set(data.map(item => item.location)).size;
    document.getElementById('zonesChange').textContent = `${highRisk} zonas críticas`;
    
    document.getElementById('activeUsers').textContent = Math.floor(totalReports * 1.5);
    document.getElementById('usersChange').textContent = "+15% este mês";
}

// Update map with markers
function updateMap(data) {
    if (!map) return;
    
    map.eachLayer(layer => {
        if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
            map.removeLayer(layer);
        }
    });
    
    const validMarkers = [];
    data.forEach(item => {
        if (item.latitude && item.longitude && !isNaN(parseFloat(item.latitude)) && !isNaN(parseFloat(item.longitude))) {
            const lat = parseFloat(item.latitude);
            const lng = parseFloat(item.longitude);
            
            const opacity = item.riskLevel === 3 ? 0.8 : item.riskLevel === 2 ? 0.6 : 0.4;
            
            L.circleMarker([lat, lng], {
                radius: 8,
                fillColor: 'red',
                color: '#000',
                weight: 1,
                opacity: 1,
                fillOpacity: opacity
            }).addTo(map).bindPopup(`
                <b>${item.title || 'Sem título'}</b><br>
                Local: ${item.location || 'N/A'}<br>
                Risco: ${item.riskLevel === 3 ? 'Alto' : item.riskLevel === 2 ? 'Médio' : 'Baixo'}<br>
                Reportado em: ${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
            `);
            
            validMarkers.push([lat, lng]);
        }
    });
    
    if (validMarkers.length > 0) {
        map.fitBounds(validMarkers);
    } else {
        map.setView([-8.9308, 13.2017], 12);
    }
}

// Update chart
function updateChart(data) {
    const lowRisk = data.filter(item => item.riskLevel === 1).length;
    const mediumRisk = data.filter(item => item.riskLevel === 2).length;
    const highRisk = data.filter(item => item.riskLevel === 3).length;
    
    riskChart.data.datasets[0].data = [lowRisk, mediumRisk, highRisk];
    riskChart.update();
}

// Update active cases table
function updateActiveCasesTable(data) {
    const tableBody = document.getElementById('activeCasesTableBody');
    
    const activeCases = data.filter(item => item.status !== 'fixed');
    
    if (activeCases.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center;">
                    Nenhum caso ativo encontrado.
                </td>
            </tr>
        `;
        return;
    }
    
    const sortedData = [...activeCases].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    ).slice(0, 10);
    
    tableBody.innerHTML = sortedData.map((item, index) => {
        item.tableIndex = index;
        return `
            <tr style="--row-index: ${index};">
                <td>#${index + 1}</td>
                <td>${item.title || 'Sem título'}</td>
                <td>${item.location || 'N/A'}</td>
                <td>
                    <span class="text-${item.riskLevel === 3 ? 'danger' : 
                                      item.riskLevel === 2 ? 'warning' : 'success'}">
                        ${item.riskLevel === 3 ? 'Alto' : item.riskLevel === 2 ? 'Médio' : 'Baixo'}
                    </span>
                </td>
                <td>${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="viewReport(${index})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="confirmReport(${index})">
                        <i class="fas fa-check"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Update resolved cases table
function updateResolvedCasesTable(data) {
    const tableBody = document.getElementById('resolvedCasesTableBody');
    
    const resolvedCases = data.filter(item => item.status === 'fixed');
    
    if (resolvedCases.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center;">
                    Nenhum caso resolvido encontrado.
                </td>
            </tr>
        `;
        return;
    }
    
    const sortedData = [...resolvedCases].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    ).slice(0, 10);
    
    tableBody.innerHTML = sortedData.map((item, index) => {
        item.tableIndex = index;
        return `
            <tr style="--row-index: ${index};">
                <td>#${index + 1}</td>
                <td>${item.title || 'Sem título'}</td>
                <td>${item.location || 'N/A'}</td>
                <td>
                    <span class="text-${item.riskLevel === 3 ? 'danger' : 
                                      item.riskLevel === 2 ? 'warning' : 'success'}">
                        ${item.riskLevel === 3 ? 'Alto' : item.riskLevel === 2 ? 'Médio' : 'Baixo'}
                    </span>
                </td>
                <td>${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="viewReport(${index})">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Load institutions data
function loadInstitutionsData() {
    const tableBody = document.getElementById('institutionsTableBody');
    
    if (institutionsData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center;">
                    Nenhuma instituição encontrada.
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = institutionsData.map((item, index) => `
        <tr style="--row-index: ${index};">
            <td>#${item.id}</td>
            <td>${item.name}</td>
            <td>${item.type}</td>
            <td>${item.address}</td>
            <td>${item.contact}</td>
            <td>${item.location}</td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="viewInstitution(${item.id})">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Load blogs data
function loadBlogsData() {
    const tableBody = document.getElementById('blogsTableBody');
    
    if (blogsData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">
                    Nenhum blog encontrado.
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = blogsData.map((item, index) => `
        <tr style="--row-index: ${index};">
            <td>#${item.id}</td>
            <td>${item.title}</td>
            <td>${item.description.substring(0, 50)}${item.description.length > 50 ? '...' : ''}</td>
            <td><img src="${item.photoUrl}" class="photo-preview" alt="Blog Photo"></td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="viewBlog(${item.id})">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Load awards data
function loadAwardsData() {
    const tableBody = document.getElementById('awardsTableBody');
    
    if (awardsData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">
                    Nenhum prêmio encontrado.
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = awardsData.map((item, index) => `
        <tr style="--row-index: ${index};">
            <td>#${item.id}</td>
            <td>${item.title}</td>
            <td>${item.description.substring(0, 50)}${item.description.length > 50 ? '...' : ''}</td>
            <td><img src="${item.photoUrl}" class="photo-preview" alt="Award Photo"></td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="viewAward(${item.id})">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// View report details
function viewReport(index) {
    let report;
    const activeCases = reportsData.filter(item => item.status !== 'fixed')
                                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                  .slice(0, 10);
    const resolvedCases = reportsData.filter(item => item.status === 'fixed')
                                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                    .slice(0, 10);
    
    if (index < activeCases.length) {
        report = activeCases[index];
    } else {
        const resolvedIndex = index - activeCases.length;
        if (resolvedIndex < resolvedCases.length) {
            report = resolvedCases[resolvedIndex];
        }
    }
    
    if (report) {
        document.getElementById('modalTitle').textContent = 'Relatório';
        document.getElementById('modalReportTitle').textContent = report.title || 'N/A';
        document.getElementById('modalLocation').textContent = report.location || 'N/A';
        document.getElementById('modalRiskLevel').textContent = 
            report.riskLevel === 3 ? 'Alto' : 
            report.riskLevel === 2 ? 'Médio' : 'Baixo';
        document.getElementById('modalDate').textContent = 
            report.createdAt ? new Date(report.createdAt).toLocaleString() : 'N/A';
        document.getElementById('modalDescription').textContent = report.description || 'N/A';
        
        const modalImage = document.getElementById('modalImage');
        const imageSpinner = document.getElementById('imageSpinner');
        modalImage.classList.remove('loaded');
        imageSpinner.style.display = 'block';
        
        if (report.imageUrl) {
            modalImage.src = '';
            modalImage.src = report.imageUrl;
            modalImage.onload = () => {
                modalImage.classList.add('loaded');
                imageSpinner.style.display = 'none';
            };
            modalImage.onerror = () => {
                modalImage.src = '';
                modalImage.classList.remove('loaded');
                imageSpinner.style.display = 'none';
            };
        } else {
            modalImage.src = '';
            modalImage.classList.remove('loaded');
            imageSpinner.style.display = 'none';
        }
        
        const modal = document.getElementById('reportModal');
        const modalContent = modal.querySelector('.modal-content');
        modal.style.display = 'block';
        setTimeout(() => {
            modalContent.classList.add('visible');
        }, 10);
        document.body.classList.add('modal-open');
        
        modalContent.focus();
    } else {
        alert('Relatório não encontrado.');
    }
}

// Close modal
function closeModal() {
    const modal = document.getElementById('reportModal');
    const modalContent = modal.querySelector('.modal-content');
    
    modalContent.classList.remove('visible');
    modalContent.classList.add('closing');
    
    setTimeout(() => {
        modal.style.display = 'none';
        modalContent.classList.remove('closing');
        document.body.classList.remove('modal-open');
    }, 300);
}

// Close modal when clicking outside
document.getElementById('reportModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// Close modal with ESC key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('reportModal').style.display === 'block') {
        closeModal();
    }
});

// Confirm report
function confirmReport(index) {
    const activeCases = reportsData.filter(item => item.status !== 'fixed')
                                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                  .slice(0, 10);
    const report = activeCases[index];
    
    if (report && confirm(`Deseja confirmar o relatório #${index + 1}?`)) {
        alert(`Relatório #${index + 1} confirmado com sucesso!`);
        loadReportsData();
    }
}

// View institution details
function viewInstitution(id) {
    const institution = institutionsData.find(item => item.id === id);
    if (institution) {
        alert(`Detalhes da Instituição #${id}\n\n` +
              `Nome: ${institution.name}\n` +
              `Tipo: ${institution.type}\n` +
              `Endereço: ${institution.address}\n` +
              `Contacto: ${institution.contact}\n` +
              `Coordenadas: ${institution.location}`);
    }
}

// View blog details
function viewBlog(id) {
    const blog = blogsData.find(item => item.id === id);
    if (blog) {
        alert(`Detalhes do Blog #${id}\n\n` +
              `Título: ${blog.title}\n` +
              `Descrição: ${blog.description}\n` +
              `Foto: ${blog.photoUrl}`);
    }
}

// View award details
function viewAward(id) {
    const award = awardsData.find(item => item.id === id);
    if (award) {
        alert(`Detalhes do Prêmio #${id}\n\n` +
              `Título: ${award.title}\n` +
              `Descrição: ${award.description}\n` +
              `Foto: ${award.photoUrl}`);
    }
}