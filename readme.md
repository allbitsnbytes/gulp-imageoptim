# Gulp-ImageOptim

Gulp plugin to optimize images using ImageOptim-CLI.

> Please note this plugin uses ImageOptim-CLI.  Unfortunately currently there is no support for Windows and Linux.


So why ImageOptim-CLI?  My personal experience and [current benchmarks](http://jamiemason.github.io/ImageOptim-CLI/) suggest that ImageOptim and ImageAlpha currently outperform alternatives over lossless and lossy optimizations.

[![NPM](https://nodei.co/npm/gulp-imageoptim.png?mini=true)](https://nodei.co/npm/gulp-imageoptim/)


## Install

```
npm install gulp-imageoptim
```


## Usage

```
var gulp = require('gulp');
var imageOptim = require('gulp-imageoptim');


gulp.task('images', function() {
    return gulp.src('src/images/**/*')
        .pipe(imageOptim.optimize())
        .pipe(gulp.dest('build/images'));
});
```


## FAQS

#### Does Gulp-ImageOptim use JPEGmini?

No.  JPEGmini is a paid-for product.  We are using ImageOptim-CLI (ImageOptim and ImageAlpha) without JPEGmini.


#### Can I use this plugin on Windows and Linux?

Unfortunately, ImageOptim and ImageAlpha are not available on those platforms yet.
