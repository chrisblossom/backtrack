const preset1DevTask1 = () => 'preset1DevTask1';
const preset1DevTask2 = () => 'preset1DevTask2';
const preset1BuildTask1 = () => 'preset1BuildTask1';
const preset1FormatTask1 = () => 'preset1FormatTask1';

const preset1 = {
    presets: ['one'],

    packageJson: {
        scripts: {
            'lint.fix': ['preset2LintFixTask1'],
        },
    },

    dev: [
        {
            name: 'preset1DevTask1',
            task: preset1DevTask1,
        },
        {
            name: 'run jest',
            task: 'jest',
        },
        'eslint --fix',
        [
            {
                name: 'run prettier',
                task: 'prettier',
            },
            'eslint',
        ],
        preset1DevTask2,
        [preset1DevTask1, preset1DevTask2],
    ],
    clean: {
        del: ['preset_1'],
        makeDirs: ['some/preset_1'],
        copy: [
            {
                dest: 'static-1',
                src: 'static-1',
            },
            {
                dest: 'static-2',
                src: 'static-2',
                hash: true,
            },
        ],
    },
    build: preset1BuildTask1,
    format: [preset1FormatTask1],
    files: {
        src: 'preset_1_src',
        dest: 'preset_1_dest',
    },
};

module.exports = preset1;
