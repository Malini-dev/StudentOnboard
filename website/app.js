/* ═══════════════════════════════════════════
   INSTITUTE 360 — INTERACTIVE JAVASCRIPT
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── NAVBAR: Scroll Effect ──
  const navbar = document.getElementById('navbar');
  const handleNavScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  // ── HAMBURGER MENU ──
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Close menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // ── SMOOTH SCROLL for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── FEATURE TABS ──
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;

      // Deactivate all
      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      tabPanes.forEach(p => p.classList.remove('active'));

      // Activate target
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const targetPane = document.getElementById('tab-' + tabId);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // ── DEMO FORM ──
  const demoForm = document.getElementById('demoForm');
  const formSuccess = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('submitBtn');

  if (demoForm) {
    demoForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Simple validation
      const requiredFields = demoForm.querySelectorAll('[required]');
      let valid = true;
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = '#EF4444';
          valid = false;
        } else {
          field.style.borderColor = '';
        }
      });

      if (!valid) return;

      // Show loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Submitting...</span>';

      // Prepare the data
      const formData = {
        first_name: document.getElementById('fName').value,
        last_name: document.getElementById('lName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        institute_name: document.getElementById('instName').value,
        students_count: document.getElementById('students').value,
        institute_type: document.getElementById('instType').value
      };

      // Permanent backend hosted on Render.com
      fetch('https://mlni-api-8523.onrender.com/api/website-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        demoForm.style.display = 'none';
        formSuccess.classList.add('show');
        formSuccess.style.display = 'block';
      })
      .catch(error => {
        console.error('API submission error:', error);
        // Show error message
        alert("Failed to submit form. Please check if the server is running.");
      });
    });

    // Clear red borders on input
    demoForm.querySelectorAll('input, select').forEach(field => {
      field.addEventListener('input', () => {
        field.style.borderColor = '';
      });
    });
  }

  // ── SCROLL REVEAL (data-aos) ──
  const revealElements = document.querySelectorAll('[data-aos]');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.aosDelay) || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ── COUNTER ANIMATION (Stats Section) ──
  const statItems = document.querySelectorAll('.stat-item[data-count]');
  let statsCounted = false;

  const countUp = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const decimal = parseInt(el.dataset.decimal) || 0;
    const numEl = el.querySelector('.stat-num');
    const duration = 2000;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = ease * target;

      if (decimal > 0) {
        numEl.textContent = current.toFixed(decimal) + suffix;
      } else {
        numEl.textContent = Math.floor(current).toLocaleString('en-IN') + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsCounted) {
        statsCounted = true;
        statItems.forEach(item => countUp(item));
      }
    });
  }, { threshold: 0.3 });

  if (statItems.length > 0) {
    statsObserver.observe(statItems[0].closest('.stats-row'));
  }

  // ── ACTIVE NAV LINK on Scroll ──
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  const highlightNav = () => {
    const scrollY = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navAnchors.forEach(a => {
          a.classList.remove('active-link');
          if (a.getAttribute('href') === '#' + id) {
            a.classList.add('active-link');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', highlightNav, { passive: true });

  // ── CHART BAR ANIMATION ──
  const chartBars = document.querySelectorAll('.cb, .mc-b');
  const chartObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bars = entry.target.querySelectorAll('.cb, .mc-b');
        bars.forEach((bar, i) => {
          const finalHeight = bar.style.height;
          bar.style.height = '0%';
          setTimeout(() => {
            bar.style.height = finalHeight;
          }, i * 100);
        });
        chartObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.chart-bars, .mc-bars').forEach(container => {
    chartObserver.observe(container);
  });

  // ── TILT EFFECT on pricing cards ──
  document.querySelectorAll('.pricing-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      card.style.transform = card.classList.contains('popular')
        ? `scale(1.04) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
        : `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = card.classList.contains('popular')
        ? 'scale(1.04)'
        : '';
    });
  });

  // ── TYPING EFFECT in hero dashboard feed ──
  const feedItems = document.querySelectorAll('.feed-item');
  const feedObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        feedItems.forEach((item, i) => {
          item.style.opacity = '0';
          item.style.transform = 'translateX(-10px)';
          setTimeout(() => {
            item.style.transition = 'all 0.4s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
          }, 300 + i * 200);
        });
        feedObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  if (feedItems.length > 0) {
    feedObserver.observe(feedItems[0].closest('.dash-feed'));
  }

});
