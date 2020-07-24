// npm i -save-dev gulp del gulp-zip gulp-sourcemaps uglify-es gulp-uglify pump
// npm i -g gulp-cli # required for gulp 4
const gulp = require('gulp'),
    del = require('del'),
    zip = require('gulp-zip');

const uglifyes = require('uglify-es');
const composer = require('gulp-uglify/composer');
const uglify = composer(uglifyes, console);
const pump = require('pump');

gulp.task('clear', () =>
    del(['build/**/*'])
)


gulp.task('rootfiles', () => {
    gulp.src('src/*.png')
        .pipe(gulp.dest('build'))
    return gulp.src('src/manifest.json')
        .pipe(gulp.dest('build'))
})


gulp.task('html', () =>
    gulp.src('src/*.html')
        .pipe(gulp.dest('build'))
)


gulp.task('img', () =>
    gulp.src('src/img/**/*')
        .pipe(gulp.dest('build/img'))
)


gulp.task('locales', () =>
    gulp.src('src/_locales/**/*')
        .pipe(gulp.dest('build/_locales'))
)


gulp.task('extscripts', () => {
    return gulp.src('src/js/ext/**/*.js')
        .pipe(gulp.dest('build/js/ext'));
})


gulp.task('scripts', gulp.series('extscripts', (cb) => {
    pump([
        gulp.src(['src/js/**/*.js', '!src/js/ext/**/*.js']),
        uglify({
            mangle: false,
            ecma: 6
        }),
        gulp.dest('build/js/')
    ], cb)
}))


gulp.task('styles', () => {
    return gulp.src('src/css/**/*.css')
        .pipe(gulp.dest('build/css'))
})


// Build ditributable ZIP, ready for upload to Developer Console
gulp.task('zip', gulp.series(gulp.parallel('html', 'scripts', 'styles', 'img', 'locales', 'rootfiles'), () => {
    const manifest = require('./src/manifest'),
        distFileName = `${__dirname.split("/").pop()}_${manifest.version}.zip`;
        
    //build distributable extension
    return gulp.src(['build/**', '!build/js/**/*.map'])
        .pipe(zip(distFileName))
        .pipe(gulp.dest('..')) // Save bundle to root
        .pipe(gulp.dest('dist')) // Save copy of bundle in /dist
}))

// Run all tasks after build directory has been cleaned
gulp.task('default', gulp.series('clear', 'zip'))
