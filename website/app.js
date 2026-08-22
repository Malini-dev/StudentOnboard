document.addEventListener('DOMContentLoaded', () => {

  // ── NAVBAR SCROLL EFFECT ──
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  // ── HAMBURGER MENU ──
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  // ── TABS ──
  const tabBtns  = document.querySelectorAll('[data-tab]');
  const tabPanes = document.querySelectorAll('.tab-pane');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      tabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      tabPanes.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const targetPane = document.getElementById('tab-' + tabId);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // ── DEMO FORM with STRICT CLIENT-SIDE VALIDATION ──
  const demoForm  = document.getElementById('demoForm');
  const formSuccess = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('submitBtn');

  // Validation rules
  const rules = {
    fName:    { regex: /^[a-zA-Z\s]{2,50}$/,  msg: 'First name: letters only, 2–50 characters, no special characters.' },
    lName:    { regex: /^[a-zA-Z\s]{1,50}$/,  msg: 'Last name: letters only, 1–50 characters, no special characters.' },
    email:    { regex: /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/, msg: 'Enter a valid email address (e.g. name@domain.com).' },
    phone:    { regex: /^\+?[0-9]{10,15}$/,   msg: 'Phone: 10–15 digits only, no letters or special characters.' },
    instName: { regex: /^[a-zA-Z0-9\s\-,.&]{2,100}$/, msg: 'Institute name: 2–100 characters, letters/numbers only.' }
  };

  function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    field.style.borderColor = '#EF4444';
    let err = field.parentElement.querySelector('.field-error');
    if (!err) {
      err = document.createElement('p');
      err.className = 'field-error';
      err.style.cssText = 'color:#EF4444;font-size:12px;margin-top:4px;';
      field.parentElement.appendChild(err);
    }
    err.textContent = message;
  }

  function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    field.style.borderColor = '';
    const err = field.parentElement.querySelector('.field-error');
    if (err) err.remove();
  }

  // Live clearing of errors as user types
  if (demoForm) {
    Object.keys(rules).forEach(id => {
      const field = document.getElementById(id);
      if (!field) return;
      field.addEventListener('input', () => {
        clearError(id);
        // Block special chars inline for name fields
        if (id === 'fName' || id === 'lName') {
          field.value = field.value.replace(/[^a-zA-Z\s]/g, '');
        }
        // Block non-numeric chars for phone (allow + at start)
        if (id === 'phone') {
          field.value = field.value.replace(/(?!^\+)[^0-9]/g, '');
        }
      });
      // Enforce maxlength visually on paste
      field.addEventListener('paste', (e) => {
        setTimeout(() => {
          if (id === 'fName' || id === 'lName') {
            field.value = field.value.replace(/[^a-zA-Z\s]/g, '').substring(0, 50);
          }
          if (id === 'phone') {
            field.value = field.value.replace(/(?!^\+)[^0-9]/g, '').substring(0, 15);
          }
          if (id === 'instName') {
            field.value = field.value.substring(0, 100);
          }
        }, 0);
      });
    });

    demoForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Clear all previous errors
      Object.keys(rules).forEach(id => clearError(id));

      // Validate each field
      let valid = true;
      Object.keys(rules).forEach(id => {
        const field = document.getElementById(id);
        if (!field) return;
        const val = field.value.trim();
        if (!val || !rules[id].regex.test(val)) {
          showError(id, rules[id].msg);
          valid = false;
        }
      });

      if (!valid) return;

      // Show loading
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Submitting...</span>';

      const formData = {
        first_name:     document.getElementById('fName').value.trim(),
        last_name:      document.getElementById('lName').value.trim(),
        email:          document.getElementById('email').value.trim(),
        phone:          document.getElementById('phone').value.trim(),
        institute_name: document.getElementById('instName').value.trim(),
        students_count: document.getElementById('students').value,
        institute_type: document.getElementById('instType').value
      };

      fetch('https://mlni-api-8523.onrender.com/api/website-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => {
            throw new Error(err.details ? err.details.join('\n') : 'Submission failed. Please check your inputs.');
          });
        }
        return response.json();
      })
      .then(() => {
        demoForm.style.display = 'none';
        formSuccess.classList.add('show');
        formSuccess.style.display = 'block';
      })
      .catch(error => {
        console.error('API submission error:', error);
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Schedule My Demo';
        alert('Submission error:\n' + error.message);
      });
    });
  }

  // ── SCROLL REVEAL (data-aos) ──
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.aosDelay) || 0;
        setTimeout(() => entry.target.classList.add('visible'), delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('[data-aos]').forEach(el => revealObserver.observe(el));

  // ── COUNTER ANIMATION ──
  const statItems = document.querySelectorAll('.stat-item[data-count]');
  let statsCounted = false;
  const countUp = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix  = el.dataset.suffix || '';
    const decimal = parseInt(el.dataset.decimal) || 0;
    const numEl   = el.querySelector('.stat-num');
    const duration = 2000;
    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed  = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3);
      const current  = ease * target;
      numEl.textContent = decimal > 0
        ? current.toFixed(decimal) + suffix
        : Math.floor(current).toLocaleString('en-IN') + suffix;
      if (progress < 1) requestAnimationFrame(animate);
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
  if (statItems.length > 0) statsObserver.observe(statItems[0].closest('.stats-row'));

  // ── ACTIVE NAV LINK on Scroll ──
  const sections   = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
  const highlightNav = () => {
    const scrollY = window.scrollY + 120;
    sections.forEach(section => {
      const top    = section.offsetTop;
      const height = section.offsetHeight;
      const id     = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navAnchors.forEach(a => {
          a.classList.remove('active-link');
          if (a.getAttribute('href') === '#' + id) a.classList.add('active-link');
        });
      }
    });
  };
  window.addEventListener('scroll', highlightNav, { passive: true });

  // ── CHART BAR ANIMATION ──
  const chartObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bars = entry.target.querySelectorAll('.cb, .mc-b');
        bars.forEach((bar, i) => {
          const finalHeight = bar.style.height;
          bar.style.height = '0%';
          setTimeout(() => { bar.style.height = finalHeight; }, i * 100);
        });
        chartObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.chart-bars, .mc-bars').forEach(c => chartObserver.observe(c));

  // ── TILT EFFECT on pricing cards ──
  document.querySelectorAll('.pricing-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = (y - rect.height / 2) / 20;
      const rotateY = (rect.width / 2 - x) / 20;
      card.style.transform = card.classList.contains('popular')
        ? `scale(1.04) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
        : `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = card.classList.contains('popular') ? 'scale(1.04)' : '';
    });
  });

  // ── FEED ITEMS ANIMATION ──
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
