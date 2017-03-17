/**
 * Created by fongwell on 2016/9/21.
 */
var gulp = require('gulp');
var gutil = require('gulp-util');
var gulpif = require('gulp-if');
var streamify = require('gulp-streamify');
var autoprefixer = require('gulp-autoprefixer');
var cssmin = require('gulp-cssmin');
var less = require('gulp-less');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var source = require('vinyl-source-stream');
var babelify = require('babelify');
var browserify = require('browserify');
var watchify = require('watchify');
var uglify = require('gulp-uglify');

var production = process.env.NODE_ENV === 'production';

var dependencies = [
    'alt',
    'react',
    'react-router',
    'underscore'
];

/*
 |--------------------------------------------------------------------------
 | Combine all JS libraries into a single file for fewer HTTP requests.
 |--------------------------------------------------------------------------
 */
gulp.task('vendor', function() { // 打包第三方插件
    return gulp.src([
        'bower_components/jquery/dist/jquery.js',
        'bower_components/bootstrap/dist/js/bootstrap.js',
        'bower_components/magnific-popup/dist/jquery.magnific-popup.js',
        'bower_components/toastr/toastr.js'
    ]).pipe(concat('vendor.js'))
        .pipe(gulpif(production, uglify({ mangle: false })))
        .pipe(gulp.dest('public/js'));
});

/*
 |--------------------------------------------------------------------------
 | Compile third-party dependencies separately for faster performance.
 |--------------------------------------------------------------------------
 */
gulp.task('browserify-vendor', function() { //将NPM模块 'alt','react','react-router','underscore' 打包
    return browserify()
        .require(dependencies)
        .bundle()
        .pipe(source('vendor.bundle.js'))
        .pipe(gulpif(production, streamify(uglify({ mangle: false }))))
        .pipe(gulp.dest('public/js'));
});

/*
 |--------------------------------------------------------------------------
 | Compile only project files, excluding all third-party dependencies.
 |--------------------------------------------------------------------------
 */
gulp.task('browserify', ['browserify-vendor'], function() { //仅将app文件编译并打包，不包括其它模块和库
    return browserify('public/app/main.js') //把入口文件 main.js 交给 browserify 进行处理
        .external(dependencies)
        .transform(babelify) // jsx 的编译，使用 babelify 来实现
        .bundle()
        .pipe(source('bundle.js')) //注意，browserify 不是一个专门为 gulp 写的包，所有它输出的数据流并不能直接 pipe 给 gulp 使用，所以，需要用到
                                    // source()接口,也就是 vinyl-source-stream 这个工具来处理一下
        .pipe(gulpif(production, streamify(uglify({ mangle: false }))))
        .pipe(gulp.dest('public/js'));
});

/*
 |--------------------------------------------------------------------------
 | Same as browserify task, but will also watch for changes and re-compile.
 |--------------------------------------------------------------------------
 */
gulp.task('browserify-watch', ['browserify-vendor'], function() { // 包括上面的功能，并且监听文件改变，然后重新编译打包app文件
    var bundler = watchify(browserify('public/app/main.js', watchify.args));
    bundler.external(dependencies);
    bundler.transform(babelify);
    bundler.on('update', rebundle);
    return rebundle();

    function rebundle() {
        var start = Date.now();
        return bundler.bundle()
            .on('error', function(err) {
                gutil.log(gutil.colors.red(err.toString()));
            })
            .on('end', function() {
                gutil.log(gutil.colors.green('Finished rebundling in', (Date.now() - start) + 'ms.'));
            })
            .pipe(source('bundle.js'))
            .pipe(gulp.dest('public/js/'));
    }
});

/*
 |--------------------------------------------------------------------------
 | Compile LESS stylesheets.
 |--------------------------------------------------------------------------
 */
gulp.task('styles', function() {
    return gulp.src('public/app/stylesheets/*.less')
        .pipe(plumber())
        .pipe(less())
        .pipe(autoprefixer())
        .pipe(gulpif(production, cssmin()))
        .pipe(gulp.dest('public/css'));
});

gulp.task('watch', function() {
    gulp.watch('public/app/stylesheets/**/*.less', ['styles']);
});

gulp.task('default', ['styles', 'vendor', 'browserify-watch', 'watch']);
gulp.task('build', ['styles', 'vendor', 'browserify']);