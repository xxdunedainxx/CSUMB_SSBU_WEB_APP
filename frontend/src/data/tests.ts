export interface TestInfo {
    id: string;
    file: string;
    name: string;
    shortDescription: string;
    description?: string;
    icon: string;
    tags?: string[];
}

const TestInfo: TestInfo[] = [
    {
        id: 'joystick-precision',
        file: '/cognitive_dexterity_tests/joystick_precision_test.html',
        name: 'Joystick Precision Test',
        shortDescription: 'Test your controller precision and control',
        description: 'A precision test measuring dexterity through reaction and cognitive tests using game controller joysticks',
        icon: '/cognitive_dexterity_tests/joystick-image.png',
        tags: ['dexterity', 'reaction', 'cognitive']
    },
    {
        id: 'GoNoGo',
        file: 'https://xxdunedainxx.github.io/CSUMB_SSBU_Study/site/GoNoGo.html',
        name: 'Go No GO',
        shortDescription: 'Test your reaction and cognitive ablities', 
        description: 'A test measuring reaction and cognitive skils', //TODO make more descriptive/specific
        icon: '/cognitive_dexterity_tests/tempary-app-image.png',
        tags: ['reaction', 'cognitive']
    },
    {
        id: 'Posner',
        file: 'https://xxdunedainxx.github.io/CSUMB_SSBU_Study/site/Posner.html',
        name: 'Posner Queuing Test',
        shortDescription: 'Test your reaction and cognitive ablities', 
        description: 'Ummmmm, idk really know what this test does', //TODO make more descriptive/specific
        icon: '/cognitive_dexterity_tests/tempary-app-image.png',
        tags: ['reaction', 'cognitive']
    },
    {
        id: 'TaskSwitching',
        file: 'https://xxdunedainxx.github.io/CSUMB_SSBU_Study/site/TaskSwitching.html',
        name: 'Task Switching',
        shortDescription: 'Test your reaction and cognitive ablities', 
        description: 'Ummmmm, idk really know what this test does', //TODO make more descriptive/specific
        icon: '/cognitive_dexterity_tests/tempary-app-image.png',
        tags: ['reaction', 'cognitive']
    },
    {
        id: 'SimpleReactionOnly',
        file: 'https://xxdunedainxx.github.io/CSUMB_SSBU_Study/site/SimpleReactionOnly.html',
        name: 'Simple Reaction',
        shortDescription: 'Test your reaction time!', 
        description: 'Tests your simple reaction time using a spacebar', //TODO make more descriptive/specific
        icon: '/cognitive_dexterity_tests/tempary-app-image.png',
        tags: ['reaction']
    }
];

export const testMap: Record<string, TestInfo> = Object.fromEntries(
    TestInfo.map(t => [t.id, t])
) as Record<string, TestInfo>;

export default TestInfo;
