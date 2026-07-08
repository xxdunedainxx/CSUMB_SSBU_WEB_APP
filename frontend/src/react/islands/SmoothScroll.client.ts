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

export function getScrollY(): number {
	if (activeLenis) return activeLenis.scroll;
	return window.scrollY || document.documentElement.scrollTop;
}

export function scrollToY(target: number, duration = 0.45): void {
	if (activeLenis) {
		activeLenis.scrollTo(target, { duration, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
		return;
	}
	window.scrollTo({ top: target, behavior: 'smooth' });
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

	ScrollTrigger.scrollerProxy(document.documentElement, {
		scrollTop(value) {
			if (arguments.length) {
				lenis.scrollTo(value, { immediate: true });
			}
			return lenis.scroll;
		},
		getBoundingClientRect() {
			return {
				top: 0,
				left: 0,
				width: window.innerWidth,
				height: window.innerHeight,
			};
		},
	});

	ScrollTrigger.addEventListener('refresh', () => lenis.resize());

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
