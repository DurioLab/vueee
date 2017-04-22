var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var rename = require('gulp-rename');
var component = require('gulp-component-builder');

gulp.task('browser-sync',function(){
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });

    gulp.watch("src/**/*.*", ['reload']);
    gulp.watch("component.json", ['reload']);
    gulp.watch("index.html", ['reload']);
})

gulp.task('component-build',function(){
  return gulp.src('component.json')
    .pipe(component.scripts())
    .pipe(rename('seed.js'))
    .pipe(gulp.dest('dist'));
})

gulp.task('reload',['component-build'],function(){
		browserSync.reload();
})

gulp.task('serve', ['browser-sync','component-build'],function(){

})