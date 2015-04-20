/**
 * Test Gulp Imageoptim
 */

var expect			= require('chai').expect;
var optimizer		= require('../');


describe('Test Gulp Imageoptim', function() {

	it('Should be an object', function() {
		expect(optimizer).to.be.a('object');
	})

	it('Should have method: optimize', function() {
		expect(optimizer['optimize']).to.be.a('function');
	})

})