const TOKEN_SCOPE = process.env.AZURE_AGENT_TOKEN_SCOPE || "https://ai.azure.com/.default";
let cachedToken = null;
let tokenExpiresAt = 0;

function getEndpoint() {
  const endpoint = process.env.AZURE_AGENT_ENDPOINT?.trim();
  if (!endpoint) throw new Error("AZURE_AGENT_ENDPOINT is not configured.");
  const parsed = new URL(endpoint);
  if (parsed.protocol !== "https:") throw new Error("Azure Agent endpoint must use HTTPS.");
  return parsed.toString();
}

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) return cachedToken;

  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;
  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Configure AZURE_TENANT_ID, AZURE_CLIENT_ID, and AZURE_CLIENT_SECRET for server-to-server Microsoft Entra authentication.");
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: TOKEN_SCOPE,
    grant_type: "client_credentials",
  });
  const response = await fetch(`https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(15000),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.access_token) {
    throw new Error(`Microsoft Entra token request failed (${response.status}): ${result.error_description || result.error || "Unknown authentication error"}`);
  }
  cachedToken = result.access_token;
  tokenExpiresAt = Date.now() + Number(result.expires_in || 3600) * 1000;
  return cachedToken;
}

function readOutputText(response) {
  if (typeof response.output_text === "string" && response.output_text.trim()) return response.output_text.trim();
  const chunks = [];
  for (const item of response.output ?? []) {
    if (item.type !== "message") continue;
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") chunks.push(content.text);
    }
  }
  return chunks.join("\n").trim();
}

export async function translateWithRakanAgent(text, contentType = "grocery content", targetLanguage = "ar") {
  if (typeof text !== "string" || !text.trim()) return "";
  if (!["ar", "en"].includes(targetLanguage)) {
    throw new Error("The Foundry translation target must be 'ar' or 'en'.");
  }

  const endpoint = getEndpoint();
  const token = await getAccessToken();
  const targetDescription = targetLanguage === "ar"
    ? "natural Jordanian Arabic (عامية أردنية طبيعية)"
    : "clear, natural English";
  const context = contentType === "grocery content"
    ? "This is grocery product/category content. Use the configured Jordanian grocery glossary when the target is Arabic."
    : `This is customer ${contentType}. Translate only the supplied text. Preserve numbers, building/apartment identifiers, street names, landmarks, and directions accurately. Do not add or guess missing details.`;
  const input = [
    `Translate the text below into ${targetDescription}.`,
    `Target language code: ${targetLanguage}.`,
    context,
    "Return only the translation, with no explanation, introduction, quotation marks, or alternatives.",
    "Do not translate, infer, or invent any information that is not present in the supplied text.",
    "",
    text.trim(),
  ].join("\n");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ input }),
    signal: AbortSignal.timeout(30000),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = result.error?.message || result.message || `HTTP ${response.status}`;
    throw new Error(`Rakan Arabic agent request failed: ${detail}`);
  }
  const translated = readOutputText(result);
  if (!translated) throw new Error("Rakan Arabic agent returned an empty translation.");
  return translated;
}

export async function translateCustomerTextSafely(text, contentType) {
  if (!text?.trim() || !process.env.AZURE_AGENT_ENDPOINT) return "";
  try {
    return await translateWithRakanAgent(text, contentType);
  } catch (error) {
    // Translation must never prevent a customer from registering or placing an order.
    console.error(`[Arabic translation] ${contentType} translation failed:`, error.message);
    return "";
  }
}
