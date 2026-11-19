# Azure AI Foundry Jordanian Arabic Agent Setup

This API integration calls the existing Rakan Arabic localization agent. It does not create another agent and does not change the agent's saved instructions.

## 1. Configure server-to-server authentication

The API uses Microsoft Entra client-credentials authentication. The endpoint URL alone is not an authentication credential.

1. In the Azure portal, open **Microsoft Entra ID → App registrations → New registration**.
2. Create an app registration for the Rakan Shop backend, for example `rakan-shop-api`.
3. Copy its **Directory (tenant) ID** and **Application (client) ID**.
4. Open **Certificates & secrets → New client secret**. Copy the secret value immediately; it is shown only once.
5. Open the Foundry project/resource that owns `Rakan-Arabic-Localization-Agent`.
6. Open **Access control (IAM) → Add role assignment**.
7. Assign **Foundry Agent Consumer** to the app registration's service principal at the project scope (or the narrowest supported agent scope).
8. Ensure the agent endpoint authorization includes `AzureRbac` (the default Foundry-resource audience scheme). This integration requests `https://ai.azure.com/.default`.

The service principal needs the endpoint interaction permission. Assigning a role to the app registration is separate from merely creating the registration.

## 2. Configure `api/.env`

Copy the values into the backend environment only:

```env
AZURE_AGENT_ENDPOINT=https://saifullahafridi08-7504-resource.services.ai.azure.com/api/projects/saifullahafridi08-7504/agents/Rakan-Arabic-Localization-Agent/endpoint/protocols/openai/responses
AZURE_TENANT_ID=your-directory-tenant-id
AZURE_CLIENT_ID=your-application-client-id
AZURE_CLIENT_SECRET=your-client-secret-value
AZURE_AGENT_TOKEN_SCOPE=https://ai.azure.com/.default
```

Never put these credentials in `frontend/.env`, commit them to Git, or send them in chat. If the endpoint is configured with the preview `AgentBlueprint` scheme instead of `AzureRbac`, set `AZURE_AGENT_TOKEN_SCOPE` to the exact configured agent blueprint scope; the client-credentials flow must also be allowed by that scheme's token validation rules.

## 3. Database migration

Run from the `api` directory:

```bash
npm run db:migrate:deploy
npx prisma generate
```

The migration adds `Customer.addressAr`, `Order.addressAr`, and `Order.noteAr`. Existing original address and note values are preserved; existing rows receive empty Arabic fields until updated or backfilled.

## 4. Behavior

- The Foundry agent handles both English -> Jordanian Arabic and Arabic -> English.
- The selected app language does not control database storage. The language of the submitted text determines the translation direction.
- Product/category names and descriptions are saved as English fields (`name`, `description`) plus Arabic fields (`nameAr`, `descriptionAr`).
- Customer addresses and delivery instructions are saved as English/Arabic pairs (`address`/`addressAr`, `note`/`noteAr`).
- The submitted wording is preserved in its matching language field. Only the text field being translated is sent to the agent.
- Customer names, phone numbers, payment information, and order details are never sent to the agent.
- If a customer-text translation is temporarily unavailable, the original is preserved and the counterpart remains empty for a later backfill. Product/category translation errors are returned to the admin rather than silently saving incomplete content.
- Azure Translator environment variables may remain configured, but the active localization code does not call Azure Translator.

## 5. Translate existing customer/order records (optional)

After the migration and Entra credentials are configured, run `npm run translate:customers:backfill` from `api`. It fills missing language counterparts in both directions, preserves existing complete pairs, and repairs legacy records where Arabic was entered in an English-named column. It may incur model usage charges.


## Important: update the saved Foundry agent instructions

The current saved agent instructions may require Jordanian Arabic output only. That conflicts with Arabic -> English translation. Update the existing `Rakan-Arabic-Localization-Agent` instructions (do not create a new agent) using the companion file `FOUNDRY-AGENT-INSTRUCTIONS.md`. The API sends an explicit target language on every request, but the agent's saved instructions must permit both targets for this to work reliably.
