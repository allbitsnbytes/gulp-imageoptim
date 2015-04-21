#Gulp-ImageOptim

Gulp plugin to optimize images using imageoptim.


##Install

```
npm install gulp-imageoptim
```


##Usage

```
var gulp = require('gulp');
var imageOptim = require('gulp-imageoptim');


gulp.task('images', function() {
    return gulp.src('src/images/**/*')
        .pipe(imageOptim.optimize())
        .pipe(gulp.dest('build/images'));
});
```
