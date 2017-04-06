'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const imagemin = require('gulp-imagemin');
const sourcemaps = require('gulp-sourcemaps');
const ts = require('gulp-typescript');
const del = require('del');
const spawn = require('child_process').spawn;
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');

const srcBase = 'src/';
const vendorBase = 'vendor/';

const paths = {
    html: './src/public/**/*.html',
	img: './src/public/img/*.*',
    scss: './src/public/scss/*.scss',
    js: './src/public/*.js',
    ts: './src/public/**/*.ts',
	php: './src/**/*.php',
	phpVendor: './vendor/**/*.*'
};

const buildPaths = {
    html: 'build/public/',
	img: 'build/public/img/',
    css: 'build/public/css/',
    js: 'build/public/',
	php: 'build/',
	phpVendor: 'build/vendor/'
};

/*************************************/
/* HTML                              */
/*************************************/

gulp.task('html', (done) => {
    gulp.src(paths.html, { base: srcBase + 'html/' })
        .pipe(gulp.dest(buildPaths.html));
	done();
});

gulp.task('watch:html', () => {
    gulp.watch(paths.html, gulp.parallel('html'));
});

/*************************************/
/* Images                            */
/*************************************/

gulp.task('img', (done) => {
    gulp.src(paths.img)
		.pipe(imagemin())
        .pipe(gulp.dest(buildPaths.img));
	done();
});

gulp.task('watch:img', () => {
    gulp.watch(paths.img, gulp.parallel('img'));
});

/*************************************/
/* SASS                              */
/*************************************/

gulp.task('sass', (done) => {
    return gulp.src(paths.scss)
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(buildPaths.css));
	done();
});

gulp.task('watch:sass', () => {
    gulp.watch(paths.scss, gulp.parallel('sass'));
});

/*************************************/
/* Javascript                        */
/*************************************/

gulp.task('js', (done) => {
    gulp.src(paths.js)
        .pipe(gulp.dest(buildPaths.js));
	done();
});

gulp.task('watch:js', () => {
    gulp.watch(paths.js, gulp.parallel('js'));
});

/*************************************/
/* Typescript                        */
/*************************************/

var tsProject = ts.createProject('src/public/tsconfig.json', {
    typescript: require('typescript')
});

gulp.task('nodeModules', (done) => {
    gulp.src('node_modules/**/*.*').pipe(gulp.dest('build/public/node_modules'));
    done();
});

gulp.task('ts', (done) => {
    var result = gulp.src(paths.ts, { base: srcBase })
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('build/'));
    done();
});

gulp.task('watch:ts', () => {
    gulp.watch(paths.ts, gulp.parallel('ts'));
});

/*************************************/
/* PHP                               */
/*************************************/

gulp.task('php', (done) => {
    gulp.src(paths.php)
        .pipe(gulp.dest(buildPaths.php));
	done();
});

gulp.task('watch:php', () => {
	gulp.watch(paths.php, gulp.parallel('php'));
});

gulp.task('php:vendor', (done) => {
	gulp.src(paths.phpVendor, { base: vendorBase })
		.pipe(gulp.dest(buildPaths.phpVendor));
	done();
})

gulp.task('watch:php:vendor', () => {
	gulp.watch(paths.phpVendor, gulp.parallel('php:vendor'));
});

/*************************************/
/* Docker Compose                    */
/*************************************/

function docker(cmdName, done) {
	let cmd = spawn('bin/dev/' + cmdName + '.sh');
	cmd.stdout.on('data', (data) => {
		console.log('> ' + data.toString());
	});
	cmd.stderr.on('data', (data) => {
		console.error('> ' + data.toString());
	});
	cmd.on('error', (error) => {
		console.error('From spawn: ' + error);
		return;
	});
	cmd.on('exit', done);
}

function dockerSsh() {
	let ssh = spawn('bin/dev/ssh.sh', [], { stdio: [0, 1, 2] });
}

gulp.task('up', (done) => {
	docker('up', done);
});

gulp.task('halt', (done) => {
	docker('halt', done);
});

gulp.task('suspend', (done) => {
	docker('suspend', done);
});

gulp.task('resume', (done) => {
	docker('resume', done);
});

gulp.task('destroy', (done) => {
	docker('destroy', done);
});

gulp.task('ssh', (done) => {
	dockerSsh();
	done();
});

/*************************************/
/* General                           */
/*************************************/

gulp.task('clean', () => {
    return del(['build/*']);
});

gulp.task('watch', gulp.parallel('watch:html','watch:img','watch:sass','watch:js','watch:php','watch:php:vendor', 'watch:ts'));
gulp.task('build', gulp.parallel('html','img','sass','js','php', 'php:vendor', 'ts', 'nodeModules'));
gulp.task('default', gulp.parallel('build'));
