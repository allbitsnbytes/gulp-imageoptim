/**
 * Gulp plugin to optimize images using imageoptim.
 */

var _				= require('lodash');
var chalk			= require('chalk');
var exec			= require('child_process').exec;
var fs				= require('fs');
var md5				= require('blueimp-md5');
var path			= require('path');
var through			= require('through2');


/**
 * Plugin
 */
function optimizer() {

	/**
	 * Default configuration options
	 * @type {Object}
	 */
	var config = {};

	/**
	 * Whether to display optimization status or not
	 * @type {Boolean}
	 */
	config.status = true;

	/**
	 * Prefix to use for temporary file name
	 * @type {String}
	 */
	config.prefix = 'imgOptim-';


	/**
	 * Public functions
	 */
	return {

		/**
		 * Optimize images
		 * @param {Object} options Options to customize optimization
		 * @return {Stream}
		 */
		optimize: function(options) {
			var imageOptim = 'sh ./node_modules/gulp-imageoptim/node_modules/.bin/imageOptim -a -c -q';
			var curConfig = _.clone(config);

			// Set config optiosn to use for this current optimization session
			_.assign(curConfig, options);

			return through.obj(function(file, enc, cb) {

				// If file is null continue
	 			if (file.isNull()) {
	 				cb(null, file);

	 				return;
	 			}

				// Create temporary file to preserve integrity of original file
				file.optimizedImagePath = path.join(path.dirname(file.path), md5(file.path) + path.extname(file.path));

				// Copy file contents to temporary file
				fs.writeFileSync(file.optimizedImagePath, fs.readFileSync(file.path), {encoding: enc});

				exec('find ' + file.optimizedImagePath + ' | ' + imageOptim + ' | grep TOTAL ', function(error, stdout, stderr) {
					if (error === null) {
						var savings = parseInt(stdout.replace(/.*\(([0-9]+)(\.[0-9]+)?\%\)/, '$1'));
						var status = '';

						if (savings > 0) {
							file.contents = new Buffer(fs.readFileSync(file.optimizedImagePath));
							
							status = chalk.green(file.path) + '\n' + chalk.gray(stdout.replace('TOTAL was', 'Optimized.  Was'));
						} else {
							status = chalk.yellow(file.path) + '\n' + chalk.gray('Not optimized.  Saving: 0%\n');
						}
					} else {
						status = chalk.red(error);
					}

					if (curConfig.status) {
						console.log(status);
					}

					// Remove temporary file and tempfile path reference
					fs.unlinkSync(file.optimizedImagePath);

					cb(null, file);
				});
			});
		}
		
	};
}


/**
 * Export 
 */
module.exports 	= optimizer();