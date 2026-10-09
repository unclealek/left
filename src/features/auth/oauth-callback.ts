export async function completePkceCallback(
  callback: string,
  expectedRedirect: string,
  exchange: (code: string) => Promise<{ error: unknown }>,
) {
  const url = new URL(callback);
  const expected = new URL(expectedRedirect);
  if (url.protocol !== expected.protocol || url.host !== expected.host || url.pathname !== expected.pathname ||
      url.username || url.password || url.hash || url.searchParams.has("access_token") ||
      url.searchParams.has("refresh_token") || url.searchParams.has("error") ||
      url.searchParams.getAll("code").length !== 1 || !url.searchParams.get("code")) {
    throw new Error("Invalid authorization callback");
  }
  const { error } = await exchange(url.searchParams.get("code")!);
  if (error) throw error;
}
