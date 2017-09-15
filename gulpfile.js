var gulp = require('gulp'),
    gulpLess = require('gulp-less'),
    gulpCssBase64 = require('gulp-css-base64'),
    gulpMerge = require('merge2'),
    gulpConcatCss = require('gulp-concat-css'),
    gulpCssMin = require('gulp-cssmin'),
    gulpStripCssComments = require('gulp-strip-css-comments'),
    gulpConcat = require('gulp-concat'),
    gulpUglify = require('gulp-uglify'),
    gulpStringReplace = require('gulp-string-replace'),
    archiver = require('gulp-archiver'),
    gzip = require('gulp-gzip'),
    pac = require('./package.json');

var buildVersion = pac.version,
    cssFileName = "conono." + buildVersion + ".css",
    jsFileName = "conono." + buildVersion + ".js",
    buildDir = "build";

gulp.task('build:css', function () {
    var bootstrapCss = gulp.src("./bower_components/bootstrap/less/bootstrap.less")
        .pipe(gulpLess())
        .pipe(gulpCssBase64({
            maxWeightResource: 256 * 1024
        }));

    var mdBaseCss = gulp.src("./bower_components/bootstrap-material-design/less/bootstrap-material-design.less")
        .pipe(gulpLess())
        .pipe(gulpCssBase64());

    var mdRippleCss = gulp.src("./bower_components/bootstrap-material-design/less/ripples.less")
        .pipe(gulpLess())
        .pipe(gulpCssBase64());

    var cononoCss = gulp.src("./assets/less/conono.less")
        .pipe(gulpLess())
        .pipe(gulpCssBase64({
            maxWeightResource: 256 * 1024
        }));

    return gulpMerge(
        bootstrapCss,
        mdBaseCss,
        mdRippleCss,
        cononoCss
    ).pipe(gulpLess())
        .pipe(gulpConcatCss(cssFileName))
        .pipe(gulpStripCssComments({
            preserve: false
        }))
        .pipe(gulpCssMin())
        .pipe(gulp.dest(buildDir + "/css"));
});

gulp.task('build:js', function () {
    return gulp.src([
        './bower_components/cookieconsent/build/cookieconsent.min.js',
        './bower_components/jquery/dist/jquery.js',
        './bower_components/bootstrap/dist/js/bootstrap.js',
        './bower_components/bootstrap-material-design/dist/js/material.js',
        './bower_components/bootstrap-material-design/dist/js/ripples.js',
        './assets/js/init.js'
    ])
        .pipe(gulpConcat(jsFileName))
        .pipe(gulpUglify({
            'mangle': false
        }))
        .pipe(gulp.dest(buildDir + "/js"));
});

gulp.task('build:html', function () {
    return gulp.src([
        './templates/**/*.hbs'
    ])
        .pipe(gulpStringReplace('###BUILDDATE###', buildVersion))
        .pipe(gulp.dest(buildDir));
});

gulp.task('watch', function () {
    gulp.watch('./src/**/*', function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
        gulp.start('build:js');
        gulp.start('build:css');
        gulp.start('build:html');
    });
});

gulp.task('build:all', ['build:css', 'build:js', 'build:html'], function () {
    var theme = {
        "name": pac.name,
        "description": pac.description,
        "version": pac.version,
        "requires": "1.1.9",
        "author": pac.author,
        "license": pac.license,
        "url": pac.homepage,
        "error_templates": {
            "503":"partials/maintenance.hbs"
        }
    };

    // noinspection NodeJsCodingAssistanceForCoreModules
    return require('fs').writeFile(buildDir + '/theme.json', JSON.stringify(theme));
});

gulp.task('build:release', ['build:all'], function () {
    gulp.src(buildDir + "/**/*")
        .pipe(archiver('conono-leafpub-theme-' + pac.version + '.zip'))
        .pipe(gulp.dest('./release/'));

    gulp.src(buildDir + "/**/*")
        .pipe(archiver('conono-leafpub-theme-' + pac.version + '.tar'))
        .pipe(gzip())
        .pipe(gulp.dest('./release/'));
});