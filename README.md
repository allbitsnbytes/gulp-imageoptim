# Gulp-ImageOptim

Gulp plugin to optimize images using ImageOptim and JPEGmini.

> Please note this plugin uses ImageOptim-CLI.  Unfortunately currently there is no support for Windows and Linux.


So why ImageOptim-CLI?  My personal experience and [current benchmarks](http://jamiemason.github.io/ImageOptim-CLI/) suggest that ImageOptim and ImageAlpha currently outperform alternatives over lossless and lossy optimizations.


## Install

[![NPM](https://nodei.co/npm/gulp-imageoptim.png?downloadRank=true)](https://nodei.co/npm/gulp-imageoptim/)


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


## Methods

### .optimize(options)

Optimize images using ImageOptim-CLI


## Options

### jpegmini

To enable JPEGmini support, set the option to true

Type: Boolean
Default: ` false `


### status

Set to false to disable optimize summary in console.

Type: Boolean
Default: ` true `


### batchSize

Batch size

Type: Integer
Default: ` 100 `



## FAQS

#### Does Gulp-ImageOptim use JPEGmini?

Yes, however, please note that JPEGmini is a paid-for product.  We are using ImageOptim-CLI (ImageOptim and ImageAlpha) without JPEGmini.  To use JPEGmini you will need to [purchase it](http://jpegmini.com).


#### Enabling JPEGmini and support for assistive devices

You may be presented with the following message the first time you run Gulp Imageoptim with the jpegmini flag set to true:

> To automate JPEGmini we need to add Terminal.app (or iTerm.app etc) to the 'support for assistive devices' whitelist.

The JPEGmini OS X Apps don't include a command line API, so a real user is simulated by entering synthetic clicks and keyboard commands instead. This requires your permission and is easily set up in System Preferences as shown by these guides.

+ [Enable access for assistive devices in OS X Yosemite](http://www.klabouch.com/?p=98).
+ [OS X Mavericks: Enable access for assistive devices and applications](http://support.apple.com/en-us/HT6026)


#### How do I enable JPEGmini in my gulp task?

```
var gulp = require('gulp');
var imageOptim = require('gulp-imageoptim');


gulp.task('images', function() {
    return gulp.src('src/images/**/*')
        .pipe(imageOptim.optimize({
			jpegmini: true
		}))
        .pipe(gulp.dest('build/images'));
});
```


#### Can I use this plugin on Windows and Linux?

Unfortunately, ImageOptim and ImageAlpha are not available on those platforms yet.
