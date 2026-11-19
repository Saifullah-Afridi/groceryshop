# Azure Translator setup for Rakan Shop

1. Copy `.env.example` to `.env` in this `api` folder.
2. Keep your existing database, Supabase, JWT, admin, and SMTP values.
3. Set these server-side values:
   - `AZURE_TRANSLATOR_KEY`
   - `AZURE_TRANSLATOR_ENDPOINT`
   - `AZURE_TRANSLATOR_REGION`
4. Do not add the Azure key to the frontend `.env` or commit it to source control.
5. The API translates product and category names when the admin saves them. Customer language switching reads the stored `name`/`nameAr` fields. Product and category descriptions are not used or stored. Customer language switching does not call Azure.
6. Existing records with blank Arabic text can be backfilled without overwriting existing Arabic values using `npm run translate:backfill` from this folder.

The endpoint should be the endpoint shown by your Azure Translator resource, for example `https://api.cognitive.microsofttranslator.com`. Do not append `/translate`; the backend adds it.
