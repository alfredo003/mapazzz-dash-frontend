document.addEventListener('DOMContentLoaded', function() {
    // Form validation
  

    const photoInput = document.getElementById('awardPhoto');
    const previewContainer = document.getElementById('photoPreview');
    const previewImage = document.getElementById('previewImage');

    // Show image preview when a file is selected
    photoInput.addEventListener('change', function(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          previewImage.src = e.target.result;
          previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
      } else {
        previewContainer.style.display = 'none';
      }
    });

    const toggleButton = document.getElementById('toggleForm');
    const formContainer = document.getElementById('awardFormContainer');
    
    toggleButton.addEventListener('click', function() {
      formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
      toggleButton.querySelector('i').classList.toggle('fa-chevron-down');
      toggleButton.querySelector('i').classList.toggle('fa-chevron-up');
    });

    // Add search functionality
    const searchInput = document.getElementById('searchAwards');
    const awardsTableBody = document.getElementById('awardsTableBody');
    const rows = awardsTableBody.getElementsByTagName('tr');

    searchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      
      Array.from(rows).forEach(row => {
        const title = row.getElementsByTagName('td')[2]?.textContent.toLowerCase() || '';
        const id = row.getElementsByTagName('td')[1]?.textContent.toLowerCase() || '';
        const points = row.getElementsByTagName('td')[3]?.textContent.toLowerCase() || '';
        
        if (title.includes(searchTerm) || id.includes(searchTerm) || points.includes(searchTerm)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });

      // Update the awards count
      const visibleRows = Array.from(rows).filter(row => row.style.display !== 'none').length;
      document.getElementById('awardsCount').textContent = `Mostrando ${visibleRows} prêmios`;
    });
  });