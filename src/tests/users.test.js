import request from "supertest";
import express from "express";
import usersRouter from "../routes/users"; // Sesuaikan path ini jika berbeda
import { PrismaClient } from "@prisma/client";

const app = express();
app.use(express.json());
app.use("/users", usersRouter);

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe("Users API", () => {
  // Test POST /users
  it("POST /users harus membuat pengguna baru", async () => {
    const newUser = {
      name: "Yogi Hafidh Maulana",
      email: "yogi@gmail.com",
      password: "admin123",
      profile: {
        identityType: "KTP",
        identityNumber: "123456789",
        address: "Jl. Purwokerto No. 1",
      },
    };

    const response = await request(app).post("/users").send(newUser);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe("John Doe");
    expect(response.body.email).toBe("johndoe@example.com");
    expect(response.body).toHaveProperty("profile");
    expect(response.body.profile.age).toBe(25);
  });

  // Test GET /users
  it("GET /users harus mengambil daftar pengguna", async () => {
    const response = await request(app).get("/users");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    if (response.body.length > 0) {
      expect(response.body[0]).toHaveProperty("id");
      expect(response.body[0]).toHaveProperty("name");
      expect(response.body[0]).toHaveProperty("email");
      expect(response.body[0]).toHaveProperty("profile");
      expect(response.body[0].profile).toHaveProperty("age");
    }
  });

  // Test untuk validasi input POST /users
  it("POST /users harus mengembalikan 400 jika data tidak valid", async () => {
    const invalidUser = {
      name: "Yogi",
      email: "yogi@gmail.com",
      password: "yogiHafidhMaulana",
      profile: {
        age: 20,
        identityType: "KTP",
        identityNumber: "123456789",
        address: "Jl. Purwokerto No. 1",
      },
    };

    const response = await request(app).post("/users").send(invalidUser);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toContain("Validation error");
  });
});
