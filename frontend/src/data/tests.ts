export interface TestInfo {
    file: string;
    name: string;
    description: string;
}

export const testMap: Record<string, TestInfo> = {
    'joystick-precision': {
        file: '/cognitive_dexterity_tests/joystick_precision_test.html',
        name: 'Joystick Precision Test',
        description: 'Test your mouse precision and control'
    },
    // TODO: Add the other tests used in Machek's study
};
