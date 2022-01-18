module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true
    },
    extends: 'standard',
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module'
    },
    plugins: ['svelte3'],
    overrides: [
        {
            files: ['*.svelte'],
            processor: 'svelte3/svelte3',
            rules: {
                'import/first': [0],
                quote: ['error', 'single']
            }
        }
    ],
    rules: {
        indent: [2, 4],
        'no-multiple-empty-lines': ['error', { max: 1, maxBOF: 2, maxEOF: 0 }]
    }
}
