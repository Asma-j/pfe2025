import React, { useEffect, useRef } from 'react';
import './admin.css';

const Background3D = () => {
  const cardsRef = useRef([]);

  useEffect(() => {
    const animateBackground = (event) => {
      cardsRef.current.forEach((card) => {
        if (card) {
          const rect = card.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          // Calculate mouse offset relative to card center
          const offsetX = (event.clientX - centerX) / 20; // Adjust sensitivity
          const offsetY = (event.clientY - centerY) / 20;

          // Apply smooth damping
          const rotateX = offsetY * 0.5; // Reduced sensitivity for smoother effect
          const rotateY = -offsetX * 0.5;

          // Use requestAnimationFrame for better performance
          requestAnimationFrame(() => {
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
          });
        }
      });
    };

    const resetAnimation = () => {
      cardsRef.current.forEach((card) => {
        if (card) {
          requestAnimationFrame(() => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
          });
        }
      });
    };

    // Add event listeners
    window.addEventListener('mousemove', animateBackground);
    window.addEventListener('mouseleave', resetAnimation); // Reset when mouse leaves window

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', animateBackground);
      window.removeEventListener('mouseleave', resetAnimation);
    };
  }, []);

  return null; // No visible div, effects applied to cards via ref
};

export default Background3D;