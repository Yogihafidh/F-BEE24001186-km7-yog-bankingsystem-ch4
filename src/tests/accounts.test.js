import request from "supertest";
import express from "express";
import accountsRouter from "../routes/accounts";
import { PrismaClient } from "@prisma/client";

const app = express();
app.use(express.json());
app.use("/accounts", accountsRouter);

const prisma = new PrismaClient();

beforeAll(async () => {
  // Tambahkan field email dan data yang diperlukan
  await prisma.user.create({
    data: {
      id: 1,
      name: "Yogi Hafidh Maulana",
      email: "yogi@gmail.com",
      password: "admin123", 
    },
  });
});

afterAll(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe("Accounts API", () => {
  let testAccountId;

  it("POST /accounts harus membuat akun baru", async () => {
    const response = await request(app).post("/accounts").send({
      userId: 1,
      accountName: "Test Account",
      balance: 500.0,
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    testAccountId = response.body.id;
  });

  it("GET /accounts harus mengambil semua akun", async () => {
    const response = await request(app).get("/accounts");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("GET /accounts/:accountId harus mengambil akun berdasarkan ID", async () => {
    const response = await request(app).get(`/accounts/${testAccountId}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", testAccountId);
  });

  it("GET /accounts/:accountId harus memberi 404 jika akun tidak ditemukan", async () => {
    const response = await request(app).get("/accounts/999999");
    expect(response.status).toBe(404);
  });
});
