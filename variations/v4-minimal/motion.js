// v4 Minimal — barely-there motion. Subtle autoAlpha fades with a touch of y-offset.
// Honors prefers-reduced-motion via gsap.matchMedia().

document.documentElement.classList.add("js");
gsap.registerPlugin(ScrollTrigger);

const mm = gsap.matchMedia();

mm.add(
  {
    reduceMotion: "(prefers-reduced-motion: reduce)",
    normal: "(prefers-reduced-motion: no-preference)"
  },
  (context) => {
    const { reduceMotion } = context.conditions;

    if (reduceMotion) {
      // No animation — just reveal everything.
      gsap.set("[data-anim]", { autoAlpha: 1, y: 0 });
      return;
    }

    // Hero: stagger the top-to-bottom fade.
    gsap.from(".hero [data-anim='fade']", {
      autoAlpha: 0,
      y: 14,
      duration: 0.9,
      ease: "power2.out",
      stagger: 0.12,
      onStart: () => gsap.set(".hero [data-anim='fade']", { autoAlpha: 0 })
    });
    gsap.to(".hero [data-anim='fade']", {
      autoAlpha: 1,
      y: 0,
      duration: 0.9,
      ease: "power2.out",
      stagger: 0.12
    });

    // Section heads fade in when scrolled into view.
    gsap.utils.toArray(".section-head[data-anim='fade']").forEach((el) => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 16 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true }
        }
      );
    });

    // Work list rows — subtle row-by-row reveal.
    gsap.utils.toArray(".work-item[data-anim='row']").forEach((el, i) => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 12 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          delay: i * 0.03,
          scrollTrigger: { trigger: el, start: "top 88%", once: true }
        }
      );
    });

    // Skill columns fade.
    gsap.utils.toArray(".skill-col[data-anim='fade']").forEach((el, i) => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 10 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          delay: i * 0.08,
          scrollTrigger: { trigger: el, start: "top 88%", once: true }
        }
      );
    });

    // Footer fade.
    gsap.fromTo(
      ".footer[data-anim='fade']",
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: { trigger: ".footer", start: "top 95%", once: true }
      }
    );
  }
);
