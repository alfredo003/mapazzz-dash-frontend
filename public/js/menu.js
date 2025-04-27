function setActiveMenu() {
    const currentPath = window.location.pathname;
    const menuItems = document.querySelectorAll('.sidebar-menu a');
    
    menuItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPath || (currentPath.includes(href) && href !== '/')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', setActiveMenu);

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    let isSidebarCollapsed = false;

    menuToggle.addEventListener('click', function() {
        isSidebarCollapsed = !isSidebarCollapsed;
        
        if (isSidebarCollapsed) {
            sidebar.style.width = '80px';
            mainContent.style.marginLeft = '80px';
            document.querySelector('.sidebar-header h2').style.display = 'none';
            document.querySelectorAll('.sidebar-menu .menu-item span').forEach(span => {
                span.style.display = 'none';
            });
            document.querySelectorAll('.sidebar-menu .menu-item').forEach(item => {
                item.style.justifyContent = 'center';
                item.style.padding = '16px';
            });
        } else {
            sidebar.style.width = '280px';
            mainContent.style.marginLeft = '280px';
            document.querySelector('.sidebar-header h2').style.display = 'block';
            document.querySelectorAll('.sidebar-menu .menu-item span').forEach(span => {
                span.style.display = 'inline';
            });
            document.querySelectorAll('.sidebar-menu .menu-item').forEach(item => {
                item.style.justifyContent = 'flex-start';
                item.style.padding = '14px 25px';
            });
        }
    });
});