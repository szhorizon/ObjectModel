import {bettertypeof, define, extend, isArray, isPlainObject, toString} from "./helpers"
import {checkAssertions, checkDefinition, parseDefinition} from "./definition"
import BasicModel from "./basic-model"
import ObjectModel from "./object-model"


export function Model(def) {
	return isPlainObject(def) ? new ObjectModel(def) : new BasicModel(def)
}

Object.assign(Model.prototype, {
	name: "Model",
	assertions: [],

	conventionForConstant: key => key.toUpperCase() === key,
	conventionForPrivate: key => key[0] === "_",

	toString(stack){
		return parseDefinition(this.definition).map(d => toString(d, stack)).join(" or ")
	},

	as(name){
		define(this, "name", name);
		return this
	},

	defaultTo(val){
		this.default = val
		return this
	},

	_validate(obj, path, errors, stack){
		checkDefinition(obj, this.definition, path, errors, stack)
		checkAssertions(obj, this, path, errors)
	},

	validate(obj, errorCollector){
		this._validate(obj, null, this.errors, [])
		unstackErrors(this, errorCollector)
	},

	test(obj){
		let failed,
		    initialErrorCollector = this.errorCollector

		this.errorCollector = () => {
			failed = true
		}

		new this(obj) // may trigger this.errorCollector

		this.errorCollector = initialErrorCollector
		return !failed
	},

	errorCollector(errors){
		let e = new TypeError(errors.map(e => e.message).join('\n'))
		e.stack = e.stack.replace(/\n.*object-model(.|\n)*object-model.*/, "") // blackbox objectmodel in stacktrace
		throw e
	},

	assert(assertion, description = toString(assertion)){
		define(assertion, "description", description);
		this.assertions = this.assertions.concat(assertion)
		return this
	}
})

export function initModel(model, args) {
	if (args.length === 0) throw new Error("Model definition is required");
	model.definition = args[0]
	model.assertions = [...model.assertions]
	define(model, "errors", [])
	delete model.name;
}

export function extendModel(child, parent, newProps) {
	extend(child, parent, newProps)
	child.assertions.push(...parent.assertions)
	child.errorCollector = parent.errorCollector
	return child
}

export function unstackErrors(model, errorCollector = model.errorCollector) {
	if (!model.errors.length) return

	const errors = model.errors.map(err => {
		if (!err.message) {
			const def = isArray(err.expected) ? err.expected : [err.expected]
			err.message = ("expecting " + (err.path ? err.path + " to be " : "") + def.map(d => toString(d)).join(" or ")
			+ ", got " + (err.received != null ? bettertypeof(err.received) + " " : "") + toString(err.received))
		}
		return err
	})
	model.errors = []
	errorCollector.call(model, errors) // throw all errors collected
}

export default Model