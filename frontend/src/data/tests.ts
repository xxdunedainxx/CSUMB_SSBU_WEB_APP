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
        tags: ['precision', 'reaction']
    }
    // TODO: Add the other tests used in Machek's study
];

export const testMap: Record<string, TestInfo> = Object.fromEntries(
    TestInfo.map(t => [t.id, t])
) as Record<string, TestInfo>;

export default TestInfo;
