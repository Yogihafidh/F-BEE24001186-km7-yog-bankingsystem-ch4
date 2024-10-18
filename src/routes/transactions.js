// routes/transactions.js
import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/api/v1/transactions", async (req, res) => {
  const { senderAccountId, receiverAccountId, amount } = req.body;
  try {
    const transaction = await prisma.transaction.create({
      data: {
        amount,
        sender: { connect: { id: parseInt(senderAccountId) } },
        receiver: { connect: { id: parseInt(receiverAccountId) } },
      },
    });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: "Error creating transaction" });
  }
});

// GET /api/v1/transactions: Menampilkan daftar transaksi
router.get("/api/v1/transactions", async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: { sender: true, receiver: true },
    });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Error fetching transactions" });
  }
});

// GET /api/v1/transactions/:transactionId: Menampilkan detail transaksi beserta pengirim dan penerimanya
router.get("/api/v1/transactions/:transactionId", async (req, res) => {
  const { transactionId } = req.params;
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(transactionId) },
      include: { sender: true, receiver: true },
    });
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ error: "Error fetching transaction" });
  }
});

export default router;
