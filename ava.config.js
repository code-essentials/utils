export default {
    files: [
        "src/**/*.spec.ts"
    ],
    typescript: {
        rewritePaths: {
            "src/": "dist/"
        },
        extensions: [
            "ts"
        ],
        compile: false
    }
}
