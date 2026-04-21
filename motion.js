// Maximalist — scroll-pinned horizontal project scroll, infinite marquee, bold hero reveal.
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
      gsap.set("[data-anim], .hero-title .word, .footer-huge .word", { autoAlpha: 1, y: 0 });
      return;
    }

    // Hero title — slammed up from below line-clip.
    gsap.to(".hero-title .word", {
      y: "0%",
      duration: 1.1,
      ease: "expo.out",
      stagger: 0.1,
      delay: 0.1
    });

    // Hero fades.
    gsap.fromTo(
      ".hero [data-anim='fade']",
      { autoAlpha: 0, y: 20 },
      { autoAlpha: 1, y: 0, duration: 0.9, ease: "power2.out", stagger: 0.12, delay: 0.3 }
    );

    // Marquee — infinite horizontal scroll via GSAP.
    const track = document.querySelector(".marquee-track");
    if (track) {
      const trackWidth = track.scrollWidth / 2;
      gsap.to(track, {
        x: -trackWidth,
        duration: 30,
        ease: "none",
        repeat: -1
      });
    }

    // Horizontal work pin + scrub.
    const hTrack = document.querySelector(".h-track");
    const hPin = document.querySelector(".h-work-pin");
    if (hTrack && hPin) {
      const distance = () => hTrack.scrollWidth - window.innerWidth + 160;
      gsap.to(hTrack, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: hPin,
          start: "top top",
          end: () => "+=" + distance(),
          pin: true,
          pinType: "fixed",
          anticipatePin: 1,
          scrub: 0.8,
          fastScrollEnd: true,
          invalidateOnRefresh: true
        }
      });
    }

    // Skills tiles — staggered pop-in.
    gsap.utils.toArray(".tile[data-anim='tile']").forEach((el, i) => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 60, rotate: -1 },
        {
          autoAlpha: 1,
          y: 0,
          rotate: 0,
          duration: 0.9,
          ease: "back.out(1.4)",
          delay: i * 0.1,
          scrollTrigger: { trigger: ".skill-tiles", start: "top 80%", once: true }
        }
      );
    });

    // Skills head fade.
    gsap.fromTo(
      ".skills-head[data-anim='fade']",
      { autoAlpha: 0, y: 20 },
      { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out", scrollTrigger: { trigger: ".skills-head", start: "top 85%", once: true } }
    );

    // Footer huge text slam-up.
    ScrollTrigger.create({
      trigger: ".footer-huge",
      start: "top 80%",
      once: true,
      onEnter: () => {
        gsap.to(".footer-huge .word", {
          y: "0%",
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.12
        });
      }
    });

    // Sticky CTA fade in after scroll.
    gsap.set(".sticky-cta", { autoAlpha: 0, y: 20 });
    gsap.to(".sticky-cta", {
      autoAlpha: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: { trigger: ".marquee", start: "top 80%", toggleActions: "play none none reverse" }
    });
  }
);

// Refresh ScrollTrigger after fonts load (positions can shift when Archivo Black swaps in).
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}
window.addEventListener("load", () => ScrollTrigger.refresh());

// Resize handling — pin + scrub doesn't recover gracefully from a mid-pin geometry change,
// so on a meaningful width change scroll to top and reload.
let lastWidth = window.innerWidth;
let resizeTimer;
window.addEventListener("resize", () => {
  if (Math.abs(window.innerWidth - lastWidth) < 50) return;
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    window.scrollTo(0, 0);
    window.location.reload();
  }, 300);
});
