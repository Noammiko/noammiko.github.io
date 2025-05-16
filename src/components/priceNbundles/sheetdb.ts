import { Temporal } from "@js-temporal/polyfill";
import type { Price } from "./types";

const timeZone = "America/Toronto";
const dbUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTBXq_KVP3VVKYz1n5ZQlLsxdfBUaCL5rapG6cIjlP9D_Gzwl06u0KjuAGQx84btvpkl-vTcn-2-NgG/pub?gid=416902011&single=true&output=tsv"
const header = "sale id\tgroup id\tname\tsubtitle\tprice\tvalue price\tdiscount tag\tincludes\ttag\tsale start\tsale end\tsale name";

export async function getPricesAndBundles() {
	// fetch url, follow redirect
	const response = await fetch(dbUrl);
	if (response.status !== 200) {
		throw new Error(`Failed to fetch dbUrl: ${response.statusText}`);
	}
	const text = await response.text();
	// console.log(text)
	return parsePriceList(text);
}

export function getCurrentPricesAndBundles(prices: Price[], now?: Temporal.Instant) {
	if (prices.length === 1) {
		return prices[0];
	}
	if (!now) {
		now = Temporal.Now.instant()
	}
	const sale = prices.find(price =>
		price.sale &&
		Temporal.Instant.compare(price.sale.end, now) >= 0 &&
		Temporal.Instant.compare(price.sale.start, now) <= 0
	);
	return sale ?? prices[0];
}


function parseTime(timeString: string) {
	const [month, day, yearAndTime] = timeString.split("/");
	const [year, time] = yearAndTime.split(" ");
	const [hour, minute, second] = time.split(":").map(Number);

	const zonedDateTime = Temporal.ZonedDateTime.from({
		year: Number(year),
		month: Number(month),
		day: Number(day),
		hour,
		minute,
		second,
		timeZone: timeZone,
	});

	return zonedDateTime;
}

function parsePriceList(priceList: string) {
	const lines = priceList.split("\r\n");
	if (lines[0] !== header) {
		console.error(`expected: "${header}"\ngot: "${lines[0]}"`);
		throw new Error("Invalid header");
	}
	const data = lines.slice(1);
	if (data.length % 3 !== 0) {
		throw new Error("Invalid data length");
	}
	const res: Price[] = [];
	for (let i = 0; i < data.length; i += 3) {
		const [saleId, groupId, _3, _4, _5, _6, _7, _8, _9, saleStart, saleEnd, saleName] = data[i].split("\t");

		const priceGroup: Price = {
			saleId: saleId,
			groupId: groupId,
			deals: [],
		}
		if (saleName) {
			priceGroup.sale = {
				name: saleName,
				start: parseTime(saleStart).toInstant(),
				end: parseTime(saleEnd).toInstant()
			}
		}

		for (let j = i; j < i + 3; j++) {
			const [_1, _2, name, subtitle, price, valuePrice, discountTag, includes, tag, _9, _10, _11] = data[j].split("\t");
			priceGroup.deals.push({
				name: name,
				subtitle: subtitle,
				price: parseFloat(price.replace("$", "")),
				valuePrice: valuePrice ? parseFloat(valuePrice.replace("$", "")) : undefined,
				discountTag: discountTag ? discountTag.replace("%", "") : undefined,
				includes: includes.split(",").map(s => s.trim()),
				tag: tag ? tag : undefined
			});
		}

		res.push(priceGroup);
	}
	return res;
}
