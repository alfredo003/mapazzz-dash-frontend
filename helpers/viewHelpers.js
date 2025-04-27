const institutionHelpers = {
    getInstitutionIcon: (type) => {
        const icons = {
            'hospital': 'fa-hospital',
            'clinic': 'fa-clinic-medical',
            'health_center': 'fa-first-aid',
            'ngo': 'fa-hands-helping',
            'government': 'fa-building'
        };
        return icons[type] || 'fa-building';
    },

    formatInstitutionType: (type) => {
        const types = {
            'hospital': 'Hospital',
            'clinic': 'Clínica',
            'health_center': 'Centro de Saúde',
            'ngo': 'ONG',
            'government': 'Governamental'
        };
        return types[type] || type;
    }
};

module.exports = institutionHelpers;
