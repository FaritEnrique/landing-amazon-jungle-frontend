const escapeJsonForHtml = (json: string) => {
  return json
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
};

export const serializeJsonLd = (value: unknown) => {
  return escapeJsonForHtml(JSON.stringify(value));
};

export const getJsonLdKey = (value: unknown, fallback: string) => {
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const item = value as Record<string, unknown>;
  const id = item["@id"];

  if (typeof id === "string" && id.trim()) {
    return id;
  }

  const type = item["@type"];
  const name = item.name;

  if (typeof type === "string" && typeof name === "string") {
    return `${type}:${name}`;
  }

  if (typeof type === "string" && type.trim()) {
    return `${fallback}:${type}`;
  }

  return fallback;
};
