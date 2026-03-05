export function validateApiKey(request: Request): boolean {
  const key = request.headers.get("x-api-key");
  return key === process.env.BLOG_API_KEY;
}
