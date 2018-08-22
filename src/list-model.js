import { _original, _validate, MODE_CAST, checkAssertions, checkDefinition, initModel, unstackErrors } from "./object-model.js"
import { extend, has, isFunction, proxifyFn, proxifyModel, setConstructor } from "./helpers.js"

export const initListModel = (base, constructor, def, init, clone, mutators, otherTraps = {}) => {

	let model = function (list = model.default, mode) {
		list = init(list)
		if(mode !== MODE_CAST){
			list = model[_validate](list, null, model.errors, [], true)
			unstackErrors(model)
		}

		return proxifyModel(list, model, Object.assign({
			get(l, key) {
				if (key === _original) return l

				let val = l[key];
				return isFunction(val) ? proxifyFn(val, (fn, ctx, args) => {
					if (has(mutators, key)) {
						// indexes of arguments to check def + cast
						let [begin, end = args.length-1, getArgDef] = mutators[key];
						for (let i = begin; i <= end; i++) {
							let argDef = getArgDef ? getArgDef(i) : model.definition
							args[i] = checkDefinition(args[i], argDef, `${base.name}.${key} arguments[${i}]`, model.errors, [],	true);
						}

						if(model.assertions.length > 0){
							let testingClone = clone(l)
							fn.apply(testingClone, args)
							checkAssertions(testingClone, model, `after ${key} mutation`)
						}

						unstackErrors(model)
					}

					return fn.apply(l, args)
				}) : val
			}
		}, otherTraps))
	}

	extend(model, base)
	setConstructor(model, constructor)
	initModel(model, def)
	return model
}