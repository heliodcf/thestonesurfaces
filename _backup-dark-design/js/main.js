/* ============================================
   THE STONE SURFACES — Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Scroll-triggered Reveal Animations ---
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  // --- Sticky Header Transition ---
  const header = document.querySelector('.header');
  if (header) {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        header.classList.remove('header--transparent');
        header.classList.add('header--solid');
      } else {
        header.classList.add('header--transparent');
        header.classList.remove('header--solid');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // --- Mobile Nav Toggle ---
  const navToggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Mega Menu ---
  const productsLink = document.querySelector('[data-mega-menu]');
  const megaMenu = document.querySelector('.mega-menu');
  if (productsLink && megaMenu) {
    productsLink.addEventListener('mouseenter', () => megaMenu.classList.add('active'));
    megaMenu.addEventListener('mouseenter', () => megaMenu.classList.add('active'));
    productsLink.addEventListener('mouseleave', () => {
      setTimeout(() => {
        if (!megaMenu.matches(':hover')) megaMenu.classList.remove('active');
      }, 100);
    });
    megaMenu.addEventListener('mouseleave', () => megaMenu.classList.remove('active'));
  }

  // --- Testimonial Carousel ---
  const testimonials = document.querySelectorAll('.testimonial-item');
  const dots = document.querySelectorAll('.carousel-dots .dot');
  let currentTestimonial = 0;
  let autoAdvance;

  function showTestimonial(index) {
    testimonials.forEach(t => t.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    if (testimonials[index]) testimonials[index].classList.add('active');
    if (dots[index]) dots[index].classList.add('active');
    currentTestimonial = index;
  }

  if (testimonials.length > 0) {
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        showTestimonial(i);
        resetAutoAdvance();
      });
    });

    autoAdvance = setInterval(() => {
      showTestimonial((currentTestimonial + 1) % testimonials.length);
    }, 6000);
  }

  function resetAutoAdvance() {
    clearInterval(autoAdvance);
    autoAdvance = setInterval(() => {
      showTestimonial((currentTestimonial + 1) % testimonials.length);
    }, 6000);
  }

  // --- Chat Widget ---
  const chatBtn = document.querySelector('.chat-widget-btn');
  const chatPanel = document.querySelector('.chat-panel');
  const chatClose = document.querySelector('.chat-panel-header .close-btn');

  if (chatBtn && chatPanel) {
    chatBtn.addEventListener('click', () => {
      chatPanel.classList.toggle('active');
      chatBtn.style.display = chatPanel.classList.contains('active') ? 'none' : 'flex';
    });

    if (chatClose) {
      chatClose.addEventListener('click', () => {
        chatPanel.classList.remove('active');
        chatBtn.style.display = 'flex';
      });
    }
  }

  // --- Accordion ---
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      item.classList.toggle('open');
    });
  });

  // --- Filter Sidebar Toggle ---
  document.querySelectorAll('.filter-group h4').forEach(header => {
    header.addEventListener('click', () => {
      const options = header.nextElementSibling;
      if (options) {
        options.style.display = options.style.display === 'none' ? 'flex' : 'none';
      }
    });
  });

  // --- User Toggle ---
  const userToggle = document.querySelector('.user-toggle');
  if (userToggle) {
    userToggle.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        userToggle.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // --- Product Comparison ---
  const comparisonBar = document.querySelector('.comparison-bar');
  const compItems = document.querySelector('.comparison-items');
  let compareList = [];

  document.querySelectorAll('.compare-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.product;
      if (compareList.includes(name)) {
        compareList = compareList.filter(n => n !== name);
        btn.classList.remove('active');
      } else if (compareList.length < 3) {
        compareList.push(name);
        btn.classList.add('active');
      }

      if (comparisonBar) {
        if (compareList.length > 0) {
          comparisonBar.classList.add('active');
          if (compItems) {
            compItems.innerHTML = compareList.map(n =>
              `<div class="comp-thumb" title="${n}"></div>`
            ).join('');
          }
        } else {
          comparisonBar.classList.remove('active');
        }
      }
    });
  });

  // --- Form Handling ---
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) {
        const original = submitBtn.textContent;
        submitBtn.textContent = 'Sent! We\'ll be in touch.';
        submitBtn.disabled = true;
        setTimeout(() => {
          submitBtn.textContent = original;
          submitBtn.disabled = false;
          form.reset();
        }, 3000);
      }
    });
  });

  // --- Counter Animation ---
  const counters = document.querySelectorAll('.trust-item .number');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = el.dataset.count;
        if (!target) return;
        let current = 0;
        const increment = Math.ceil(parseInt(target) / 40);
        const suffix = el.dataset.suffix || '';
        const timer = setInterval(() => {
          current += increment;
          if (current >= parseInt(target)) {
            el.textContent = target + suffix;
            clearInterval(timer);
          } else {
            el.textContent = current + suffix;
          }
        }, 30);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  // --- Hanstone Flare Parallax on Scroll ---
  const hanstoneSection = document.querySelector('.hanstone-section');
  const flareTopLeft = document.querySelector('.hanstone-flare--top-left');
  const flareBottomRight = document.querySelector('.hanstone-flare--bottom-right');

  if (hanstoneSection && flareTopLeft && flareBottomRight) {
    window.addEventListener('scroll', () => {
      const rect = hanstoneSection.getBoundingClientRect();
      const sectionHeight = hanstoneSection.offsetHeight;
      const viewportHeight = window.innerHeight;

      // Only animate when section is in view
      if (rect.bottom > 0 && rect.top < viewportHeight) {
        // Progress: 0 = section just entering bottom, 1 = section leaving top
        const progress = 1 - (rect.bottom / (viewportHeight + sectionHeight));
        // Move flares toward center as user scrolls (max 80px movement)
        const offset = progress * 80;
        flareTopLeft.style.transform = `translate(${offset}px, ${offset}px)`;
        flareBottomRight.style.transform = `translate(${-offset}px, ${-offset}px)`;
      }
    }, { passive: true });
  }

  // --- Gallery filter tabs ---
  document.querySelectorAll('.filter-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const group = tab.closest('.filter-tabs');
      group.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter;
      const grid = document.querySelector(tab.closest('.section').querySelector('.masonry-grid, .swatch-grid, .product-grid')?.tagName || '.masonry-grid');

      if (grid) {
        grid.querySelectorAll('[data-category]').forEach(item => {
          if (filter === 'all' || item.dataset.category === filter) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      }
    });
  });

});
