export function upload<F = (request, response) => Promise<unknown>>(
  file,
  url,
  opts,
  uploadFn: F
): F;
