// Enhanced scroll functionality for offers container
document.addEventListener('DOMContentLoaded', () => {
  const offersContainer = document.getElementById('offers-container');
  if (!offersContainer) return;

  // Function to update scroll indicators
  function updateScrollIndicators() {
    const { scrollLeft, scrollWidth, clientWidth } = offersContainer;
    const isAtStart = scrollLeft < 10;
    const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;

    offersContainer.classList.toggle('scroll-start', !isAtStart);
    offersContainer.classList.toggle('scroll-end', !isAtEnd);
  }

  // Add scroll event listener
  offersContainer.addEventListener('scroll', updateScrollIndicators, { passive: true });

  // Initial check
  updateScrollIndicators();

  // Handle window resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateScrollIndicators, 100);
  });

  // Add keyboard navigation
  offersContainer.setAttribute('tabindex', '0');
  offersContainer.addEventListener('keydown', (e) => {
    const scrollAmount = 300; // Adjust scroll amount as needed
    
    switch(e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        offersContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        break;
      case 'ArrowRight':
        e.preventDefault();
        offersContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        break;
    }
  });

  // Add touch events for better mobile experience
  let touchStartX = 0;
  let touchEndX = 0;
  
  offersContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  offersContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    const swipeThreshold = 50; // Minimum distance for a swipe
    const swipeDistance = touchEndX - touchStartX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        // Swipe right
        offersContainer.scrollBy({ 
          left: -offersContainer.offsetWidth * 0.8, 
          behavior: 'smooth' 
        });
      } else {
        // Swipe left
        offersContainer.scrollBy({ 
          left: offersContainer.offsetWidth * 0.8, 
          behavior: 'smooth' 
        });
      }
    }
  }
});
