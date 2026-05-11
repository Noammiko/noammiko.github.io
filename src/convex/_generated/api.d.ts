/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adminSeed from "../adminSeed.js";
import type * as auth from "../auth.js";
import type * as deploy from "../deploy.js";
import type * as discounts from "../discounts.js";
import type * as faqs from "../faqs.js";
import type * as forms from "../forms.js";
import type * as freeAccess from "../freeAccess.js";
import type * as http from "../http.js";
import type * as inquiries from "../inquiries.js";
import type * as musicSettings from "../musicSettings.js";
import type * as notifyDiscord from "../notifyDiscord.js";
import type * as portfolio from "../portfolio.js";
import type * as pricingConfig from "../pricingConfig.js";
import type * as reviews from "../reviews.js";
import type * as sales from "../sales.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  adminSeed: typeof adminSeed;
  auth: typeof auth;
  deploy: typeof deploy;
  discounts: typeof discounts;
  faqs: typeof faqs;
  forms: typeof forms;
  freeAccess: typeof freeAccess;
  http: typeof http;
  inquiries: typeof inquiries;
  musicSettings: typeof musicSettings;
  notifyDiscord: typeof notifyDiscord;
  portfolio: typeof portfolio;
  pricingConfig: typeof pricingConfig;
  reviews: typeof reviews;
  sales: typeof sales;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
