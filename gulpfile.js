// Generated on 2016-05-29 using generator-angular 0.15.1
'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var openURL = require('open');
var lazypipe = require('lazypipe');
var rimraf = require('rimraf');
var wiredep = require('wiredep').stream;
var runSequence = require('run-sequence');
var deploy      = require('gulp-gh-pages');
var flatten = require('gulp-flatten');

var yeoman = {
  app: require('./bower.json').appPath || 'app',
  dist: 'dist'
};

var paths = {
  scripts: [yeoman.app + '/scripts/**/*.js'],
  styles: [yeoman.app + '/styles/**/*.css'],
  test: ['test/spec/**/*.js'],
  testRequire: [
    yeoman.app + '/bower_components/angular/angular.js',
    yeoman.app + '/bower_components/angular-mocks/angular-mocks.js',
    yeoman.app + '/bower_components/angular-resource/angular-resource.js',
    yeoman.app + '/bower_components/angular-cookies/angular-cookies.js',
    yeoman.app + '/bower_components/angular-sanitize/angular-sanitize.js',
    yeoman.app + '/bower_components/angular-route/angular-route.js',
    'test/mock/**/*.js',
    'test/spec/**/*.js'
  ],
  karma: 'karma.conf.js',
  views: {
    // main: yeoman.app + '/index.html',
    main: [ yeoman.app + '/index.html' ], // yeoman.app + '/earthcalc/index.html'],
    files: [yeoman.app + '/views/**/*.html']
  }
};

////////////////////////
// Reusable pipelines //
////////////////////////

var lintScripts = lazypipe()
  .pipe($.jshint, '.jshintrc')
  .pipe($.jshint.reporter, 'jshint-stylish');

var styles = lazypipe()
  .pipe($.sass, {
    outputStyle: 'expanded',
    precision: 10
  })
  .pipe($.autoprefixer, 'last 1 version')
  .pipe(gulp.dest, '.tmp/styles');

///////////
// Tasks //
///////////
/**
 *  * Push build to gh-pages
 *   */
gulp.task('deploy', function () {
  return gulp.src("./dist/**/*", { allowEmpty: true })
    .pipe(deploy({'branch':'master'}))
``});
// Alias because I keep forgetting the name.
gulp.task('publish', gulp.series('deploy'))

gulp.task('styles', gulp.series((done) => {
  gulp.src(paths.styles)
    .pipe(styles());
  done();
}));

gulp.task('lint:scripts', (done) => {
  gulp.src(paths.scripts)
    .pipe(lintScripts());
  done();
});

gulp.task('clean:tmp', function (cb) {
  rimraf('./.tmp', cb);
});

gulp.task('start:server', function() {
  $.connect.server({
    root: [yeoman.app, '.tmp'],
    livereload: true,
    // Change this to '0.0.0.0' to access the server from outside.
    port: 9000
  });
});

gulp.task('start:client', gulp.series('start:server', 'styles', function () {
  openURL('http://localhost:9000');
}));


gulp.task('start:server:test', function() {
  $.connect.server({
    root: ['test', yeoman.app, '.tmp'],
    livereload: true,
    port: 9001
  });
});

gulp.task('watch', function () {
  $.watch(paths.styles)
    .pipe($.plumber())
    .pipe(styles())
    .pipe($.connect.reload());

  $.watch(paths.views.files)
    .pipe($.plumber())
    .pipe($.connect.reload());

  $.watch(paths.scripts)
    .pipe($.plumber())
    .pipe(lintScripts())
    .pipe($.connect.reload());

  $.watch(paths.test)
    .pipe($.plumber())
    .pipe(lintScripts());

  gulp.watch('bower.json', ['bower']);
});

gulp.task('serve', gulp.series('clean:tmp',
                              'lint:scripts',
                              'start:client',
                              'watch')
          );

gulp.task('serve:prod', function() {
  $.connect.server({
    root: [yeoman.dist],
    livereload: true,
    port: 9000
  });
});

gulp.task('test', gulp.series('start:server:test', function () {
  var testToFiles = paths.testRequire.concat(paths.scripts, paths.test);
  return gulp.src(testToFiles)
    .pipe($.karma({
      configFile: paths.karma,
      action: 'watch'
    }));
})
);

gulp.task('dist:bower:fonts', function() {
  return gulp.src('./bower_components/**/*.{eot,svg,ttf,woff,woff2}')
    .pipe(flatten())
    .pipe(gulp.dest(yeoman.dist + '/fonts/'))
});

// inject bower components
gulp.task('bower', function () {
  return gulp.src(paths.views.main)
    .pipe(wiredep({
      //  directory: 'bower_components/',
      ignorePath: '..'
    }))
  .pipe(gulp.dest(yeoman.app))
  .pipe(gulp.dest(yeoman.app + '/views/'))
});

///////////
// Build //
///////////

gulp.task('clean:dist', function (cb) {
  rimraf('./dist', cb);
});

gulp.task('html', function () {
  return gulp.src(yeoman.app + '/views/**/*')
    .pipe(gulp.dest(yeoman.dist + '/views'));
});

gulp.task('client:build', gulp.series('html', 'styles', function (done) {
  var jsFilter = $.filter('**/*.js');
  var cssFilter = $.filter('**/*.css');

  gulp.src(paths.views.main, { allowEmpty: true })
    .pipe($.useref({searchPath: [yeoman.app, '.tmp']}))
    .pipe(jsFilter)
    .pipe($.ngAnnotate())
    .pipe($.uglify())
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe($.minifyCss({cache: true}))
    .pipe(cssFilter.restore())
/*    .pipe($.rev())
    .pipe($.revReplace())
*/    .pipe(gulp.dest(yeoman.dist));
    done();
}));


gulp.task('images', function () {
  return gulp.src(yeoman.app + '/images/**/*')
    .pipe($.cache($.imagemin({
        optimizationLevel: 5,
        progressive: true,
        interlaced: true
    })))
    .pipe(gulp.dest(yeoman.dist + '/images'));
});

gulp.task('copy:favicon', function() {
    return gulp.src(yeoman.app + '/favicon.ico')
      .pipe(gulp.dest(yeoman.dist));
});

gulp.task('copy:json', function() {
    return gulp.src(yeoman.app + '/bayes_models/*.json')
      .pipe(gulp.dest(yeoman.dist + '/bayes_models/'));
});

gulp.task('copy:404', function() {
    return gulp.src(yeoman.app + '/404.html')
      .pipe(gulp.dest(yeoman.dist));
});

gulp.task('copy:cname', function() {
    return gulp.src(yeoman.app + '/CNAME')
      .pipe(gulp.dest(yeoman.dist ));
});

gulp.task('copy:extras', function () {
  return gulp.src(yeoman.app + '/*/.*', { dot: true })
    .pipe(gulp.dest(yeoman.dist));
});

gulp.task('copy:fonts', gulp.series('dist:bower:fonts', function () {
  return gulp.src(yeoman.app + '/fonts/**/*')
    .pipe(gulp.dest(yeoman.dist + '/fonts'));
})
);

gulp.task('build', gulp.series('clean:dist',
                               'images',
                               'copy:extras',
                               'copy:json',
                               'copy:fonts',
                               'copy:cname',
                               'copy:404',
                               'copy:favicon',
                               'client:build'));

gulp.task('default', gulp.series('build'));
