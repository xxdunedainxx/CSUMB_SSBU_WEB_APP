/**
 * SmoothScroll.client.ts
 * -------------------------------------------------------------
 * Initializes Lenis smooth-scroll and wires it to the GSAP
 * ticker + ScrollTrigger so every scroll-driven animation stays
 * perfectly in sync. Call `initSmoothScroll()` once per page.
 *
 * Honors prefers-reduced-motion: smoothing is disabled and the
 * page falls back to native scrolling.
 * -------------------------------------------------------------
 */
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let activeLenis: Lenis | null = null;

export function getLenis(): Lenis | null {
	return activeLenis;
}

export function prefersReducedMotion(): boolean {
	return (
		typeof window !== 'undefined' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches
	);
}

export function initSmoothScroll(): Lenis | null {
	if (typeof window === 'undefined') return null;

	// Respect user preference: skip smoothing entirely.
	if (prefersReducedMotion()) {
		ScrollTrigger.refresh();
		return null;
	}

	// Clean up any prior instance (HMR safety).
	if (activeLenis) {
		activeLenis.destroy();
		activeLenis = null;
	}

	const lenis = new Lenis({
		duration: 1.15,
		easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
		smoothWheel: true,
		smoothTouch: false,
	});
	activeLenis = lenis;

	lenis.on('scroll', ScrollTrigger.update);

	gsap.ticker.add((time: number) => {
		lenis.raf(time * 1000);
	});
	gsap.ticker.lagSmoothing(0);

	return lenis;
}

export function destroySmoothScroll(): void {
	if (activeLenis) {
		activeLenis.destroy();
		activeLenis = null;
	}
}

export { gsap, ScrollTrigger };
