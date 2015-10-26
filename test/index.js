/**
 * Test Gulp Imageoptim
 */

var expect			= require('chai').expect;
var optimizer		= require('../');


describe('Test Gulp Imageoptim', function() {

	it('Should be an object', function() {
		expect(optimizer).to.be.a('object');
	})

	it('Should have imageoptim-cli dependency', function() {
		var path = require.resolve('imageoptim-cli');

		expect(path).to.be.a('string').and.to.contain('imageoptim-cli/bin/imageOptim');
	})

	it('Should have method: optimize', function() {
		expect(optimizer['optimize']).to.be.a('function');
	})

})