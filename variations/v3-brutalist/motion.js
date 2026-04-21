// v3 Brutalist — typing effect on hero, ease: "none" everywhere, glitch flickers, section snap-hints.
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

    // Typing effect for hero name. Works even with reduced motion (just instant).
    const nameEl = document.querySelector("[data-type]");
    if (nameEl) {
      const fullHTML = nameEl.innerHTML;
      // Extract plain text before cursor span.
      const plain = nameEl.textContent.replace(/_$/, "");
      nameEl.innerHTML = '<span class="typed"></span><span class="cursor">_</span>';
      const typed = nameEl.querySelector(".typed");
      nameEl.style.visibility = "visible";

      if (reduceMotion) {
        typed.textContent = plain;
      } else {
        // Type one char at a time using a gsap tween with onUpdate.
        const obj = { i: 0 };
        gsap.to(obj, {
          i: plain.length,
          duration: plain.length * 0.045,
          ease: "none",
          delay: 0.2,
          onUpdate: () => {
            typed.textContent = plain.slice(0, Math.floor(obj.i));
          }
        });
      }
    }

    if (reduceMotion) return;

    // Block entrances — snap-like, no easing. Instant fade at thresholds.
    gsap.utils.toArray(".block").forEach((block) => {
      const children = block.querySelectorAll("p, h2, .ls, .work-list, .stack, .ascii");
      gsap.fromTo(
        children,
        { autoAlpha: 0, x: -8 },
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.1,
          ease: "none",
          stagger: 0.04,
          scrollTrigger: { trigger: block, start: "top 85%", once: true }
        }
      );
    });

    // Rows — slide in from left on scroll, stepwise (no easing).
    gsap.utils.toArray(".work-list li").forEach((el, i) => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, x: -12 },
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.15,
          ease: "none",
          delay: i * 0.04,
          scrollTrigger: { trigger: el, start: "top 90%", once: true }
        }
      );
    });

    // Glitch flicker on row hover — a quick x/y jitter.
    document.querySelectorAll(".row").forEach((row) => {
      row.addEventListener("mouseenter", () => {
        gsap.fromTo(
          row,
          { x: 0 },
          { x: 4, duration: 0.04, yoyo: true, repeat: 3, ease: "none", overwrite: true, onComplete: () => gsap.set(row, { x: 0 }) }
        );
      });
    });

    // ASCII box flicker — occasional glitch.
    const ascii = document.querySelector(".ascii");
    if (ascii) {
      const flicker = () => {
        gsap.fromTo(
          ascii,
          { opacity: 0.3 },
          { opacity: 1, duration: 0.08, ease: "none" }
        );
        gsap.delayedCall(2 + Math.random() * 5, flicker);
      };
      gsap.delayedCall(3, flicker);
    }
  }
);
