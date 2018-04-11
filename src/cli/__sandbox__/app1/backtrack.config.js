const config = {
    dev: [
        () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(1);
                }, 10);
            });
        },

        () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(2);
                }, 1);
            });
        },
    ],
};

module.exports = config;
