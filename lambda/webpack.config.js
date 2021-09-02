const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    mode: "production",
    target: "node",
    node: {
        __dirname: false,
    },
    entry: {
        "src/check-authentication/bundle": path.resolve(
            __dirname,
            "./src/check-authentication/index.ts"
        ),
        "src/idp-callback/bundle": path.resolve(
            __dirname,
            "./src/idp-callback/index.ts"
        ),
        "src/logout/bundle": path.resolve(
            __dirname,
            "./src/logout/index.ts"
        ),
        "src/refresh-token/bundle": path.resolve(
            __dirname,
            "./src/refresh-token/index.ts"
        ),
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader",
                exclude: /node_modules/,
                options: {
                    configFile: "tsconfig.json"
                }
            }
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    output: {
        path: path.resolve(__dirname),
        filename: "[name].js",
        libraryTarget: "commonjs",
    },
    externals: [
        /^aws-sdk/, // Don't include the aws-sdk in bundles as it is already present in the Lambda runtime
    ],
    performance: {
        hints: "error",
        maxAssetSize: 1048576, // Max size of deployment bundle in Lambda@Edge Viewer Request
        maxEntrypointSize: 1048576, // Max size of deployment bundle in Lambda@Edge Viewer Request
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                parallel: true,
                extractComments: false,
            }),
        ],
    },
};