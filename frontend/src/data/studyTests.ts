/**
 * studyTests.ts
 * -------------------------------------------------------------
 * Single source of truth for the landing page's test-storytelling
 * section. Text is verbatim from the redesign brief; asset paths
 * point at the curated subset under /research-assets/tests/.
 *
 * Frame sequences are 31 frames each (Transition-In / Transition-Out).
 * Heneveld has no media yet → staticImage placeholder only.
 * -------------------------------------------------------------
 */

export type TestId =
	| 'rt'
	| 'gonogo'
	| 'taskswitching'
	| 'posner'
	| 'heneveld';

export interface StudyTestAssets {
	/** Looping example video (webm preferred). */
	videoWebm?: string;
	/** Looping example video (mp4 fallback for older browsers). */
	videoMp4?: string;
	/** Poster / first-frame shown before video plays or as fallback. */
	poster?: string;
	/** 31 transition-IN frame URLs (null when no frame media exists). */
	inFrames: string[] | null;
	/** 31 transition-OUT frame URLs (null when no frame media exists). */
	outFrames: string[] | null;
	/** Static placeholder image (used in place of video + frames). */
	staticImage?: string;
}

export interface StudyTest {
	id: TestId;
	title: string;
	/** Short "what it measures" line, shown as a glass pill. */
	measures: string;
	/** Long paragraph explaining the skill + esports relevance. */
	description: string;
	assets: StudyTestAssets;
}

/** Build N zero-padded frame URLs: prefix-001.jpg ... prefix-NNN.jpg */
function frames(base: string, n: number): string[] {
	return Array.from({ length: n }, (_, i) => `${base}-${String(i + 1).padStart(3, '0')}.jpg`);
}

const TEST_FRAMES = 31;

export const STUDY_TESTS: StudyTest[] = [
	{
		id: 'rt',
		title: 'Reaction Time',
		measures: 'This test measures your Pure Reaction Speed.',
		description:
			'Reaction time is relied upon heavily in most First Person Shooter (FPS) Esports. It is also used in fighting games for defensive parries and acting to punish opponents\' whiffed attacks.',
		assets: {
			videoWebm: '/research-assets/tests/rt/raw/Reaction-Time-EX.webm',
			videoMp4: '/research-assets/tests/rt/raw/Reaction-Time-EX.mp4',
			poster: '/research-assets/tests/rt/raw/first-frame.png',
			inFrames: frames('/research-assets/tests/rt/in/frame', TEST_FRAMES),
			outFrames: frames('/research-assets/tests/rt/out/frame', TEST_FRAMES),
		},
	},
	{
		id: 'gonogo',
		title: 'Go / No-Go',
		measures: 'This test measures your Cognitive Inhibition.',
		description:
			'Inhibition is exercised in Esports to control reactions to resist misinputs in demanding situations. Super Smash Bros. Melee players use this skill to react appropriately to opponents\' options during a \'tech chase\'.',
		assets: {
			videoWebm: '/research-assets/tests/gonogo/raw/Go-NoGo-EX.webm',
			videoMp4: '/research-assets/tests/gonogo/raw/Go-NoGo-EX.mp4',
			poster: '/research-assets/tests/gonogo/raw/first-frame.png',
			inFrames: frames('/research-assets/tests/gonogo/in/frame', TEST_FRAMES),
			outFrames: frames('/research-assets/tests/gonogo/out/frame', TEST_FRAMES),
		},
	},
	{
		id: 'taskswitching',
		title: 'Task-Switching',
		measures: 'This test measures your ability to Switch Focus.',
		description:
			'Esports rarely give competitors the luxury of singular focus. For example, League of Legends players are demanded to switch focus by checking the mini-map, changing targets mid-fight, dodging skill shots, checking game state, and switching between fighting and farming.',
		assets: {
			videoWebm: '/research-assets/tests/taskswitching/raw/Task-Switching-EX.webm',
			videoMp4: '/research-assets/tests/taskswitching/raw/Task-Switching-EX.mp4',
			poster: '/research-assets/tests/taskswitching/raw/first-frame.png',
			inFrames: frames('/research-assets/tests/taskswitching/in/frame', TEST_FRAMES),
			outFrames: frames('/research-assets/tests/taskswitching/out/frame', TEST_FRAMES),
		},
	},
	{
		id: 'posner',
		title: 'Posner Cueing',
		measures: 'This test measures your Attention and Spatial Awareness.',
		description:
			'Ignoring irrelevant stimuli, tracking relevant information, and focusing on the relevant task is a skill found in Esports when setting/avoiding traps, keeping aware of latent elements, and holding advantageous positions.',
		assets: {
			videoWebm: '/research-assets/tests/posner/raw/Posner-Cueing-EX.webm',
			videoMp4: '/research-assets/tests/posner/raw/Posner-Cueing-EX.mp4',
			poster: '/research-assets/tests/posner/raw/first-frame.png',
			inFrames: frames('/research-assets/tests/posner/in/frame', TEST_FRAMES),
			outFrames: frames('/research-assets/tests/posner/out/frame', TEST_FRAMES),
		},
	},
	{
		id: 'heneveld',
		title: 'Heneveld Controller Testing Paradigm',
		measures: 'This test measures your Controller Precision and Reaction Time.',
		description:
			'Previous tests measure cognitive and reaction time using tests conducted on a mouse and keyboard, while many esports players employ handheld controllers to actually compete. Often, reaction time alone is not enough; precision is required to meet desired outcomes.',
		assets: {
			// Content currently missing — static placeholder; borrow Posner transitions for scroll alignment.
			staticImage: '/research-assets/tests/heneveld/placeholder.png',
			inFrames: frames('/research-assets/tests/posner/in/frame', TEST_FRAMES),
			outFrames: frames('/research-assets/tests/posner/out/frame', TEST_FRAMES),
		},
	},
];

/** Genesis GX3 carousel photo paths. */
export const GX3_PHOTOS = Array.from(
	{ length: 11 },
	(_, i) => `/research-assets/genesis/${String(i + 1).padStart(3, '0')}.jpg`,
);

/** Box-open hero frames (180). */
export const HERO_FRAMES = Array.from(
	{ length: 180 },
	(_, i) => `/research-assets/new-hero/ezgif-frame-${String(i + 1).padStart(3, '0')}.jpg`,
);

export default STUDY_TESTS;
