// VARIABLES & PATHS

let preprocessor = 'scss', // Preprocessor (sass, scss, less, styl)
    fileswatch   = 'html,htm,txt,json,md,woff2', // List of files extensions for watching & hard reload (comma separated)
    imageswatch  = 'jpg,jpeg,png,webp,svg', // List of images extensions for watching & compression (comma separated)
    baseDir      = 'src', // Base directory path without «/» at the end
    online       = true; // If «false» - Browsersync will work offline without internet connection
    distDir      = 'dist';
    distDir      = 'dist';
let paths = {

	scripts: {
		src: [
			// 'node_modules/jquery/dist/jquery.min.js', // npm vendor example (npm i --save-dev jquery)
			baseDir + '/js/app.js' // app.js. Always at the end
		],
		dest: baseDir + '/js',
		destProd: distDir + '/js',
	},

	styles: {
		src:  baseDir + '/' + preprocessor + '/main.*',
		dest: baseDir + '/css',
		destProd: distDir + '/css',
	},

	images: {
		src:  baseDir + '/images/src/**/*',
		dest: baseDir + '/images/dest',
		destProd: distDir + '/images/dest',
	},

	deploy: {
		hostname:    'username@yousite.com', // Deploy hostname
		destination: 'yousite/public_html/', // Deploy destination
		include:     [/* '*.htaccess' */], // Included files to deploy
		exclude:     [ '**/Thumbs.db', '**/*.DS_Store' ], // Excluded files from deploy
	},

	cssOutputName: 'app.min.css',
	jsOutputName:  'app.min.js',

};

// LOGIC

const { src, dest, parallel, series, watch } = require('gulp');
const scss         = require('gulp-sass');
const cleancss     = require('gulp-clean-css');
const concat       = require('gulp-concat');
const browserSync  = require('browser-sync').create();
const uglify       = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin     = require('gulp-imagemin');
const newer        = require('gulp-newer');
const del          = require('del');

function browsersync() {
	browserSync.init({
		server: { baseDir: baseDir + '/' },
		notify: false,
		online: online
	})
}

function scripts() {
	return src(paths.scripts.src)
	.pipe(concat(paths.jsOutputName))
	.pipe(uglify())
	.pipe(dest(paths.scripts.dest))
	.pipe(dest(paths.scripts.destProd))
	.pipe(browserSync.stream())
}

function styles() {
	return src(paths.styles.src)
	.pipe(eval(preprocessor)())
	.pipe(concat(paths.cssOutputName))
	.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
	.pipe(cleancss( {level: { 1: { specialComments: 0 } },/* format: 'beautify' */ }))
	.pipe(dest(paths.styles.dest))
	.pipe(dest(paths.styles.destProd))
	.pipe(browserSync.stream())
}

function images() {
	return src(paths.images.src)
	.pipe(newer(paths.images.dest))
	.pipe(newer(paths.images.destProd))
	.pipe(imagemin())
	.pipe(dest(paths.images.dest))
	.pipe(dest(paths.images.destProd))
}

function html() {
	return src(paths.html.src)
	.pipe(newer(paths.html.dest))
	.pipe(newer(paths.html.destProd))
	.pipe(dest(paths.html.dest))
	.pipe(dest(paths.html.destProd))
}

function cleanimg() {
	return del('' + paths.images.dest + '/**/*', { force: true })
}


function startwatch() {
	watch(baseDir  + '/**/' + preprocessor + '/**/*', styles);
	watch(baseDir  + '/**/*.{' + imageswatch + '}', images);
	watch(baseDir  + '/**/*.{' + fileswatch + '}').on('change', browserSync.reload);
	watch([baseDir + '/**/*.js', '!' + paths.scripts.dest + '/*.min.js'], scripts);
}

exports.browsersync = browsersync;
exports.build       = series(cleanimg, styles, scripts, images, html);
exports.styles      = styles;
exports.scripts     = scripts;
exports.images      = images;
exports.cleanimg    = cleanimg;
exports.default     = parallel(images, styles, scripts, browsersync, startwatch);
