import { Temporal } from "@js-temporal/polyfill";

export interface Deal {
	name: string,
	price: number,
	valuePrice?: number,
	discountTag?: string,
	includes: string[],
	tag?: string
}

export interface Price {
	saleId: string
	groupId: string
	deals: Deal[]
	sale?: {
		name: string
		start: Temporal.Instant
		end: Temporal.Instant
	}
}
