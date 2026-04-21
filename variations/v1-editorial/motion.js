// v1 Editorial — elegant staggered reveals, parallax on project art, serif hero word-reveal.
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
      gsap.set("[data-anim], .display .word", { autoAlpha: 1, y: 0 });
      gsap.set("[data-parallax]::after", { scale: 1 });
      return;
    }

    // Hero display: word-by-word reveal from below the line-clip.
    gsap.to(".display .word", {
      y: "0%",
      duration: 1.2,
      ease: "power3.out",
      stagger: 0.14,
      delay: 0.1
    });

    // Meta blocks + hero grid bits.
    gsap.fromTo(
      ".hero [data-anim='fade']",
      { autoAlpha: 0, y: 16 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: "power2.out",
        stagger: 0.08,
        delay: 0.3
      }
    );

    // Chapter headers.
    gsap.utils.toArray(".chapter[data-anim='fade']").forEach((el) => {
      const rule = el.querySelector(".chapter-rule");
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 85%", once: true }
      });
      tl.fromTo(el, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" });
      if (rule) {
        tl.fromTo(rule, { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 1, ease: "power3.inOut" }, "-=0.5");
      }
    });

    // Pieces: fade-in + slight y, paired with art parallax.
    gsap.utils.toArray(".piece[data-anim='piece']").forEach((el) => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 40 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 80%", once: true }
        }
      );
    });

    // Parallax on piece art pseudo-element.
    // Since ::after can't be selected via JS, we animate a CSS variable on the parent element's ::after using a proxy:
    // simpler approach — animate the parent's background-position instead, but we used ::after for the art.
    // Workaround: animate a CSS custom property --parallax-y on the parent; CSS listens to it.
    gsap.utils.toArray("[data-parallax]").forEach((el) => {
      gsap.fromTo(
        el,
        { "--parallax-y": "-8%" },
        {
          "--parallax-y": "8%",
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        }
      );
    });

    // Skill columns.
    gsap.utils.toArray(".skill-col[data-anim='fade']").forEach((el, i) => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: "power2.out",
          delay: i * 0.08,
          scrollTrigger: { trigger: el, start: "top 88%", once: true }
        }
      );
    });

    // Contact section.
    gsap.utils.toArray(".contact [data-anim='fade']").forEach((el, i) => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          delay: i * 0.12,
          scrollTrigger: { trigger: el, start: "top 88%", once: true }
        }
      );
    });
  }
);
