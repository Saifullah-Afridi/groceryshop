import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

const server = app.listen(env.port, () => console.log(`Rakan API running on http://localhost:${env.port}`));

let shuttingDown = false;
const shutdown = async () => {
  if (shuttingDown) return;
  shuttingDown = true;
  server.close(async (error) => {
    if (error) console.error("Error while closing HTTP server:", error);
    try {
      await prisma.$disconnect();
    } finally {
      process.exit(error ? 1 : 0);
    }
  });
  // Do not leave the process hanging forever if a request never completes.
  setTimeout(() => process.exit(1), 10000).unref();
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
