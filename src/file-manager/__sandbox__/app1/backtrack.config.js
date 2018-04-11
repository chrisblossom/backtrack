const path = require('path');

const config = {
    files: [
        {
            src: path.resolve(__dirname, 'files/fake.config.js'),
            dest: 'fake.config.js',
        },
    ],
};

module.exports = config;
