// Content that rises softly into view as the visitor scrolls, shared by the Gallery and the homepage. Timings
// and easing are the motion tokens in tokens.css. Content is shown by default and only starts hidden once its
// animation runs, so no page depends on this script to be seen.

// Read when each motion starts, so turning "reduce motion" on takes effect without a reload.
export const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
// A duration token in milliseconds, whether it is written in ms or s.
const milliseconds = (name: string) => {
  const value = token(name);
  return value.endsWith("ms") ? parseFloat(value) : parseFloat(value) * 1000;
};

/** Animates one element into view, starting after `delay` milliseconds. */
export type Reveal = (element: HTMLElement, delay: number) => void;

/** Fades the element in as it rises into place. */
export const rise: Reveal = (element, delay) => {
  element.animate(
    { opacity: [0, 1], transform: ["translateY(1.5rem)", "none"] },
    { delay, duration: milliseconds("--duration-rise"), easing: token("--ease-settle"), fill: "backwards" },
  );
};

/** Rises like `rise`, while the element's photo settles into its arch. */
export const riseWithPhoto: Reveal = (element, delay) => {
  rise(element, delay);
  element
    .querySelector("img")
    ?.animate(
      { transform: ["scale(1.06)", "none"] },
      { delay, duration: milliseconds("--duration-settle"), easing: token("--ease-settle"), fill: "backwards" },
    );
};

/**
 * Reveals each element once, the first time it scrolls into view. Elements arriving together are staggered,
 * up to a short cap so a long row never keeps anyone waiting. Under "reduce motion" nothing moves.
 * Returns `stop`, which leaves any element not yet revealed simply shown.
 */
export function revealOnScroll(elements: HTMLElement[], reveal: Reveal): { stop: () => void } {
  const revealTogether = (arriving: HTMLElement[]) => {
    if (reduceMotion.matches) return;
    const stagger = milliseconds("--stagger");
    arriving.forEach((element, index) => reveal(element, Math.min(index, 4) * stagger));
  };

  const arrivals = new IntersectionObserver(
    (entries) => {
      const arriving = entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target as HTMLElement);
      for (const element of arriving) arrivals.unobserve(element);
      revealTogether(arriving);
    },
    // Starts just before an element scrolls on screen, so it is already held back when it appears.
    { rootMargin: "0px 0px 10% 0px" },
  );

  if (!reduceMotion.matches) {
    // Elements already on screen start straight away, before the first observer callback, so they don't
    // flash in fully shown first.
    const onScreen = elements.filter((element) => {
      const { top, bottom } = element.getBoundingClientRect();
      return !element.hidden && top < innerHeight && bottom > 0;
    });
    revealTogether(onScreen);
    for (const element of elements) if (!onScreen.includes(element)) arrivals.observe(element);
  }

  return { stop: () => arrivals.disconnect() };
}
