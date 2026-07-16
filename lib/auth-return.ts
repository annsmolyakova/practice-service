const APPLICATION_PATH_PREFIX = "/apply/";
const LOCAL_ORIGIN = "http://localhost";

export function getApplicationReturnTo(search: string): string | null {
  const returnTo = new URLSearchParams(search).get("returnTo");

  if (!returnTo?.startsWith("/") || returnTo.startsWith("//")) {
    return null;
  }

  try {
    const url = new URL(returnTo, LOCAL_ORIGIN);

    if (url.origin !== LOCAL_ORIGIN || !url.pathname.startsWith(APPLICATION_PATH_PREFIX)) {
      return null;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function createAuthHref(path: "/login" | "/register", returnTo: string | null) {
  if (!returnTo) {
    return path;
  }

  return `${path}?${new URLSearchParams({ returnTo }).toString()}`;
}
