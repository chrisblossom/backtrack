'use strict';

module.exports = {
    hooks: {
        'pre-commit': 'lint-staged',
        'pre-push': 'npm run check-all',
    },
};
