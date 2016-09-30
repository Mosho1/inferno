import hoistStatics from 'hoist-non-inferno-statics';
import createElement from 'inferno-create-element';

interface IProps {
	ref: any;
}

const grabStoresByName = (storeNames) => (baseStores, nextProps) => {
	storeNames.forEach(function(storeName) {

		// Prefer props over stores
		if (storeName in nextProps) {
			return;
		}

		if (!(storeName in baseStores)) {
			throw new Error(
				`MobX observer: Store "${storeName}" is not available! ` +
				`Make sure it is provided by some Provider`
			);
		}

		nextProps[storeName] = baseStores[storeName];
	});
	return nextProps;
};

/**
 * Higher order component that injects stores to a child.
 * takes either a varargs list of strings, which are stores read from the context,
 * or a function that manually maps the available stores from the context to props:
 * storesToProps(mobxStores, props, context) => newProps
 */
function inject (grabStoresFn): any {

	if (typeof grabStoresFn !== 'function') {

		let storesNames: any = [];
		for (let i = 0; i < arguments.length; i++) {
			storesNames[i] = arguments[i];
		}

		grabStoresFn = grabStoresByName(storesNames);
	}

	return (componentClass) => {
		function MobxWrapper(props, context) {

			const newProps = <IProps> {};
			for (let key in props) {
				if (props.hasOwnProperty(key)) {
					newProps[key] = props[key];
				}
			}

			const additionalProps = grabStoresFn(context.mobxStores || {}, newProps, context) || {};
			for ( let key in additionalProps ) {
				newProps[ key ] = additionalProps[ key ];
			}

			return createElement(componentClass, newProps);
		}

		hoistStatics(MobxWrapper, componentClass);
		return MobxWrapper;
	};
}

export default inject;
