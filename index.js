/**
 * Gulp plugin to optimize images using imageoptim.
 */

var _				= require('lodash');
var chalk			= require('chalk');
var imageoptim		= require('imageoptim');
var path			= require('path');
var prettyBytes		= require('pretty-bytes');
var shell			= require('shelljs');
var through			= require('through2');


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
	 * Where to create temporary directory for image compression
	 * @type {String}
	 */
	config.tmp = '.';


	/**
	 * Display status for optimized images
	 *
	 * @private
	 * @param {String[]} files Files that were optimized
	 * @return {String} Formatted report
	 */
	var report = function(files) {
		var msgs = [];

		if (!_.isArray(files)) {
			files = [files];
		}

		files.forEach(function(file) {
			if (file.exitCode === imageoptim.SUCCESS) {
				msgs.push(chalk.green(file.name + ' optimized, saved ' + prettyBytes(file.savedBytes) + ' bytes'));
			} else if (file.exitCode === imageoptim.CANT_COMPRESS) {
				msgs.push(chalk.yellow(file.name + ' cannot optimize'));
			} else if (file.exitCode === imageoptim.DOESNT_EXIT) {
				msgs.push(chalk.red(file.name + ' does not exist'));
			}
		});

		return msgs.join('\n');
	}


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
				imageoptim.optim([file.path])
					.then(function(result) {
						if (curConfig.status) {
							console.log(report(result));
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