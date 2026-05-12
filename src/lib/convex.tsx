import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import type { ComponentType } from "react";

import { CONVEX_URL } from "astro:env/client";

// Initialized once so all components share the same client.
// CONVEX_URL is injected at build time by `bunx convex deploy` in CI;
// fall back to a placeholder so local `bun run build` doesn't fail.
const client = new ConvexReactClient(CONVEX_URL ?? "https://placeholder.convex.cloud");

type ProviderType = "regular" | "auth";

export function withConvexProvider<P extends object>(
	Component: ComponentType<P>,
	providerType: ProviderType = "regular"
) {
	return function WithConvexProvider(props: P) {
		const Provider = providerType === "auth" ? ConvexAuthProvider : ConvexProvider;

		return (
			<Provider client={client}>
				<Component {...props} />
			</Provider>
		);
	};
}
