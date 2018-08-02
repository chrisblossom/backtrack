'use strict';

module.exports = {
    '*.{js,mjs,jsx,ts,tsx,json,scss,less,css,md,yml,yaml}': [
        'prettier --write',
        'git add',
    ],
};
