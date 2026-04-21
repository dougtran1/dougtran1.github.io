gsap.registerPlugin(ScrollTrigger);

gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
  // Hero: words slide up in sequence — total ~0.9s, content readable fast
  const heroWords = gsap.utils.toArray(".hero-title .word");
  gsap.set(heroWords, { yPercent: 110 });

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  tl.to(heroWords, {
    yPercent: 0,
    duration: 0.75,
    stagger: 0.08,
  }, 0);

  // Fade the supporting bits in after the headline lands
  tl.from(".hero-tag", { autoAlpha: 0, y: 10, duration: 0.5 }, 0);
  tl.from(".hero-sub, .hero-cta", { autoAlpha: 0, y: 12, duration: 0.5, stagger: 0.08 }, 0.35);

  // Section heads: quick fade + slight rise
  gsap.utils.toArray(".section-head").forEach((el) => {
    gsap.from(el, {
      autoAlpha: 0,
      y: 16,
      duration: 0.5,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        once: true,
      },
    });
  });

  // Work rows: subtle, no long stagger — reads fast
  gsap.utils.toArray(".work-item").forEach((el) => {
    gsap.from(el, {
      autoAlpha: 0,
      y: 14,
      duration: 0.45,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        once: true,
      },
    });
  });

  // Skill cards: light fade
  gsap.utils.toArray(".skill-col").forEach((el, i) => {
    gsap.from(el, {
      autoAlpha: 0,
      y: 16,
      duration: 0.5,
      delay: i * 0.06,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".skills-grid",
        start: "top 85%",
        once: true,
      },
    });
  });

  // Footer
  gsap.from(".footer-top, .footer-bottom", {
    autoAlpha: 0,
    y: 12,
    duration: 0.5,
    stagger: 0.08,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".footer",
      start: "top 90%",
      once: true,
    },
  });
});

// Reduced motion: show everything immediately
gsap.matchMedia().add("(prefers-reduced-motion: reduce)", () => {
  gsap.set(".hero-title .word", { clearProps: "all" });
});
