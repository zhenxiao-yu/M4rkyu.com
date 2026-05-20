// Currency formatting for the shop. Money is stored as integer cents;
// format only at the edge. Locale switches the grouping/format while
// keeping USD as the settlement currency.
export function formatPrice(
  cents: number,
  locale = "en",
  currency = "usd",
): string {
  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}
