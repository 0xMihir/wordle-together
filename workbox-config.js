

export default {
    globDirectory: 'public/',
    globPatterns: [
        '**/*.{png,css,js,ico,html,svg,webmanifest}'
    ],
    swDest: 'public/build/sw.js',
    ignoreURLParametersMatching: [
        /^utm_/,
        /^fbclid$/
    ],
    modifyURLPrefix: {
        '': '/'
    },
    skipWaiting: true
}
