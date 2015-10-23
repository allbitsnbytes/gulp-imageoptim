/**
 * Gulp plugin to optimize images using imageoptim.
 */

var _				= require('lodash');
var chalk			= require('chalk');
var exec			= require('child_process').exec;
var fs				= require('fs');
var md5				= require('blueimp-md5').md5;
var path			= require('path');
var through			= require('through2');


/**
 * Plugin
 */
function BatchOptimizer() {

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
	 * Batch size is the number of files to batch optimize
	 * @type {Int}
	 */
	config.batchSize = 100;

	/**
	 * Array of files to batch optimize
	 * @type {Array}
	 */
	var batchFiles = [];

	/**
	 * Batch results
	 * @type {Array}
	 */
	var batchResults = [];

	/**
	 * CLI command to run imageoptim-cli
	 * @type {String}
	 */
	var imageOptim = 'sh ' + require.resolve('imageoptim-cli') + ' -a -c -q -d';

	/**
	 * Reference to stream
	 * @type {Object}
	 */
	var stream = null;

	/**
	 * Remove directory
	 * @param {String} dirPath Path to directory
	 */
	var removeDirectory = function(dirPath) {
		var files = [];

		if (fs.lstatSync(dirPath).isDirectory()) {
			files = fs.readdirSync(dirPath);

			files.forEach(function(file, index) {
				var curPath = path.join(dirPath, file);

				if (fs.lstatSync(curPath).isDirectory()) {
					removeDirectory(curPath);
				} else {
					fs.unlinkSync(curPath);
				}
			});

			fs.rmdirSync(dirPath);
		}
	}

	/**
	 * Batch optimize files and push
	 * @param {Array} files Array of files to batch optimize
	 * @param {Object} options Options.  Currently status is supported as boolean indicating whether to display optmization result status or not
	 * @param {Function} next The callback to continue processing
	 */
	var batchOptimize = function(files, options, next) {
		if (files.length === 0)
			next(files);

		var batchDir = md5(Date.now());

		// Make batch directory
		fs.mkdirSync(batchDir);

		// Add files to optimize to batch directory
		for (var i = 0, length = files.length; i < length; i++) {
			var file = files[i];

			file.batchFilePath = path.join(batchDir, md5(file.path) + path.extname(file.path));
			fs.writeFileSync(file.batchFilePath, fs.readFileSync(file.path));
		}

		// Optimize files
		exec(imageOptim + ' ' + path.normalize(batchDir) + ' | grep TOTAL ', function(error, stdout) {
			var result = {};

			if (error === null) {
				var savings = parseInt(stdout.replace(/.*\(([0-9]+)(\.[0-9]+)?\%\)/, '$1'));
				var msg = '';

				if (savings > 0) {

					// Copy optimized file contents to original and remove file
					for (var i = 0, length = files.length; i < length; i++) {
						var file = files[i];

						file.contents = new Buffer(fs.readFileSync(file.batchFilePath));
					}

					msg = stdout.replace('TOTAL was', 'Filesize total was');
				} else {
					msg = 'Saving: 0%\n';
				}

				result = {
					type: 'success',
					files: files.length,
					savings: savings,
					msg: msg
				};
			} else {
				result = {
					type: 'error',
					msg: error
				};
			}

			// Delete batch directory
			removeDirectory(batchDir);

			// Display optmization result status?
			if (options.status) {
				batchResults.push(result);
			}

			next(files);
		});
	};

	/**
	 * Push files to stream
	 * @param {Array} files Array of optimized files to push
	 */
	var pushFiles = function(files) {
		if (typeof stream !== 'object')
			return;

		for (var i = 0, length = files.length; i < length; i++) {
			stream.push(files[i]);
		}
	}

	/**
	 * Display batch results
	 */
	var displayOptimizationResults = function() {
		var index = 1;

		batchResults.forEach(function(result) {
			if (result.type) {
				switch (result.type) {
					case 'success':
						status = 'Batch ' + index + ': ' + result.files + ' files';
						status = (result.savings > 0) ? chalk.green(status) : chalk.yellow(status);
						console.log(status + '\n' + chalk.gray(result.msg));
						break;

					case 'error':
						console.error(chalk.red('Batch ' + index + ': Errors') + '\n' + chalk.gray(result.msg));
						break;
				}
				
				index++;
			}

		});
	}

	/**
	 * Public functions
	 */
	return {

		/**
		 * Optimize images
		 * @param {Object} opts Options to customize optimization
		 * @return {Stream}
		 */
		optimize: function(opts) {
			var options = _.clone(config);

			// Set config optiosn to use for this current optimization session
			_.assign(options, opts);

			return through.obj(function(file, enc, cb) {
				stream = this;

				// If file is null continue
	 			if (file.isNull()) {
	 				cb(null, file);

	 				return;
	 			}

				// Add file to batch
				batchFiles.push(file);

				if (batchFiles.length >= options.batchSize) {
					batchOptimize(batchFiles, options, function(files) {
						pushFiles(files);
						batchFiles = [];
						cb();
					});
				} else {
					cb();
				}
			},
			function(cb) {
				batchOptimize(batchFiles, options, function(files) {
					pushFiles(files);
					batchFiles = [];
					displayOptimizationResults();
					cb();
				});
			});
		}
	};
}


/**
 * Export
 */
module.exports 	= BatchOptimizer();
