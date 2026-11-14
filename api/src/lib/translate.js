function getConfig() {
  const key = process.env.AZURE_TRANSLATOR_KEY;
  const endpoint = process.env.AZURE_TRANSLATOR_ENDPOINT?.replace(/\/$/, "");
  const region = process.env.AZURE_TRANSLATOR_REGION;
  if (!key || !endpoint || !region) {
    throw new Error("Azure Translator is not configured. Set AZURE_TRANSLATOR_KEY, AZURE_TRANSLATOR_ENDPOINT, and AZURE_TRANSLATOR_REGION in api/.env.");
  }
  return { key, endpoint, region };
}

export async function translateTexts(texts, source, target) {
  const values = texts.map((value) => value ?? "");
  const indexes = values.map((value, index) => value.trim() ? index : -1).filter((index) => index >= 0);
  if (!indexes.length || source === target) return values;

  const { key, endpoint, region } = getConfig();
  const url = new URL(`${endpoint}/translate`);
  url.searchParams.set("api-version", "3.0");
  url.searchParams.set("from", source);
  url.searchParams.set("to", target);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": key,
        "Ocp-Apim-Subscription-Region": region,
      },
      body: JSON.stringify(indexes.map((index) => ({ Text: values[index] }))),
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw new Error("Azure Translator request timed out. Please try again.");
    throw new Error("Could not reach Azure Translator. Check the endpoint and server connection.");
  } finally {
    clearTimeout(timeout);
  }
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Azure Translator failed (${response.status}). ${detail.slice(0, 300)}`);
  }
  const result = await response.json();
  indexes.forEach((originalIndex, resultIndex) => {
    const translated = result?.[resultIndex]?.translations?.[0]?.text;
    if (typeof translated !== "string" || !translated.trim()) {
      throw new Error("Azure Translator returned an empty translation. Please retry or enter the translation manually.");
    }
    values[originalIndex] = translated;
  });
  return values;
}

/**
 * The form submits name/description in its active language.
 * Only fields present in the request are translated; untouched pairs remain unchanged.
 */
export async function buildBilingualContent(data, language, current = {}) {
  if (language !== "ar" && language !== "en") {
    throw new Error("A valid content language (en or ar) is required.");
  }
  const result = {};
  const source = language;
  const target = language === "ar" ? "en" : "ar";
  const fields = ["name", "description"];
  const inputs = fields.map((field) => data[field]);
  const indexes = inputs.map((value, index) =>
    value !== undefined && typeof value === "string" && value.trim() ? index : -1
  ).filter((index) => index >= 0);
  const translated = indexes.length
    ? await translateTexts(indexes.map((index) => inputs[index]), source, target)
    : [];
  const translations = new Map(indexes.map((index, i) => [index, translated[i]]));

  fields.forEach((field, index) => {
    if (data[field] === undefined) return;
    const englishKey = field;
    const arabicKey = `${field}Ar`;
    if (language === "en") {
      result[englishKey] = data[field];
      result[arabicKey] = translations.get(index) ?? current[arabicKey] ?? "";
    } else {
      result[arabicKey] = data[field];
      result[englishKey] = translations.get(index) ?? current[englishKey] ?? "";
    }
  });
  return result;
}
