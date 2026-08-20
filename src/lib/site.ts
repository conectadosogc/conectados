export function getSiteUrl() {
  const explicitUrl = process.env.APP_URL?.trim();
  if (explicitUrl) {
    return explicitUrl.replace(/\/+$/, "");
  }

  const productionHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.VERCEL_URL?.trim();
  if (productionHost) {
    const normalizedHost = productionHost.replace(/^https?:\/\//, "").replace(/\/+$/, "");
    return `https://${normalizedHost}`;
  }

  return "http://localhost:3000";
}
