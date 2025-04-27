document.addEventListener('DOMContentLoaded', function() {
    const alerts = document.querySelectorAll('.alert');
    
    alerts.forEach(alert => {
        // Auto hide after 10 seconds
        setTimeout(() => {
            if (alert) {
                closeAlert(alert);
            }
        }, 10000);
    });
});

function closeAlert(alert) {
    alert.classList.add('fade-out');
    setTimeout(() => {
        alert.remove();
    }, 500);
}