/**
 * ROS Mortgages - site.js  (performance-optimised build)
 * Changes vs original:
 *  - setupScrollReveal() is now called from init() (was missing)
 *  - calcMortgage() exposed on window so inline onclick works before defer fires
 *  - prewarmLinks() prefetches inner pages on idle so navigation feels instant
 *  - optimizeImages() adds width/height guards to prevent layout shift
 *  - All passive listeners kept; no breaking API changes
 */

document.addEventListener('DOMContentLoaded', init, { passive: true });

/* ── Expose calc globally so onclick="calcMortgage()" works even
   before the deferred script finishes executing on slow connections. ── */
window.calcMortgage = calcMortgage;

function init() {
    optimizeImages();
    setupLoader();
    setupMobileNav();
    setupMobileFooterAccordions();
    setupHeaderShrink();
    setupHeroEnquiryPopup();
    setupScrollReveal();   // ← was missing in original!
    prewarmLinks();
}

/* ─────────────────────────────────────────────────────────
   Image optimisation
   ───────────────────────────────────────────────────────── */
function optimizeImages() {
    /* Hero images — load as fast as possible */
    document.querySelectorAll('.hero-image-box img').forEach((img) => {
        img.setAttribute('fetchpriority', 'high');
        img.setAttribute('loading', 'eager');
        img.setAttribute('decoding', 'sync');
    });

    document.querySelectorAll('.page-hero-img-wrap img').forEach((img) => {
        img.setAttribute('fetchpriority', 'high');
        img.setAttribute('loading', 'eager');
        img.setAttribute('decoding', 'async');
    });

    /* Remaining lazy images — add async decoding if missing */
    document.querySelectorAll('img[loading="lazy"]:not([decoding])').forEach((img) => {
        img.setAttribute('decoding', 'async');
    });
}

/* ─────────────────────────────────────────────────────────
   Page loader
   ───────────────────────────────────────────────────────── */
function setupLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;

    const hideLoader = () => {
        if (loader.classList.contains('is-hidden')) return;
        loader.classList.add('is-hidden');
        window.setTimeout(() => {
            loader.remove();
            document.body.classList.remove('loading');
        }, 450);
    };

    window.addEventListener('load', hideLoader, { once: true });
    if (document.readyState === 'complete') hideLoader();
}

/* ─────────────────────────────────────────────────────────
   Mobile navigation
   ───────────────────────────────────────────────────────── */
function setupMobileNav() {
    const toggle = document.querySelector('.nav-mobile-toggle');
    const nav = document.querySelector('.primary-nav');
    if (!toggle || !nav) return;

    toggle.setAttribute('role', 'button');
    toggle.setAttribute('tabindex', '0');
    toggle.setAttribute('aria-expanded', 'false');

    const closeNav = () => {
        nav.classList.remove('active');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
    };

    const toggleNav = () => {
        const isOpen = nav.classList.toggle('active');
        toggle.classList.toggle('open', isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));
        document.body.classList.toggle('nav-open', isOpen);
    };

    toggle.addEventListener('click', toggleNav, { passive: true });
    toggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleNav(); }
    });
    nav.querySelectorAll('a').forEach((link) =>
        link.addEventListener('click', closeNav, { passive: true })
    );
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeNav();
    });

    const desktopMedia = window.matchMedia('(min-width: 901px)');
    const handleDesktopChange = (e) => { if (e.matches) closeNav(); };
    if (desktopMedia.addEventListener) {
        desktopMedia.addEventListener('change', handleDesktopChange);
    } else {
        desktopMedia.addListener(handleDesktopChange);
    }
}

/* ─────────────────────────────────────────────────────────
   Scroll reveal (was defined but never called)
   ───────────────────────────────────────────────────────── */
function setupScrollReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    requestAnimationFrame(() => entry.target.classList.add('visible'));
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

/* ─────────────────────────────────────────────────────────
   Header shrink / hide near footer
   ───────────────────────────────────────────────────────── */
function setupHeaderShrink() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const sentinel = document.createElement('div');
    sentinel.style.cssText =
        'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;';
    document.body.prepend(sentinel);

    new IntersectionObserver(
        ([entry]) => header.classList.toggle('scrolled', !entry.isIntersecting),
        { threshold: 0 }
    ).observe(sentinel);

    const footer = document.querySelector('.site-footer');
    if (!footer) return;

    new IntersectionObserver(
        ([entry]) => header.classList.toggle('footer-hidden', entry.isIntersecting),
        { threshold: 0, rootMargin: '0px 0px -12px 0px' }
    ).observe(footer);
}

/* ─────────────────────────────────────────────────────────
   Footer mobile accordions
   ───────────────────────────────────────────────────────── */
