/**
 * ROS Mortgages — site.js
 * Performance-optimised scroll, reveal, and UI interactions.
 * All scroll behaviour uses IntersectionObserver (no scroll event listeners).
 */

/* ── Utility: run after DOM is fully parsed ────────────────── */
document.addEventListener('DOMContentLoaded', init, { passive: true });

function init() {
    optimizeImages();
    setupLoader();
    setupMobileNav();
    setupHeaderShrink();
}

function optimizeImages() {
    document
        .querySelectorAll('.hero-image-box img')
        .forEach((img) => {
            img.setAttribute('fetchpriority', 'high');
            img.setAttribute('loading', 'eager');
            img.setAttribute('decoding', 'sync');
        });

    document
        .querySelectorAll('.page-hero-img-wrap img')
        .forEach((img) => {
            img.setAttribute('fetchpriority', 'high');
            img.setAttribute('loading', 'eager');
            img.setAttribute('decoding', 'async');
        });

    document
        .querySelectorAll('img[loading="lazy"]:not([decoding])')
        .forEach((img) => {
            img.setAttribute('decoding', 'async');
        });
}

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

    if (document.readyState === 'complete') {
        hideLoader();
    }
}

/* ── Mobile Navigation ─────────────────────────────────────── */
function setupMobileNav() {
    const toggle = document.querySelector('.nav-mobile-toggle');
    const nav    = document.querySelector('.primary-nav');
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

    toggle.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleNav();
        }
    });

    nav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeNav, { passive: true });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeNav();
        }
    });

    const desktopMedia = window.matchMedia('(min-width: 901px)');
    const handleDesktopChange = (event) => {
        if (event.matches) {
            closeNav();
        }
    };

    if (desktopMedia.addEventListener) {
        desktopMedia.addEventListener('change', handleDesktopChange);
    } else if (desktopMedia.addListener) {
        desktopMedia.addListener(handleDesktopChange);
    }
}

/* ── Scroll Reveal — IntersectionObserver (no scroll events) ─ */
function setupScrollReveal() {
    // Bail early if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // requestAnimationFrame keeps the class toggle on the
                    // compositor thread for a smooth 60 fps paint.
                    requestAnimationFrame(() => {
                        entry.target.classList.add('visible');
                    });
                    observer.unobserve(entry.target); // fire once only
                }
            });
        },
        {
            threshold: 0.1,          // trigger when 10% is visible
            rootMargin: '0px 0px -40px 0px' // slightly early trigger
        }
    );

    // Single querySelectorAll — no repeated DOM queries in a loop
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

/* ── Header Shrink on Scroll ────────────────────────────────── */
// Uses a sentinel pixel div + IntersectionObserver instead of a
// scroll event listener — zero jank, no layout thrashing.
function setupHeaderShrink() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    // Create a 1px tall sentinel at the very top of the page
    const sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;';
    document.body.prepend(sentinel);

    const io = new IntersectionObserver(
        ([entry]) => {
            header.classList.toggle('scrolled', !entry.isIntersecting);
        },
        { threshold: 0 }
    );
    io.observe(sentinel);
}

/* ── Mortgage Calculator ─────────────────────────────────────
   Standalone global function — called from onclick in HTML.    */
function calcMortgage() {
    const amountEl = document.getElementById('calcAmount');
    const rateEl   = document.getElementById('calcRate');
    const termEl   = document.getElementById('calcTerm');
    const typeEl   = document.getElementById('calcType');
    const result   = document.getElementById('calcResult');

    const amount = parseFloat(amountEl.value);
    const rate   = parseFloat(rateEl.value);
    const term   = parseInt(termEl.value, 10);
    const type   = typeEl.value;

    if (!amount || !rate || amount <= 0 || rate <= 0) {
        amountEl.reportValidity && amountEl.reportValidity();
        return;
    }

    const fmt = (n) =>
        '£' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    let monthly, totalRepaid, totalInterest;

    if (type === 'interest') {
        monthly       = (amount * (rate / 100)) / 12;
        totalRepaid   = monthly * term * 12 + amount;
        totalInterest = monthly * term * 12;
    } else {
        const r = rate / 100 / 12;
        const n = term * 12;
        monthly       = amount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        totalRepaid   = monthly * n;
        totalInterest = totalRepaid - amount;
    }

    document.getElementById('calcMonthly').textContent  = fmt(monthly);
    document.getElementById('calcTotal').textContent    = fmt(totalRepaid);
    document.getElementById('calcInterest').textContent = fmt(totalInterest);

    // Use display flex so the result animates in via CSS
    result.style.display = 'block';
}

/* ── Preloader ───────────────────────────────────────── */
