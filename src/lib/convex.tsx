import { ConvexProvider, ConvexReactClient } from "convex/react";
import type { ComponentType } from "react";

const CONVEX_URL = import.meta.env.CONVEX_URL;

// Initialized once so all components share the same client.
const client = new ConvexReactClient(CONVEX_URL);

export function withConvexProvider<P extends object>(
	Component: ComponentType<P>
) {
	return function WithConvexProvider(props: P) {
		return (
			<ConvexProvider client={client}>
				<Component {...props} />
			</ConvexProvider>
		);
	};
}
