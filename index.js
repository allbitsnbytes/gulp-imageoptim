/**
 * Gulp plugin to optimize images using imageoptim.
 */

var chalk		= require('chalk');
var imageoptim	= require('imageoptim');
var through		= require('through2');
 

/**
 * Plugin
 */
function optimizer() {

	/**
	 * Default configuration options
	 * @type {object}
	 */
	var config = {};

	/**
	 * Whether to display optimization status or not
	 * @type {boolean}
	 */
	config.status = true;

	/**
	 * Diplay status on screen
	 */

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

				// Optimize image
				imageoptim.optim(file.path)
					.then(function(result) {
						if (curConfig.status) {
							var msg = '';

							if (result.exitCode === imageoptim.SUCCESS) {
								msg = chalk.green('%s optimized\t\t\t%s', result.name, result.savedBytes);
							} else if (result.exitCode === imageoptim.CANT_COMPRESS) {
								msg = chalk.yellow('%s cannot optimize', result.name);
							} else if (result.exitCode === imageoptim.DOESNT_EXIT) {
								msg = chalk.red('%s does not exist');
							}

							console.log(msg);
						}

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