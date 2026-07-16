// ============================================
// HEADER SCROLL EFFECT
// ============================================
document.addEventListener('DOMContentLoaded', function () {
  const header = document.getElementById('header');
  
  window.addEventListener('scroll', function () {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // ============================================
  // MOBILE MENU TOGGLE
  // ============================================
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.querySelector('.nav');
  
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      const icon = this.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });
  }

  // ============================================
  // FAQ ACCORDION
  // ============================================
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(function (item) {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', function () {
        const isActive = item.classList.contains('active');
        // Close all
        faqItems.forEach(function (el) {
          el.classList.remove('active');
        });
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });

  // ============================================
  // ANIMATED COUNTERS (Hero Stats)
  // ============================================
  const counters = document.querySelectorAll('.stat-number');
  
  function animateCounters() {
    counters.forEach(function (counter) {
      const target = parseInt(counter.getAttribute('data-count'));
      if (!target || counter.classList.contains('counted')) return;
      
      let current = 0;
      const increment = Math.ceil(target / 60);
      const interval = setInterval(function () {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        counter.textContent = current.toLocaleString();
      }, 30);
      
      counter.classList.add('counted');
    });
  }

  // Trigger counters when hero is visible
  const hero = document.getElementById('hero');
  if (hero) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounters();
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });
    observer.observe(hero);
  } else {
    animateCounters();
  }

  // ============================================
  // AOS INIT
  // ============================================
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      once: true,
      offset: 60,
      easing: 'ease-out-cubic',
    });
  }
});
