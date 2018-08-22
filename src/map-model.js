import {
	_validate, checkAssertions, checkDefinition, extendDefinition, extendModel,
	format, formatDefinition, Model, stackError
} from "./object-model.js";
import { initListModel } from "./list-model.js"
import { extend, is, isIterable } from "./helpers.js"

export default function MapModel(initialKeyDefinition, initialValueDefinition) {
	let model = initListModel(
		Map,
		MapModel,
		{ key: initialKeyDefinition, value: initialValueDefinition },
		it => isIterable(it) ? new Map(it) : it,
		map => new Map(map),
		{
			"set": [0, 1, i => i === 0 ? model.definition.key : model.definition.value],
			"delete": [],
			"clear": []
		}
	)

	return model
}

extend(MapModel, Model, {
	toString(stack) {
		let { key, value } = this.definition
		return `Map of ${formatDefinition(key, stack)} : ${formatDefinition(value, stack)}`
	},

	[_validate](map, path, errors, stack, shouldCast) {
		if (is(Map, map)) {
			path = path || 'Map'
			for (let [key, val] of map) {
				let ckey = checkDefinition(key, this.definition.key, `${path} key`, errors, stack, shouldCast)
				let cval = checkDefinition(val, this.definition.value, `${path}[${format(key)}]`, errors, stack, shouldCast)
				if(shouldCast && (ckey !== key || cval !== val)){
					if(ckey !== key) map.delete(key)
					map.set(ckey, cval)
				}
			}
		} else stackError(errors, this, map, path)

		checkAssertions(map, this, path, errors)
		return map
	},

	extend(keyParts, valueParts) {
		let { key, value } = this.definition
		return extendModel(new MapModel(
			extendDefinition(key, keyParts),
			extendDefinition(value, valueParts)
		), this)
	}
})