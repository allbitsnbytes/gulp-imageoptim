/**
 * Gulp plugin to optimize images using imageoptim.
 */

var _				= require('lodash');
var chalk			= require('chalk');
var fs				= require('fs');
var imageoptim		= require('imageoptim');
var path			= require('path');
var prettyBytes		= require('pretty-bytes');
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
	 * @type {boolean}
	 */
	config.status = true;


	/**
	 * Public functions
	 */
	return {

		/**
		 * Optimize images
		 * @param {object} options Options to customize optimization
		 * @return {stream}
		 */
		optimize: function(options) {
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
				file.optimizedImagePath = path.join(path.dirname(file.path), 'imageOptim-' + path.basename(file.path));

				// Copy file contents to temporary file
				fs.writeFileSync(file.optimizedImagePath, fs.readFileSync(file.path), {encoding: enc});

				// Optimize image
				imageoptim.optim([file.optimizedImagePath])
					.then(function(res) {
						var fileInfo = res[0];

						// Update file contents with optimized contents if file was optimized
						if (fileInfo.exitCode === imageoptim.SUCCESS) {
							file.contents = new Buffer(fs.readFileSync(file.optimizedImagePath));
						}					

						if (curConfig.status) {
							if (fileInfo.exitCode === imageoptim.SUCCESS) {
								console.log(chalk.green('Success, saved %s : %s'), prettyBytes(fileInfo.savedBytes), fileInfo.name);
							} else if (fileInfo.exitCode === imageoptim.CANT_COMPRESS) {
								console.log(chalk.yellow('Failed: %s'), fileInfo.name);
							} else if (fileInfo.exitCode === imageoptim.DOESNT_EXIT) {
								console.log(chalk.red('Not found: '), fileInfo.name);
							}
						}

						// Remove temporary file and tempfile object reference
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