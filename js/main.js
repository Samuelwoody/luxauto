/* ============================================
   PRISTINE Auto Detail - Main JavaScript
   Professional Car Detailing Landing Page
   ============================================ */

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initAOS();
    initNavbar();
    initPromoBar();
    initFAQ();
    initForm();
    initServiceButtons();
    initDiscountTimer();
    initDatePicker();
    initSmoothScroll();
});

// ==========================================
// PRELOADER
// ==========================================
function initPreloader() {
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden');
            document.body.style.overflow = '';
        }, 1800);
    });
    // Fallback: hide after 4s regardless
    setTimeout(() => {
        preloader.classList.add('hidden');
        document.body.style.overflow = '';
    }, 4000);
}

// ==========================================
// AOS (Animate on Scroll)
// ==========================================
function initAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 700,
            easing: 'ease-out-cubic',
            once: true,
            offset: 50,
            disable: window.innerWidth < 768 ? 'phone' : false
        });
    }
}

// ==========================================
// NAVBAR
// ==========================================
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    let lastScroll = 0;

    // Scroll behavior
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });

    // Mobile toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('open');
    });

    // Close mobile menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('open');
        });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
            navToggle.classList.remove('active');
            navLinks.classList.remove('open');
        }
    });
}

// ==========================================
// PROMO BAR
// ==========================================
function initPromoBar() {
    const promoBar = document.getElementById('promo-bar');
    const promoClose = promoBar.querySelector('.promo-close');
    const navbar = document.getElementById('navbar');

    // Show promo bar after a delay
    setTimeout(() => {
        if (!sessionStorage.getItem('promoBarClosed')) {
            promoBar.classList.add('visible');
            navbar.classList.add('with-promo');
        }
    }, 2000);

    promoClose.addEventListener('click', () => {
        promoBar.classList.remove('visible');
        promoBar.classList.add('hidden-bar');
        navbar.classList.remove('with-promo');
        sessionStorage.setItem('promoBarClosed', 'true');
    });
}

// ==========================================
// FAQ ACCORDION
// ==========================================
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');
            
            // Close all
            faqItems.forEach(i => i.classList.remove('open'));
            
            // Toggle current
            if (!isOpen) {
                item.classList.add('open');
            }
        });
    });
}

// ==========================================
// MULTI-STEP FORM
// ==========================================
let currentStep = 1;

function initForm() {
    const form = document.getElementById('bookingForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitForm();
    });
}

function nextStep(step) {
    // Validate current step
    if (!validateStep(currentStep)) return;
    
    currentStep = step;
    showStep(step);
    
    // Update summary on step 3
    if (step === 3) {
        updateSummary();
    }
}

function prevStep(step) {
    currentStep = step;
    showStep(step);
}

