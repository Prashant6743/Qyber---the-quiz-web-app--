// 3D Effects and Mouse Tracking
document.addEventListener('DOMContentLoaded', function() {
    // Add tilt effect to attempt items
    const attemptItems = document.querySelectorAll('.attempt-item');
    
    attemptItems.forEach(item => {
        // Add glare element
        const glareElement = document.createElement('div');
        glareElement.classList.add('js-tilt-glare');
        item.appendChild(glareElement);
        
        // Track mouse movement for the 3D effect
        item.addEventListener('mousemove', e => {
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate percentages
            const mouseX = Math.floor((x / rect.width) * 100);
            const mouseY = Math.floor((y / rect.height) * 100);
            
            // Set CSS variables for the gradient effect
            item.style.setProperty('--mouse-x', `${mouseX}%`);
            item.style.setProperty('--mouse-y', `${mouseY}%`);
            
            // Set glare position
            item.style.setProperty('--glare-x', `${mouseX}%`);
            item.style.setProperty('--glare-y', `${mouseY}%`);
            
            // Calculate the rotation based on mouse position
            // Center is 0 degrees, edges are max rotation
            const rotateY = ((mouseX - 50) / 50) * 10; // Max 10 degrees rotation
            const rotateX = ((50 - mouseY) / 50) * 10; // Max 10 degrees rotation
            
            // Apply the rotation transform
            item.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0) translateY(-5px)`;
        });
        
        // Reset on mouse leave
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });
    
    // Add the same effect to other cards if needed
    const dashboardCards = document.querySelectorAll('.dashboard-card');
    
    dashboardCards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const items = card.querySelectorAll('.attempt-item, .quiz-item');
            if (items.length === 0) return;
            
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate percentages for the card
            const mouseX = Math.floor((x / rect.width) * 100);
            const mouseY = Math.floor((y / rect.height) * 100);
            
            // Apply subtle rotation to the card itself
            const rotateY = ((mouseX - 50) / 50) * 3; // Max 3 degrees rotation
            const rotateX = ((50 - mouseY) / 50) * 3; // Max 3 degrees rotation
            
            card.style.transform = `perspective(1500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        
        // Reset on mouse leave
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1500px) rotateX(0) rotateY(0)';
        });
    });
});
