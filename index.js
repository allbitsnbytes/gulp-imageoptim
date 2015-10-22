/**
 * Gulp plugin to optimize images using imageoptim.
 */

var _				= require('lodash');
var Chalk			= require('chalk');
var Exec			= require('child_process').exec;
var Fs				= require('fs');
var Md5				= require('blueimp-md5').md5;
var Path			= require('path');
var PluginError		= require('gulp-util').pluginError;
var Through			= require('through2');


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
	 * @deprecated
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
		optimize: function(opt) {
			var imageOptim = 'sh ./node_modules/gulp-imageoptim/node_modules/.bin/imageOptim -a -c -q';
			var options = _.clone(config);
			
			opt = opt || {};

			// Set config optiosn to use for this current optimization session
			_.assign(options, opt);

			return Through.obj(function(file, enc, cb) {

				// If file is null continue
	 			if (file.isNull()) {
	 				cb(null, file);
	 				return;
	 			}
				 
				if (file.isStream()) {
					this.emit('error', new PluginError('gulp-imageoptim', 'Streaming not supported'));
					cb(null, file);
					return;
				}

				// Create temporary file to preserve integrity of original file
				file.optimizedImagePath = Path.join(Path.dirname(file.path), Md5(file.path) + Path.extname(file.path));

				// Copy file contents to temporary file
				Fs.writeFileSync(file.optimizedImagePath, Fs.readFileSync(file.path), {encoding: enc});

				Exec('find ' + file.optimizedImagePath + ' | ' + imageOptim + ' | grep TOTAL ', function(error, stdout) {
					var status = '';
					
					if (error === null) {
						var savings = parseInt(stdout.replace(/.*\(([0-9]+)(\.[0-9]+)?\%\)/, '$1'));

						if (savings > 0) {
							file.contents = new Buffer(Fs.readFileSync(file.optimizedImagePath));

							status = Chalk.green(file.path) + '\n' + Chalk.gray(stdout.replace('TOTAL was', 'Optimized.  Was'));
						} else {
							status = Chalk.yellow(file.path) + '\n' + Chalk.gray('Not optimized.  Saving: 0%\n');
						}
					} else {
						status = Chalk.red(error);
					}

					if (options.status) {
						console.log(status);
					}

					// Remove temporary file and tempfile path reference
					Fs.unlinkSync(file.optimizedImagePath);

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
