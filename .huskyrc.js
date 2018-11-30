'use strict';

module.exports = {
    hooks: {
        'pre-commit': 'npm run git-pre-commit',
        'pre-push': 'npm run git-pre-push',
    },
};
