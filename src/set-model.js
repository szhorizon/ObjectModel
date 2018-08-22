import { _validate, checkAssertions, checkDefinition, extendDefinition, extendModel, formatDefinition, Model, stackError } from "./object-model.js"
import { initListModel } from "./list-model.js"
import { extend, is, isIterable } from "./helpers.js"

export default function SetModel(initialDefinition) {
	let model = initListModel(
		Set,
		SetModel,
		initialDefinition,
		it => isIterable(it) ? new Set([...it]) : it,
		set => new Set(set),
		{
			"add": [0,0],
			"delete": [],
			"clear": []
		}
	)

	return model
}

extend(SetModel, Model, {
	toString(stack) {
		return "Set of " + formatDefinition(this.definition, stack)
	},

	[_validate](set, path, errors, stack, shouldCast) {
		if (is(Set, set)) {
			for (let item of set.values()) {
				let casted = checkDefinition(item, this.definition, `${path || "Set"} value`, errors, stack, shouldCast)
				if(shouldCast && casted !== item){
					set.delete(item)
					set.add(casted)
				}
			}
		} else stackError(errors, this, set, path)
		checkAssertions(set, this, path, errors)
		return set
	},

	extend(...newParts) {
		return extendModel(new SetModel(extendDefinition(this.definition, newParts)), this)
	}
})