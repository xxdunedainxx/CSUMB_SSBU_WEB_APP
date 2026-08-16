/**
 * Fades a full-page cinematic gradient in when scroll is idle,
 * and out while the user is scrolling — keeps transition viewports
 * on flat #0a0a0b while hero copy and video holds feel more atmospheric.
 */
import type Lenis from 'lenis';

const SETTLE_MS = 520;

let settleTimer = 0;
let detach: (() => void) | null = null;

function setAmbient(on: boolean): void {
	document.documentElement.dataset.ambient = on ? 'on' : 'off';
}

export function initCinematicAmbient(lenis: Lenis | null): () => void {
	destroyCinematicAmbient();

	setAmbient(true);

	const onActivity = () => {
		setAmbient(false);
		clearTimeout(settleTimer);
		settleTimer = window.setTimeout(() => setAmbient(true), SETTLE_MS);
	};

	if (lenis) {
		lenis.on('scroll', onActivity);
		detach = () => lenis.off('scroll', onActivity);
	} else {
		window.addEventListener('scroll', onActivity, { passive: true });
		detach = () => window.removeEventListener('scroll', onActivity);
	}

	return destroyCinematicAmbient;
}

export function destroyCinematicAmbient(): void {
	clearTimeout(settleTimer);
	detach?.();
	detach = null;
	delete document.documentElement.dataset.ambient;
}
