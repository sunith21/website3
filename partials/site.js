document.addEventListener('DOMContentLoaded', function() {
    const mobileToggle = document.querySelector('.nav-mobile-toggle');
    const primaryNav = document.querySelector('.primary-nav');

    if (mobileToggle && primaryNav) {
        mobileToggle.addEventListener('click', function() {
            primaryNav.classList.toggle('active');
            mobileToggle.classList.toggle('open');
            
            // Allow styling the toggle into a cross.
            const expanded = mobileToggle.getAttribute('aria-expanded') === 'true';
            mobileToggle.setAttribute('aria-expanded', !expanded);
        });
    }

    // ── Scroll Reveal ───────────────────────────────────────────
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target); // animate once
                }
            });
        },
        { threshold: 0.12 }
    );

    document.querySelectorAll('.reveal').forEach((el) => {
        revealObserver.observe(el);
    });
});

