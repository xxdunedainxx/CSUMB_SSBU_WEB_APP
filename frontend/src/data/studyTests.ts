/**
 * studyTests.ts
 * -------------------------------------------------------------
 * Single source of truth for the landing page's test-storytelling
 * section. Text is verbatim from the redesign brief; asset paths
 * point at the curated subset under /research-assets/tests/.
 *
 * Transition sequences use ezgif-frame assets (18f IN; OUT varies).
 * Heneveld uses static placeholder + borrowed Posner transitions.
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
	/** Transition-IN frame URLs (null when no frame media exists). */
	inFrames: string[] | null;
	/** Transition-OUT frame URLs (null when no frame media exists). */
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

/** Build N zero-padded ezgif frame URLs: dir/ezgif-frame-001.jpg … N */
function ezgifFrames(dir: string, n: number): string[] {
	return Array.from(
		{ length: n },
		(_, i) => `${dir}/ezgif-frame-${String(i + 1).padStart(3, '0')}.jpg`,
	);
}

export const TRANSITION_IN_FRAMES = 18;
/** Reference frame count for scroll-snap math on the landing stage. */
export const TRANSITION_SNAP_FRAMES = TRANSITION_IN_FRAMES;

export const STUDY_TESTS: StudyTest[] = [
	{
		id: 'rt',
		title: 'Reaction Time',
		measures: 'This test measures your Pure Reaction Speed.',
		description:
			'Reaction time is relied upon heavily in most First Person Shooter (FPS) Esports. It is also used in fighting games for defensive parries and acting to punish opponents\' whiffed attacks.',
		assets: {
			videoWebm: '/ui/research-assets/tests/rt/raw/Reaction-Time-EX.webm',
			videoMp4: '/ui/research-assets/tests/rt/raw/Reaction-Time-EX.mp4',
			poster: '/ui/research-assets/tests/rt/raw/first-frame.png',
			inFrames: ezgifFrames('/ui/research-assets/tests/rt/reaction-in', TRANSITION_IN_FRAMES),
			outFrames: ezgifFrames('/ui/research-assets/tests/rt/reaction-out', 14),
		},
	},
	{
		id: 'gonogo',
		title: 'Go / No-Go',
		measures: 'This test measures your Cognitive Inhibition.',
		description:
			'Inhibition is exercised in Esports to control reactions to resist misinputs in demanding situations. Super Smash Bros. Melee players use this skill to react appropriately to opponents\' options during a \'tech chase\'.',
		assets: {
			videoWebm: '/ui/research-assets/tests/gonogo/raw/Go-NoGo-EX.webm',
			videoMp4: '/ui/research-assets/tests/gonogo/raw/Go-NoGo-EX.mp4',
			poster: '/ui/research-assets/tests/gonogo/raw/first-frame.png',
			inFrames: ezgifFrames('/ui/research-assets/tests/gonogo/gonogo-in', TRANSITION_IN_FRAMES),
			outFrames: ezgifFrames('/ui/research-assets/tests/gonogo/gonogo-out', 14),
		},
	},
	{
		id: 'taskswitching',
		title: 'Task-Switching',
		measures: 'This test measures your ability to Switch Focus.',
		description:
			'Esports rarely give competitors the luxury of singular focus. For example, League of Legends players are demanded to switch focus by checking the mini-map, changing targets mid-fight, dodging skill shots, checking game state, and switching between fighting and farming.',
		assets: {
			videoWebm: '/ui/research-assets/tests/taskswitching/raw/Task-Switching-EX.webm',
			videoMp4: '/ui/research-assets/tests/taskswitching/raw/Task-Switching-EX.mp4',
			poster: '/ui/research-assets/tests/taskswitching/raw/first-frame.png',
			inFrames: ezgifFrames('/ui/research-assets/tests/taskswitching/task-in', TRANSITION_IN_FRAMES),
			outFrames: ezgifFrames('/ui/research-assets/tests/taskswitching/task-out', 15),
		},
	},
	{
		id: 'posner',
		title: 'Posner Cueing',
		measures: 'This test measures your Attention and Spatial Awareness.',
		description:
			'Ignoring irrelevant stimuli, tracking relevant information, and focusing on the relevant task is a skill found in Esports when setting/avoiding traps, keeping aware of latent elements, and holding advantageous positions.',
		assets: {
			videoWebm: '/ui/research-assets/tests/posner/raw/Posner-Cueing-EX.webm',
			videoMp4: '/ui/research-assets/tests/posner/raw/Posner-Cueing-EX.mp4',
			poster: '/ui/research-assets/tests/posner/raw/first-frame.png',
			inFrames: ezgifFrames('/ui/research-assets/tests/posner/posner-in', TRANSITION_IN_FRAMES),
			outFrames: ezgifFrames('/ui/research-assets/tests/posner/posner-out', 14),
		},
	},
	{
		id: 'heneveld',
		title: 'Heneveld Controller Testing Paradigm',
		measures: 'This test measures your Controller Precision and Reaction Time.',
		description:
			'Previous tests measure cognitive and reaction time using tests conducted on a mouse and keyboard, while many esports players employ handheld controllers to actually compete. Often, reaction time alone is not enough; precision is required to meet desired outcomes.',
		assets: {
			staticImage: '/ui/research-assets/tests/heneveld/placeholder.png',
			inFrames: ezgifFrames('/ui/research-assets/tests/posner/posner-in', TRANSITION_IN_FRAMES),
			outFrames: ezgifFrames('/ui/research-assets/tests/posner/posner-out', 14),
		},
	},
];

/** Genesis GX3 carousel photo paths. */
export const GX3_PHOTOS = Array.from(
	{ length: 11 },
	(_, i) => `/ui/research-assets/genesis/${String(i + 1).padStart(3, '0')}.jpg`,
);

/** Research hero — trimmed sequence (frames 40–140, 101 total). */
export const HERO_FRAME_START = 40;
export const HERO_FRAME_COUNT = 101;

export const HERO_FRAMES = Array.from(
	{ length: HERO_FRAME_COUNT },
	(_, i) =>
		`/ui/research-assets/new-hero/ezgif-frame-${String(HERO_FRAME_START + i).padStart(3, '0')}.jpg`,
);

export default STUDY_TESTS;
