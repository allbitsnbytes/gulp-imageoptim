/**
 * Gulp plugin to optimize images using imageoptim.
 */

var chalk			= require ('chalk'),
	exec			= require ('child_process').exec,
	fs				= require ('fs'),
	md5				= require ('blueimp-md5'),
	path			= require ('path'),
	through			= require ('through2')


/**
 * Assert to parameter is of type object.
 *
 * @param {Mixed} param - The parameter to check the type of
 *
 * @throws {TypeError} Throws TypeError is actual type is not Object
 */
var assertObject = function (param) {
	var type = ({}).toString.call (param).replace ('[object ', '').replace (']', '')

	if (type !== 'Object') {
		throw new TypeError('Expected object but got ' + type)
	}
}


/**
 * Assign all properties from a source object to a destination object.
 *
 * @param {Object} dest - The object to be updated
 * @param {Object} src - The source object to assign missing properties from
 * @return {Object} - Returns updated object
 *
 * @throws {TypeError} - Throws TypeError if expected parameters are not objects
 */
var assign = function (dest, src) {
	assertObject (dest)
	assertObject (src)

	Object.keys (src).forEach (function (i) {
		dest[i] = src[i]
	})

	return dest
}


/**
 * Create and return a new object with all the properties of the provided object.
 *
 * @param {Object} obj - The object to clone
 * @return {Object} - Returns clone of provided object
 *
 * @throws {TypeError} - Throws TypeError if expected parameter is not an object
 */
var clone = function (obj) {
	assertObject (obj)

	var newObj = {}

	Object.keys (obj).forEach (function (i) {
		newObj[i] = obj[i]
	});

	return newObj
}


/**
 * Plugin.
 */
function BatchOptimizer () {

	/**
	 * Default configuration options.
	 * @type {Object}
	 */
	var config = {}

	/**
	 * Whether to display optimization status or not.
	 * @type {Boolean}
	 */
	config.status = true

	/**
	 * Batch size is the number of files to batch optimize.
	 * @type {Int}
	 */
	config.batchSize = 400

	/**
	 * Whether to use jpegmini or not.
	 * @type {Boolean}
	 *
	 * Before enabling this feature complete the following steps
	 * 1. Install JPEGmini
	 * 2. Open JPEGmini then add Terminal.app (or iTerm.app) to 'support for assistive devices' whitelist
	 */
	config.jpegmini = false

	/**
	 * Array of files to batch optimize.
	 * @type {Array}
	 */
	var batchFiles = []

	/**
	 * Reference to stream.
	 * @type {Object}
	 */
	var stream = null

	/**
	 * Remove directory.
	 *
	 * @param {String} dirPath - Path to directory
	 */
	var removeDirectory = function (dirPath) {
		var files = []

		if (fs.lstatSync (dirPath).isDirectory ()) {
			files = fs.readdirSync (dirPath)

			files.forEach (function (file) {
				var curPath = path.join (dirPath, file)

				if (fs.lstatSync (curPath).isDirectory ()) {
					removeDirectory (curPath)
				} else {
					fs.unlinkSync (curPath)
				}
			})

			fs.rmdirSync (dirPath)
		}
	}

	/**
	 * Batch optimize files and push.
	 *
	 * @param {Array} files - Array of files to batch optimize
	 * @param {Object} options - Options.  Currently status is supported as boolean indicating whether to display optmization result status or not
	 * @param {Function} next - The callback to continue processing
	 */
	var batchOptimize = function (files, options, next) {
		if (files.length === 0)
			next (files)

		var batchDir = md5 (Date.now ()),
			jpegminiEnabled = options.jpegmini ? '--jpegmini' : '',
			scriptParams = path.normalize (batchDir) + ' ' + jpegminiEnabled

        // Make batch directory
		fs.mkdirSync (batchDir)

		// Add files to optimize to batch directory
		for (var i = 0, length = files.length; i < length; i++) {
			var file = files[i]

			file.batchFilePath = path.join (batchDir, md5 (file.path) + path.extname (file.path))
            fs.writeFileSync (file.batchFilePath, file.contents)
		}

		// Optimize files
		exec ('bash node_modules/gulp-imageoptim/scripts/optimize.bash ' + scriptParams, function (error, stdout) {
			var result = {}

			if (error === null) {
				var savings = parseInt (stdout.replace (/.*\(([0-9]+)(\.[0-9]+)?\%\)/, '$1')),
					msg = ''

				if (savings > 0) {

					// Copy optimized file contents to original and remove file
					for (var i = 0, length = files.length; i < length; i++) {
						var file = files[i]

						file.contents = new Buffer(fs.readFileSync (file.batchFilePath))
						stdout = stdout.replace (file.batchFilePath, path.basename (file.path))
					}

					msg = stdout.replace ('TOTAL was', 'Filesize total was')
				} else {
					msg = 'Saving: 0%\n'
				}

				result = {
					'files'		: files.length,
					'msg'		: msg,
					'savings'	: savings,
					'type'		: 'success'
				}
			} else {
				console.error (error)
			}

			// Delete batch directory
			removeDirectory (batchDir)

			// Display optmization result status?
			if (options.status) {
				displayOptimizationResults (result)
			}

			next (files)
		})
	}

	/**
	 * Push files to stream.
	 *
	 * @param {Array} files - Array of optimized files to push
	 */
	var pushFiles = function (files) {
		if (typeof stream !== 'object')
			return

		for (var i = 0, length = files.length; i < length; i++) {
			stream.push (files[i])
		}
	}

	/**
	 * Display batch results.
	 *
	 * @param {Object} result - The result to display from batch optimization
	 */
	var displayOptimizationResults = function (result) {
		if (typeof result === 'object') {
			switch (result.type) {
				case 'success':
					console.log ('Batch of ' + result.files + ' files optimized:\n' + chalk.gray (result.msg))
					break

				case 'error':
					console.log (chalk.red (result.msg))
					break
			}
		}
	}

	/**
	 * Public functions
	 */
	return {

		/**
		 * Optimize images.
		 *
		 * @param {Object} opts - Options to customize optimization
		 * @return {Stream} - Returns through object
		 */
		'optimize' : function (opts) {
			var options = clone (config)

			// Set config optiosn to use for this current optimization session
			assign (options, opts)

			if (options.status) {
				console.log (chalk.yellow.bgBlack ('Starting image optimization ... this may take a while.'))
			}

			return through.obj (function (file, enc, cb) {
				stream = this

				// If file is null continue
				if (file.isNull ()) {
					cb (null, file)

					return
				}

				// Add file to batch
				batchFiles.push (file)

				if (batchFiles.length >= options.batchSize) {
					batchOptimize (batchFiles, options, function (files) {
						pushFiles (files)
						batchFiles = []
						cb ()
					})
				} else {
					cb ()
				}
			},

			function (cb) {
				batchOptimize (batchFiles, options, function (files) {
					pushFiles (files)
					batchFiles = []

					if (options.status) {
						console.log (chalk.green.bgBlack ('Optimization complete!'))
					}

					cb ()
				})
			})
		}
	}
}


/**
 * Export
 */
module.exports = BatchOptimizer ()
