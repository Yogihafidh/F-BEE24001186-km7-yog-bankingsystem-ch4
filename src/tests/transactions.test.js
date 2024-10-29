import request from "supertest";
import express from "express";
import transactionsRouter from "../routes/transactions";
import { PrismaClient } from "@prisma/client";

const app = express();
app.use(express.json());
app.use("/transactions", transactionsRouter);

const prisma = new PrismaClient();

beforeAll(async () => {
  const user = await prisma.user.create({
    data: {
      id: 1,
      name: "Test User",
      email: "testuser@example.com",
      password: "TestPassword123",
    },
  });

  await prisma.bankAccount.create({
    data: {
      id: 1,
      userId: user.id,
      bankName: "Bank A",
      bankAccountNumber: "1234567890",
      balance: 1000.0,
    },
  });
  await prisma.bankAccount.create({
    data: {
      id: 2,
      userId: user.id,
      bankName: "Bank B",
      bankAccountNumber: "0987654321",
      balance: 500.0,
    },
  });
});

afterAll(async () => {
  await prisma.transaction.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe("Transactions API", () => {
  // Test POST /transactions
  it("POST /transactions harus berhasil membuat transaksi baru", async () => {
    const response = await request(app).post("/transactions").send({
      senderAccountId: 1,
      receiverAccountId: 2,
      amount: 100.5,
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.amount).toBe(100.5);
  });

  // Test GET /transactions
  it("GET /transactions harus mengambil daftar transaksi", async () => {
    const response = await request(app).get("/transactions");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    if (response.body.length > 0) {
      expect(response.body[0]).toHaveProperty("id");
      expect(response.body[0]).toHaveProperty("amount");
      expect(response.body[0]).toHaveProperty("sender");
      expect(response.body[0]).toHaveProperty("receiver");
    }
  });

  // Test GET /transactions/:transactionId
  it("GET /transactions/:transactionId harus mengambil transaksi berdasarkan ID", async () => {
    const transaction = await prisma.transaction.create({
      data: {
        amount: 200,
        sender: { connect: { id: 1 } },
        receiver: { connect: { id: 2 } },
      },
    });

    const response = await request(app).get(`/transactions/${transaction.id}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", transaction.id);
    expect(response.body).toHaveProperty("amount", 200);
    expect(response.body).toHaveProperty("sender");
    expect(response.body).toHaveProperty("receiver");
  });

  // Test for handling non-existent transaction
  it("GET /transactions/:transactionId harus mengembalikan 404 jika transaksi tidak ditemukan", async () => {
    const response = await request(app).get("/transactions/999999");

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error", "Transaction not found");
  });
});
