import invariant from 'invariant';
import reactiveMixin from './reactiveMixin';
import inject from './inject';
import { Component } from "inferno-component";

const lifecycleMethods = [
	'componentWillMount',
	'componentWillUnmount',
	'componentDidMount',
	'componentDidUpdate'
];

/**
 * Wraps a component and provides stores as props
 */
function connect (arg1: string | any, arg2 = null): any {
	invariant(typeof arg1 !== 'string', 'Store names should be provided as array');

	if (Array.isArray(arg1)) {
		// component needs stores
		if (!arg2) {
			// invoked as decorator
			return componentClass => connect(arg1, componentClass);
		} else {
			// TODO: deprecate this invocation style
			return inject.apply(null, arg1)(connect(arg2));
		}
	}
	const componentClass = arg1;

	invariant(componentClass, 'Please pass a valid component to "observer"');

	const target: Component = componentClass.prototype || componentClass;

	lifecycleMethods.forEach(funcName => patch(target, funcName));

	if (!target.shouldComponentUpdate) {
		target.shouldComponentUpdate = reactiveMixin.shouldComponentUpdate;
	}

	return componentClass;
}

/**
 * Patch the component with reactive properties
 */
function patch (target, funcName) {
	const base = target[funcName];
	const mixinFunc = reactiveMixin[funcName];
	if (!base) {
		target[funcName] = mixinFunc;
	} else {
		target[funcName] = function() {
			base.apply(this, arguments);
			mixinFunc.apply(this, arguments);
		};
	}
}

export default connect;