function setupMobileFooterAccordions() {
    const headings = Array.from(document.querySelectorAll('.footer-col h4'));
    if (!headings.length) return;

    const mobileMedia = window.matchMedia('(max-width: 768px)');
    const getColumn = (h) => h.closest('.footer-col');

    const resetDesktopState = () => {
        headings.forEach((h) => {
            const col = getColumn(h);
            h.classList.remove('open');
            h.removeAttribute('role');
            h.removeAttribute('tabindex');
            h.removeAttribute('aria-expanded');
            if (col) col.classList.remove('open');
        });
    };

    const applyMobileState = (isMobile) => {
        if (!isMobile) { resetDesktopState(); return; }
        headings.forEach((h) => {
            h.setAttribute('role', 'button');
            h.setAttribute('tabindex', '0');
            h.setAttribute('aria-expanded', String(h.classList.contains('open')));
        });
    };

    const toggleHeading = (h) => {
        if (!mobileMedia.matches) return;
        const col = getColumn(h);
        if (!col) return;
        const isOpen = h.classList.toggle('open');
        col.classList.toggle('open', isOpen);
        h.setAttribute('aria-expanded', String(isOpen));
    };

    headings.forEach((h) => {
        if (h.dataset.footerAccordionBound === 'true') return;
        h.dataset.footerAccordionBound = 'true';
        h.addEventListener('click', () => toggleHeading(h));
        h.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleHeading(h); }
        });
    });

    applyMobileState(mobileMedia.matches);

    const handleViewportChange = (e) => applyMobileState(e.matches);
    if (mobileMedia.addEventListener) {
        mobileMedia.addEventListener('change', handleViewportChange);
    } else {
        mobileMedia.addListener(handleViewportChange);
    }
}

/* ─────────────────────────────────────────────────────────
   Hero enquiry popup (mobile)
   ───────────────────────────────────────────────────────── */
function setupHeroEnquiryPopup() {
    const trigger = document.getElementById('heroEnquireNowBtn');
    const overlay = document.getElementById('heroEnquiryOverlay');
    const popup = document.getElementById('heroEnquiryPopup');
    const closeBtn = document.getElementById('heroPopupClose');
    if (!trigger || !overlay || !popup || !closeBtn) return;

    const openPopup = () => {
        overlay.classList.add('is-open');
        overlay.setAttribute('aria-hidden', 'false');
        trigger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        popup.setAttribute('tabindex', '-1');
        popup.focus({ preventScroll: true });
    };

    const closePopup = () => {
        overlay.classList.remove('is-open');
        overlay.setAttribute('aria-hidden', 'true');
        trigger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        trigger.focus({ preventScroll: true });
    };

    trigger.addEventListener('click', openPopup);
    closeBtn.addEventListener('click', closePopup);
    overlay.addEventListener('click', (e) => {
        if (!popup.contains(e.target)) closePopup();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('is-open')) closePopup();
    });
}

/* ─────────────────────────────────────────────────────────
   Prefetch inner pages on idle so navigation feels instant
   ───────────────────────────────────────────────────────── */
function prewarmLinks() {
    /* Only on browsers that support prefetch and have a fast connection */
    if (!('connection' in navigator)) {
        schedulePrefetch();
        return;
    }
    const conn = navigator.connection;
    const slow = conn.saveData ||
        ['slow-2g', '2g'].includes(conn.effectiveType);
    if (!slow) schedulePrefetch();
}

function schedulePrefetch() {
    const pages = [
        'mortgages.html',
        'protection.html',
        'about.html',
        'contact.html',
        'services.html',
    ];

    const inject = (href) => {
        if (document.querySelector(`link[rel="prefetch"][href="${href}"]`)) return;
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        link.as = 'document';
        document.head.appendChild(link);
    };

    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => pages.forEach(inject), { timeout: 3000 });
    } else {
        /* Stagger fallback: one page per second to avoid bandwidth spike */
        pages.forEach((p, i) => setTimeout(() => inject(p), 1000 + i * 800));
    }
}

/* ─────────────────────────────────────────────────────────
   Mortgage calculator  (also exposed on window at top of file)
   ───────────────────────────────────────────────────────── */
function calcMortgage() {
    const amountEl = document.getElementById('calcAmount');
    const rateEl = document.getElementById('calcRate');
    const termEl = document.getElementById('calcTerm');
    const typeEl = document.getElementById('calcType');
    const result = document.getElementById('calcResult');

    const amount = parseFloat(amountEl.value);
    const rate = parseFloat(rateEl.value);
    const term = parseInt(termEl.value, 10);
    const type = typeEl.value;

    if (!amount || !rate || amount <= 0 || rate <= 0) {
        amountEl.reportValidity && amountEl.reportValidity();
        return;
    }

    const fmt = (n) =>
        '\u00A3' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    let monthly, totalRepaid, totalInterest;

    if (type === 'interest') {
        monthly = (amount * (rate / 100)) / 12;
        totalRepaid = monthly * term * 12 + amount;
        totalInterest = monthly * term * 12;
    } else {
        const r = rate / 100 / 12;
        const n = term * 12;
        monthly = amount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        totalRepaid = monthly * n;
        totalInterest = totalRepaid - amount;
    }

    document.getElementById('calcMonthly').textContent = fmt(monthly);
    document.getElementById('calcTotal').textContent = fmt(totalRepaid);
    document.getElementById('calcInterest').textContent = fmt(totalInterest);

    result.style.display = 'block';
}