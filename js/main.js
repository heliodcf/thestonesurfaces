/* ============================================
   THE STONE SURFACES — Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Phone Click Tracking for Google Ads via GTM ---
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', () => {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'phone_click', phone_number: link.href });
    });
  });

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

  // --- Chat Widget with n8n Integration ---
  const chatBtn = document.querySelector('.chat-widget-btn');
  const chatPanel = document.querySelector('.chat-panel');
  const chatClose = document.querySelector('.chat-panel-header .close-btn');
  const chatMessages = document.querySelector('.chat-messages');
  const chatInput = document.querySelector('.chat-input input');
  const chatSendBtn = document.querySelector('.chat-input button');
  const n8nWidget = document.getElementById('n8n-chat-widget');
  const webhookUrl = n8nWidget ? n8nWidget.dataset.webhookUrl : null;
  const sessionId = 'tss-' + Math.random().toString(36).substring(2, 12) + '-' + Date.now();

  if (chatBtn && chatPanel) {
    chatBtn.addEventListener('click', () => {
      const wasActive = chatPanel.classList.contains('active');
      chatPanel.classList.toggle('active');
      chatBtn.style.display = chatPanel.classList.contains('active') ? 'none' : 'flex';
      if (chatPanel.classList.contains('active') && chatInput) chatInput.focus();
      // Fire conversion event on chat open for Google Ads via GTM
      if (!wasActive) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'chat_open' });
      }
    });

    if (chatClose) {
      chatClose.addEventListener('click', () => {
        chatPanel.classList.remove('active');
        chatBtn.style.display = 'flex';
      });
    }
  }

  // Mobile keyboard: adjust chat panel height when virtual keyboard opens/closes
  if (chatPanel && window.visualViewport) {
    const adjustChatForKeyboard = () => {
      if (!chatPanel.classList.contains('active')) return;
      const viewportHeight = window.visualViewport.height;
      const windowHeight = window.innerHeight;
      const keyboardHeight = windowHeight - viewportHeight;
      if (keyboardHeight > 100) {
        // Keyboard is open
        chatPanel.style.height = (viewportHeight - 20) + 'px';
        chatPanel.style.maxHeight = (viewportHeight - 20) + 'px';
        chatPanel.style.bottom = '0';
      } else {
        // Keyboard is closed
        chatPanel.style.height = '';
        chatPanel.style.maxHeight = '';
        chatPanel.style.bottom = '';
      }
    };
    window.visualViewport.addEventListener('resize', adjustChatForKeyboard);
    window.visualViewport.addEventListener('scroll', adjustChatForKeyboard);
  }

  // Quick action buttons
  document.querySelectorAll('.quick-actions button').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.textContent.trim();
      if (chatInput) {
        chatInput.value = text;
        sendChatMessage();
      }
    });
  });

  // Send on Enter or click
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    });
  }
  if (chatSendBtn) {
    chatSendBtn.addEventListener('click', sendChatMessage);
  }

  function appendMessage(text, sender) {
    if (!chatMessages) return null;
    // Remove quick actions after first user message
    const quickActions = chatMessages.querySelector('.quick-actions');
    if (quickActions && sender === 'user') quickActions.remove();

    const msg = document.createElement('div');
    msg.className = 'chat-message ' + sender;
    msg.textContent = text;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return msg;
  }

  function showTypingIndicator() {
    if (!chatMessages) return null;
    const indicator = document.createElement('div');
    indicator.className = 'chat-message bot typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return indicator;
  }

  async function sendChatMessage() {
    if (!chatInput || !webhookUrl) return;
    const text = chatInput.value.trim();
    if (!text) return;

    // Show user message
    appendMessage(text, 'user');
    chatInput.value = '';
    chatInput.disabled = true;
    if (chatSendBtn) chatSendBtn.disabled = true;

    // Show typing indicator
    const typing = showTypingIndicator();

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendMessage',
          chatInput: text,
          sessionId: sessionId
        })
      });

      // Remove typing indicator
      if (typing) typing.remove();

      if (!res.ok) {
        appendMessage('Sorry, I\'m having trouble connecting. Please call us at 1-866-960-8579.', 'bot');
        return;
      }

      // Handle streaming response (n8n Chat Trigger sends newline-delimited JSON)
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let botMsg = appendMessage('', 'bot');
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.trim());

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.type === 'item' && parsed.content) {
              fullText += parsed.content;
              if (botMsg) botMsg.textContent = fullText;
            } else if (parsed.type === 'text' && parsed.text) {
              fullText += parsed.text;
              if (botMsg) botMsg.textContent = fullText;
            } else if (parsed.output) {
              // Non-streaming fallback (single JSON response)
              fullText = parsed.output;
              if (botMsg) botMsg.textContent = fullText;
            }
          } catch (e) {
            // Line might not be JSON — could be raw text
            if (line.trim() && !line.startsWith('{')) {
              fullText += line;
              if (botMsg) botMsg.textContent = fullText;
            }
          }
        }

        if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
      }

      // Fallback if no text was captured
      if (!fullText.trim() && botMsg) {
        botMsg.textContent = 'I\'m here to help! Could you rephrase your question?';
      }

    } catch (err) {
      if (typing) typing.remove();
      appendMessage('Connection error. Please try again or call us at 1-866-960-8579.', 'bot');
    } finally {
      if (chatInput) chatInput.disabled = false;
      if (chatSendBtn) chatSendBtn.disabled = false;
      if (chatInput) chatInput.focus();
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

  // --- Statement Strip Reveal ---
  const statementStrip = document.querySelector('.statement-strip');
  if (statementStrip) {
    const statementObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          statementObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    statementObserver.observe(statementStrip);
  }

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
