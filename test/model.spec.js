/* global QUnit, Model, BasicModel, ObjectModel */

QUnit.module("Generic Model");

QUnit.test("Generic models constructor && proto", function (assert) {
	assert.ok(Model instanceof Function, "Model is defined");

	assert.ok(Model(Number) instanceof BasicModel, "test model constructor 1/4");
	assert.ok(Model({}) instanceof ObjectModel, "test model constructor 2/4");
	assert.ok(Model([]) instanceof BasicModel, "test model constructor 3/4");
	assert.ok(Model() instanceof BasicModel, "test model constructor 4/4");
});

QUnit.test("Model names", function(assert) {
	let NamedModel = Model({}).as("Test");
	assert.equal(NamedModel.name, "Test", "test model name 1/2")
	let namedInstance = NamedModel({});
	assert.equal(Object.getPrototypeOf(namedInstance).constructor.name, "Test", "test model name 2/2");
})