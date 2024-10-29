import express from "express";
import users from "./routes/users.js";
import accounts from "./routes/accounts.js";
import transactions from "./routes/transactions.js";
import { createServer } from "http";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swaggerOptions.js"; // Import konfigurasi Swagger

async function main() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  app.use("/api/v1/users", users);
  app.use("/api/v1/accounts", accounts);
  app.use("/api/v1/transactions", transactions);

  app.use("/api/v1/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  server.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });
}

main();
