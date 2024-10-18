import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/", async (req, res) => {
  const { userId, accountName, balance } = req.body;
  try {
    const account = await prisma.account.create({
      data: {
        accountName,
        balance,
        user: { connect: { id: parseInt(userId) } },
      },
    });
    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ error: "Error creating account" });
  }
});

router.get("/api/v1/accounts", async (req, res) => {
  try {
    const accounts = await prisma.account.findMany();
    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ error: "Error fetching accounts" });
  }
});

router.get("/api/v1/accounts/:accountId", async (req, res) => {
  const { accountId } = req.params;
  try {
    const account = await prisma.account.findUnique({
      where: { id: parseInt(accountId) },
    });
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }
    res.status(200).json(account);
  } catch (error) {
    res.status(500).json({ error: "Error fetching account" });
  }
});

export default router;