function showStep(step) {
    // Hide all panels
    document.querySelectorAll('.form-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Show target panel
    const targetPanel = document.getElementById('step' + step);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }
    
    // Update indicators
    document.querySelectorAll('.form-step-indicator').forEach(indicator => {
        const indicatorStep = parseInt(indicator.dataset.step);
        indicator.classList.remove('active', 'completed');
        
        if (indicatorStep === step) {
            indicator.classList.add('active');
        } else if (indicatorStep < step) {
            indicator.classList.add('completed');
        }
    });
    
    // Scroll to form
    document.getElementById('reservar').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function validateStep(step) {
    if (step === 1) {
        const vehicleType = document.querySelector('input[name="tipoVehiculo"]:checked');
        const condition = document.querySelector('input[name="estadoTapiceria"]:checked');
        
        if (!vehicleType) {
            showToast('Selecciona el tipo de vehículo', 'error');
            return false;
        }
        if (!condition) {
            showToast('Selecciona el estado de la tapicería', 'error');
            return false;
        }
        return true;
    }
    
    if (step === 2) {
        const service = document.querySelector('input[name="servicio"]:checked');
        const date = document.getElementById('fechaPreferida').value;
        
        if (!service) {
            showToast('Selecciona un servicio', 'error');
            return false;
        }
        if (!date) {
            showToast('Selecciona una fecha preferida', 'error');
            return false;
        }
        return true;
    }
    
    return true;
}

// ==========================================
// SERVICE PRICES
// ==========================================
const servicePrices = {
    'Express': 39,
    'Esencial': 69,
    'Premium': 109,
    'Detailing Pro': 159,
    'Integral VIP': 229
};

const vehicleSurcharges = {
    'Turismo': 0,
    'SUV/Todoterreno': 15,
    'Monovolumen': 20,
    'Furgoneta': 25
};

// ==========================================
// FORM SUMMARY
// ==========================================
function updateSummary() {
    const summary = document.getElementById('formSummary');
    const service = document.querySelector('input[name="servicio"]:checked');
    const vehicleType = document.querySelector('input[name="tipoVehiculo"]:checked');
    const date = document.getElementById('fechaPreferida').value;
    
    if (!service || !vehicleType || !date) return;
    
    const basePrice = servicePrices[service.value] || 0;
    const surcharge = vehicleSurcharges[vehicleType.value] || 0;
    const subtotal = basePrice + surcharge;
    const hasDiscount = isEligibleForDiscount(date);
    const discount = hasDiscount ? Math.round(subtotal * 0.15) : 0;
    const total = subtotal - discount;
    
    let html = `<h4><i class="fas fa-receipt"></i> Resumen de tu solicitud</h4>`;
    html += `<div class="summary-row"><span class="summary-label">Servicio</span><span class="summary-value">${service.value}</span></div>`;
    html += `<div class="summary-row"><span class="summary-label">Precio base</span><span class="summary-value">${basePrice}€</span></div>`;
    
    if (surcharge > 0) {
        html += `<div class="summary-row"><span class="summary-label">Supl. ${vehicleType.value}</span><span class="summary-value">+${surcharge}€</span></div>`;
    }
    
    if (hasDiscount) {
        html += `<div class="summary-row"><span class="summary-label">🎉 Dto. 15% (reserva anticipada)</span><span class="summary-value summary-discount">-${discount}€</span></div>`;
    }
    
    html += `<div class="summary-row summary-total"><span class="summary-label">Precio estimado</span><span class="summary-value">${total}€</span></div>`;
    
    summary.innerHTML = html;
    summary.classList.add('visible');
}

// ==========================================
// DISCOUNT LOGIC
// ==========================================
function isEligibleForDiscount(dateStr) {
    if (!dateStr) return false;
    const selectedDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = selectedDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 7;
}

function initDatePicker() {
    const dateInput = document.getElementById('fechaPreferida');
    const hint = document.getElementById('discountHint');
    
    // Set min date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];
    
    dateInput.addEventListener('change', () => {
        const eligible = isEligibleForDiscount(dateInput.value);
        if (eligible) {
            hint.innerHTML = '<i class="fas fa-check-circle"></i> ¡Genial! Se aplicará un <strong>15% de descuento</strong> por reserva anticipada.';
            hint.style.color = '#10B981';
        } else if (dateInput.value) {
            hint.innerHTML = '<i class="fas fa-info-circle"></i> Reserva con 7 días de antelación para obtener un 15% de descuento.';
            hint.style.color = '#C9A84C';
        }
    });
}

// ==========================================
// SERVICE BUTTONS (from service cards)
// ==========================================
function initServiceButtons() {
    document.querySelectorAll('[data-service]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const service = btn.dataset.service;
            
            // Pre-select the service in the form
            const serviceRadio = document.querySelector(`input[name="servicio"][value="${service}"]`);
            if (serviceRadio) {
                serviceRadio.checked = true;
            }
            
            // Scroll to booking section
            document.getElementById('reservar').scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// ==========================================
// DISCOUNT COUNTDOWN TIMER
// ==========================================
function initDiscountTimer() {
    // Set end of month as deadline
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    function updateTimer() {
        const now = new Date();
        const diff = endOfMonth - now;
        
        if (diff <= 0) return;
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        const daysEl = document.getElementById('timerDays');
        const hoursEl = document.getElementById('timerHours');
        const minsEl = document.getElementById('timerMins');
        
        if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minsEl) minsEl.textContent = String(mins).padStart(2, '0');
    }
    
    updateTimer();
    setInterval(updateTimer, 60000);
}

// ==========================================
// FORM SUBMISSION → WhatsApp redirect
// ==========================================
async function submitForm() {
    const form = document.getElementById('bookingForm');
    const submitBtn = form.querySelector('.btn-submit');
    
    // Validate step 3
    const nombre = document.getElementById('nombre').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const email = document.getElementById('email').value.trim();
    const zona = document.getElementById('zona').value;
    const privacidad = document.getElementById('privacidad').checked;
    
    if (!nombre || !telefono || !email || !zona) {
        showToast('Por favor, completa todos los campos obligatorios', 'error');
        return;
    }
    
    if (!privacidad) {
        showToast('Debes aceptar la política de privacidad', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('El email no parece válido', 'error');
        return;
    }
    
    // Collect all data
    const service = document.querySelector('input[name="servicio"]:checked');
    const vehicleType = document.querySelector('input[name="tipoVehiculo"]:checked');
    const condition = document.querySelector('input[name="estadoTapiceria"]:checked');
    const date = document.getElementById('fechaPreferida').value;
    const comments = document.getElementById('comentarios').value;
    const hasPets = document.getElementById('tieneMascotas').checked;
    const hasDiscount = isEligibleForDiscount(date);
    
    // Calculate price
    const basePrice = servicePrices[service ? service.value : ''] || 0;
    const surcharge = vehicleSurcharges[vehicleType ? vehicleType.value : ''] || 0;
    const subtotal = basePrice + surcharge;
    const discount = hasDiscount ? Math.round(subtotal * 0.15) : 0;
    const total = subtotal - discount;
    
    // Format date nicely
    const dateFormatted = date ? new Date(date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'No especificada';
    
    const leadData = {
        nombre: nombre,
        telefono: telefono,
        email: email,
        tipo_vehiculo: vehicleType ? vehicleType.value : '',
        servicio: service ? service.value : '',
        zona: zona,
        fecha_preferida: date,
        comentarios: comments,
        estado_tapiceria: condition ? condition.value : '',
        tiene_mascotas: hasPets,
        descuento_aplicado: hasDiscount,
        estado_lead: 'Nuevo'
    };
    
    // UI feedback
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando a WhatsApp...';
    
    // Save to database (background, non-blocking)
    try {
        fetch('tables/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(leadData)
        }).catch(() => {}); // silent fail — WhatsApp is the priority
    } catch (e) {}
    
    // Build WhatsApp message
    const waMessage = 
`¡Hola Alex! 👋 Quiero pedir presupuesto a través de la web de *LuxAuto Detailing*.

📋 *DATOS DEL SERVICIO*
━━━━━━━━━━━━━━━━
🔧 Servicio: *${service ? service.value : ''}*
🚗 Vehículo: *${vehicleType ? vehicleType.value : ''}*
🪑 Estado tapicería: *${condition ? condition.value : ''}*
🐾 Mascotas: *${hasPets ? 'Sí' : 'No'}*
📅 Fecha preferida: *${dateFormatted}*
${hasDiscount ? '🎉 *¡Descuento 15% aplicado por reserva anticipada!*' : ''}

💰 *Precio estimado: ${total}€*${hasDiscount ? ` (antes ${subtotal}€)` : ''}${surcharge > 0 ? ` (incluye suplemento ${vehicleType.value})` : ''}

👤 *MIS DATOS*
━━━━━━━━━━━━━━━━
Nombre: ${nombre}
Teléfono: ${telefono}
Email: ${email}
Zona: ${zona}
${comments ? `\n💬 Notas: ${comments}` : ''}

¿Cuándo podemos confirmar la cita? 😊`;

    // Encode and open WhatsApp
    const waUrl = `https://wa.me/34643028386?text=${encodeURIComponent(waMessage)}`;
    
    // Show success state in form
    document.querySelectorAll('.form-panel').forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none';
    });
    document.querySelector('.form-steps').style.display = 'none';
    
    const successPanel = document.getElementById('stepSuccess');
    successPanel.style.display = 'block';
    successPanel.classList.add('active');
    
    showToast('¡Redirigiendo a WhatsApp!', 'success');
    
    // Small delay for UX, then redirect
    setTimeout(() => {
        window.open(waUrl, '_blank');
    }, 600);
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;
    
    // Style the toast
    Object.assign(toast.style, {
        position: 'fixed',
        top: '100px',
        right: '24px',
        zIndex: '10001',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '14px 24px',
        borderRadius: '12px',
        fontSize: '0.9rem',
        fontWeight: '600',
        fontFamily: "'Inter', sans-serif",
        boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
        transform: 'translateX(120%)',
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        maxWidth: '400px'
    });
    
    if (type === 'success') {
        toast.style.background = '#10B981';
        toast.style.color = '#fff';
    } else if (type === 'error') {
        toast.style.background = '#EF4444';
        toast.style.color = '#fff';
    } else {
        toast.style.background = '#0A1628';
        toast.style.color = '#C9A84C';
    }
    
    document.body.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
    });
    
    // Remove after delay
    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

// ==========================================
// SMOOTH SCROLL
// ==========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ==========================================
// INTERSECTION OBSERVER FOR STATS
// ==========================================
const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateStats(entry.target);
            statObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

document.querySelectorAll('.stat-card').forEach(card => {
    statObserver.observe(card);
});

function animateStats(card) {
    const numEl = card.querySelector('.stat-number');
    if (!numEl) return;
    
    const text = numEl.textContent;
    const match = text.match(/[\d.]+/);
    if (!match) return;
    
    const target = parseFloat(match[0]);
    const prefix = text.substring(0, text.indexOf(match[0]));
    const suffix = text.substring(text.indexOf(match[0]) + match[0].length);
    const isDecimal = match[0].includes('.');
    const duration = 1500;
    const start = performance.now();
    
    function update(timestamp) {
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out
        const current = target * eased;
        
        if (isDecimal) {
            numEl.innerHTML = prefix + current.toFixed(1) + suffix;
        } else {
            numEl.innerHTML = prefix + Math.round(current) + suffix;
        }
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            numEl.innerHTML = text; // Restore original including HTML
        }
    }
    
    requestAnimationFrame(update);
}
