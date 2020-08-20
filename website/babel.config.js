module.exports = {
    presets: ['next/babel'],

    env: {
        production: {
            plugins: [
                [
                    '@taddy',
                    {
                        compileOptions: {
                            typescript: true,
                            evaluate: true,
                        },
                        outputOptions: {
                            extractCSS: true,

                            cssFilepath: 'styles/taddy.css',
                        },
                    },
                ],
            ],
        },
    },
};
