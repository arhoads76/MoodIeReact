var path = require('path');
var webpack = require('webpack');
var WebpackShellPlugin = require('webpack-shell-plugin-next');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');
//var MiniCssExtractPlugin = require('mini-css-extract-plugin');
//var CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = (env, argv) => {
	var opts = {
		rootDir: process.cwd(),
		devBuild: !(argv.mode == 'production'),
	};

	var rules = [
			{
				test: /\.(js|jsx)$/,
				use: {
					//loader: 'babel-loader',
					//options: {
					//	presets:['@babel/preset-env', '@babel/preset-react'],
					//	plugins:[require('@babel/plugin-proposal-object-rest-spread'), require('@babel/plugin-syntax-dynamic-import')],
					//}

					loader: 'buble-loader',
					options: {
						transforms:{ modules:false, dangerousTaggedTemplateString:true },
						objectAssign:'Object.assign'//'_.extend'
					}
				},
				include: [ path.join(__dirname, 'src') ],
			},
			{
				test: /\.(js|jsx)$/,
				use: {
					loader: 'eslint-loader',
					options: {
						formatter: require('eslint/lib/formatters/codeframe'),
						configFile: __dirname + '/.eslintrc',
						emitError: true,
						emitWarning: true,
						failOnError: false,
						failOnWarning: false,
					}
				},
				include: [ path.join(__dirname, 'src') ],
			},
			//{
			//	test: /\.css$/,
			//	use: [ MiniCssExtractPlugin.loader, 'css-loader?importLoaders=1' ]
			//},
			//{
			//	test: /\.(scss|sass)$/,
			//	use: [ MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader' ]
			//},
		];

	var plugins = [
			new WebpackShellPlugin({
				onBuildExit:{
					scripts: ['echo Webpack Completed: %TIME% & CopyIfNewer.bat' + (argv.mode == 'production' ? ' release' : ' dev')],
					blocking: false,
					parallel: true
				},
			}),
			//new MiniCssExtractPlugin({ linkType:'text/css' }),
			new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
		];

	if (argv.size)
		plugins.push(new BundleAnalyzerPlugin());

	return {
		mode: argv.mode || 'development',
		entry: {
			MoodIe: ['./src/MoodIe/index'],
		},
		resolve: {
			extensions: ['.js', '.jsx'],
			alias: {
			//	'react': 'preact-compat',
			//	'react-dom': 'preact-compat',
			//	moment: 'moment/src/moment',
				'underscore': 'underscore/underscore-min',
			},
		},
		module: {
			rules: rules,
			noParse: [/moment.js/]
		},
		recordsPath: opts.rootDir + '/webpack.moduleList.json',
		plugins: plugins,
		optimization: {
			minimizer: [new UglifyJsPlugin()], //new CssMinimizerPlugin()],
			splitChunks: {
				cacheGroups: {
					Editor: {
						test: /node_modules.*medium.*/,
						name: 'Editor',
						priority: -10,
						chunks: 'all',
						enforce: true
					},
					Common: {
						test: /node_modules|type-helpers.js|dom-helpers.js|src.components.*/,
						name: 'Common',
						priority: -20,
						chunks: 'all'
					},
				}
			}
		},
		devtool: argv.mode === 'production' ? '' : '',//inline-source-map',
		externals: {
			'jquery': 'jQuery',
			//'react': 'React',
			//'react-dom': 'ReactDOM',
		},
		output: {
			path: path.join(__dirname, argv.direct ? '../' : 'dist/'),
			filename: 'App.[name].js',
			chunkFilename: 'App.[name].js'
		},
	}
}
