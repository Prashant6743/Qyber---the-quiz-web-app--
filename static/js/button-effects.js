// Enhanced button effects for better interactivity
document.addEventListener('DOMContentLoaded', function() {
    // Add click effects to all .btn-secondary elements
    const detailButtons = document.querySelectorAll('.btn-secondary');
    
    detailButtons.forEach(button => {
        // Add ripple effect on click
        button.addEventListener('click', function(e) {
            // Create ripple element
            const ripple = document.createElement('span');
            ripple.classList.add('btn-ripple');
            
            // Position the ripple where clicked
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            // Add ripple to button
            button.appendChild(ripple);
            
            // Remove ripple after animation completes
            setTimeout(() => {
                ripple.remove();
            }, 600);
            
            // Add loading state if it's a link to details
            if (button.getAttribute('href') && button.getAttribute('href').includes('view-attempt-details')) {
                // Prevent default navigation temporarily
                e.preventDefault();
                
                // Store the original text
                const originalContent = button.innerHTML;
                
                // Replace with loading spinner
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
                
                // Navigate after a short delay to show the animation
                setTimeout(() => {
                    window.location.href = button.getAttribute('href');
                }, 400);
            }
        });
    });
});
