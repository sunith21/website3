/**
 * ROS Mortgages - site.js
 * Shared UI helpers for image loading, loader state, mobile navigation,
 * footer accordions, and calculator interactions.
 */

document.addEventListener('DOMContentLoaded', init, { passive: true });

function init() {
    optimizeImages();
    setupLoader();
    setupMobileNav();
    setupMobileFooterAccordions();
    setupHeaderShrink();
    setupHeroEnquiryPopup();
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

function setupScrollReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    requestAnimationFrame(() => {
                        entry.target.classList.add('visible');
                    });
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

function setupHeaderShrink() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const sentinel = document.createElement('div');
    sentinel.style.cssText =
        'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;';
    document.body.prepend(sentinel);

    const io = new IntersectionObserver(
        ([entry]) => {
            header.classList.toggle('scrolled', !entry.isIntersecting);
        },
        { threshold: 0 }
    );

    io.observe(sentinel);

    const footer = document.querySelector('.site-footer');
    if (!footer) return;

    const footerObserver = new IntersectionObserver(
        ([entry]) => {
            header.classList.toggle('footer-hidden', entry.isIntersecting);
        },
        {
            threshold: 0,
            rootMargin: '0px 0px -12px 0px'
        }
    );

    footerObserver.observe(footer);
}

function setupMobileFooterAccordions() {
    const headings = Array.from(document.querySelectorAll('.footer-col h4'));
    if (!headings.length) return;

    const mobileMedia = window.matchMedia('(max-width: 768px)');
    const getColumn = (heading) => heading.closest('.footer-col');

    const resetDesktopState = () => {
        headings.forEach((heading) => {
            const column = getColumn(heading);

            heading.classList.remove('open');
            heading.removeAttribute('role');
            heading.removeAttribute('tabindex');
            heading.removeAttribute('aria-expanded');

            if (column) {
                column.classList.remove('open');
            }
        });
    };

    const applyMobileState = (isMobile) => {
        if (!isMobile) {
            resetDesktopState();
            return;
        }

        headings.forEach((heading) => {
            heading.setAttribute('role', 'button');
            heading.setAttribute('tabindex', '0');
            heading.setAttribute(
                'aria-expanded',
                String(heading.classList.contains('open'))
            );
        });
    };

    const toggleHeading = (heading) => {
        if (!mobileMedia.matches) return;

        const column = getColumn(heading);
        if (!column) return;

        const isOpen = heading.classList.toggle('open');
        column.classList.toggle('open', isOpen);
        heading.setAttribute('aria-expanded', String(isOpen));
    };

    headings.forEach((heading) => {
        if (heading.dataset.footerAccordionBound === 'true') return;
        heading.dataset.footerAccordionBound = 'true';

        heading.addEventListener('click', () => {
            toggleHeading(heading);
        });

        heading.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleHeading(heading);
            }
        });
    });

    applyMobileState(mobileMedia.matches);

    const handleViewportChange = (event) => {
        applyMobileState(event.matches);
    };

    if (mobileMedia.addEventListener) {
        mobileMedia.addEventListener('change', handleViewportChange);
    } else if (mobileMedia.addListener) {
        mobileMedia.addListener(handleViewportChange);
    }
}

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

    let monthly;
    let totalRepaid;
    let totalInterest;

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
function setupHeroEnquiryPopup() {
    const trigger  = document.getElementById('heroEnquireNowBtn');
    const overlay  = document.getElementById('heroEnquiryOverlay');
    const popup    = document.getElementById('heroEnquiryPopup');
    const closeBtn = document.getElementById('heroPopupClose');

    if (!trigger || !overlay || !popup || !closeBtn) return;

    const openPopup = () => {
        overlay.classList.add('is-open');
        overlay.setAttribute('aria-hidden', 'false');
        trigger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        // Focus the popup for accessibility
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

    // Close when clicking the backdrop (outside the card)
    overlay.addEventListener('click', (event) => {
        if (!popup.contains(event.target)) {
            closePopup();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && overlay.classList.contains('is-open')) {
            closePopup();
        }
    });
}
