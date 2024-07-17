document.addEventListener("DOMContentLoaded", function() {
    const stars = document.getElementById('stars');
    const starsmall = 600;
    const starmid = 100;
    const starbig = 60;
  
    for (let i = 0; i < starsmall; i++) {
      let star = document.createElement('div');
      star.className = 'star-small';
      star.style.top = `${Math.random() * 2000}px`;
      star.style.left = `${Math.random() * window.innerWidth}px`;
      star.style.animationDuration = `${2 + Math.random() * 8}s`;
      star.style.animationDelay = `${Math.random() * 5}s`;
      stars.appendChild(star);
    }
    for (let i=0; i< starmid; i++) {
      let star = document.createElement('div');
      star.className = 'star-mid';
      star.style.top = `${Math.random() * 2000}px`;
      star.style.left = `${Math.random() * window.innerWidth}px`;
      star.style.animationDuration = `${2 + Math.random() * 8}s`;
      star.style.animationDelay = `${Math.random() * 5}s`;
      stars.appendChild(star);
    }

    for (let i=0; i< starbig; i++) {
      let star = document.createElement('div');
      star.className = 'star-big';
      star.style.top = `${Math.random() * 2000}px`;
      star.style.left = `${Math.random() * window.innerWidth}px`;
      star.style.animationDuration = `${2 + Math.random() * 8}s`;
      star.style.animationDelay = `${Math.random() * 5}s`;
      stars.appendChild(star);
    }
  });
  