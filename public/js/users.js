document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Password visibility toggle
    const togglePassword = document.getElementById('togglePassword');
    const toggleNewPassword = document.getElementById('toggleNewPassword');
    const password = document.getElementById('userPassword');
    const newPassword = document.getElementById('newPassword');

    if (togglePassword && password) {
        togglePassword.addEventListener('click', function() {
            const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
            password.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }

    if (toggleNewPassword && newPassword) {
        toggleNewPassword.addEventListener('click', function() {
            const type = newPassword.getAttribute('type') === 'password' ? 'text' : 'password';
            newPassword.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }

    // Table sorting functionality
    const table = document.getElementById('usersTable');
    if (table) {
        const headers = table.querySelectorAll('th');
        headers.forEach((header, index) => {
            if (header.querySelector('.fa-sort')) {
                header.addEventListener('click', () => {
                    sortTable(index);
                });
            }
        });
    }

    // Search functionality
    const searchInput = document.getElementById('userSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchText = this.value.toLowerCase();
            const rows = table.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchText) ? '' : 'none';
            });
        });
    }

    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });

    // User status toggle
    const statusSwitches = document.querySelectorAll('.form-check-input[type="checkbox"]');
    statusSwitches.forEach(switchEl => {
        switchEl.addEventListener('change', function() {
            const userId = this.closest('tr').querySelector('td:first-child').textContent;
            const status = this.checked ? 'active' : 'inactive';
            
            // Here you would typically make an API call to update the user status
            console.log(`Updating user ${userId} status to ${status}`);
        });
    });

    // Delete confirmation
    const deleteButtons = document.querySelectorAll('[data-bs-target="#deleteUserModal"]');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.closest('tr').querySelector('td:first-child').textContent;
            const userName = this.closest('tr').querySelector('td:nth-child(2)').textContent;
            
            const modal = document.getElementById('deleteUserModal');
            modal.querySelector('.modal-body h5').textContent = 
                `Tem a certeza que deseja eliminar o utilizador ${userName}?`;
            
            // Store the user ID for the delete action
            modal.dataset.userId = userId;
        });
    });

    // Handle delete action
    const confirmDeleteButton = document.querySelector('#deleteUserModal .btn-danger');
    if (confirmDeleteButton) {
        confirmDeleteButton.addEventListener('click', function() {
            const modal = document.getElementById('deleteUserModal');
            const userId = modal.dataset.userId;
            
            // Here you would typically make an API call to delete the user
            console.log(`Deleting user ${userId}`);
            
            // Close the modal
            const modalInstance = bootstrap.Modal.getInstance(modal);
            modalInstance.hide();
            
            // Remove the row from the table
            const row = table.querySelector(`tr td:first-child:contains('${userId}')`).closest('tr');
            row.remove();
        });
    }
});

// Table sorting function
function sortTable(columnIndex) {
    const table = document.getElementById('usersTable');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const header = table.querySelectorAll('th')[columnIndex];
    const isAsc = header.classList.contains('asc');
    
    // Remove sort classes from all headers
    table.querySelectorAll('th').forEach(th => {
        th.classList.remove('asc', 'desc');
    });
    
    // Add sort class to current header
    header.classList.add(isAsc ? 'desc' : 'asc');
    
    // Sort rows
    rows.sort((a, b) => {
        const aValue = a.children[columnIndex].textContent.trim();
        const bValue = b.children[columnIndex].textContent.trim();
        
        if (columnIndex === 0) { // ID column
            return isAsc ? bValue - aValue : aValue - bValue;
        } else {
            return isAsc ? 
                bValue.localeCompare(aValue) : 
                aValue.localeCompare(bValue);
        }
    });
    
    // Reorder rows
    rows.forEach(row => tbody.appendChild(row));
}

// Helper function for text contains
jQuery.expr[':'].contains = function(a, i, m) {
    return jQuery(a).text().toUpperCase()
        .indexOf(m[3].toUpperCase()) >= 0;
}; 