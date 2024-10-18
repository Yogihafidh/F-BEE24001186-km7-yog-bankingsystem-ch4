import express from "express";
import users from "./routes/users.js";
import accounts from "./routes/accounts.js";
import transactions from "./routes/transactions.js";
import { createServer } from "http";

async function main() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  // Registering routes with base paths
  app.use("/api/v1/users", users); // This registers the users route at /api/v1/users
  app.use("/api/v1/accounts", accounts);
  app.use("/api/v1/transactions", transactions);

  server.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });
}

main();
