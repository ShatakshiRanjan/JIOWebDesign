document.addEventListener("DOMContentLoaded", function() {
    const stars = document.getElementById('stars');
    
    
    var height = document.documentElement.scrollHeight;
    
    const starsmall = height/12;
    const starmid = height/15;
    const starbig = height/18;
  
    for (let i = 0; i < starsmall; i++) {
      let star = document.createElement('div');
      star.className = 'star-small';
      star.style.top = `${Math.random() * height}px`;
      star.style.left = `${Math.random() * window.innerWidth}px`;
      star.style.animationDuration = `${2 + Math.random() * 8}s`;
      star.style.animationDelay = `${Math.random() * 2}s`;
      stars.appendChild(star);
    }
    for (let i=0; i< starmid; i++) {
      let star = document.createElement('div');
      star.className = 'star-mid';
      star.style.top = `${Math.random() * height}px`;
      star.style.left = `${Math.random() * window.innerWidth}px`;
      star.style.animationDuration = `${2 + Math.random() * 8}s`;
      star.style.animationDelay = `${Math.random() * 3}s`;
      stars.appendChild(star);
    }

    for (let i=0; i< starbig; i++) {
      let star = document.createElement('div');
      star.className = 'star-big';
      star.style.top = `${Math.random() * height}px`;
      star.style.left = `${Math.random() * window.innerWidth}px`;
      star.style.animationDuration = `${2 + Math.random() * 8}s`;
      star.style.animationDelay = `${Math.random() * 5}s`;
      stars.appendChild(star);
    }
  });
  