import React, { useEffect } from 'react';
import './admin.css';

const Background3D = () => {
  useEffect(() => {
    const animateBackground = (event) => {
      const cards = document.querySelectorAll('.card-custom');
      const mouseX = window.innerWidth / 2;
      const mouseY = window.innerHeight / 2;
      const offsetX = (mouseX - event.clientX) / 20;
      const offsetY = (mouseY - event.clientY) / 20;

      cards.forEach((card) => {
        card.style.transform = `perspective(1000px) rotateX(${offsetY}deg) rotateY(${offsetX}deg)`;
      });
    };

    window.addEventListener('mousemove', animateBackground);

    return () => {
      window.removeEventListener('mousemove', animateBackground);
    };
  }, []);

  return null;  // No need for a visible background div, we handle it directly on the cards
};

export default Background3D;
