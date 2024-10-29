// routes/transactions.js
import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Create a new transaction
 *     description: Creates a new transaction between a sender and a receiver, recording the amount transferred.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               senderAccountId:
 *                 type: integer
 *                 description: ID of the sender's account
 *                 example: 1
 *               receiverAccountId:
 *                 type: integer
 *                 description: ID of the receiver's account
 *                 example: 2
 *               amount:
 *                 type: number
 *                 description: Amount of money to be transferred
 *                 example: 100.50
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID of the created transaction
 *                   example: 1
 *                 amount:
 *                   type: number
 *                   description: The amount transferred
 *                   example: 100.50
 *                 sender:
 *                   type: object
 *                   description: The sender account details
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID of the sender's account
 *                       example: 1
 *                 receiver:
 *                   type: object
 *                   description: The receiver account details
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID of the receiver's account
 *                       example: 2
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Error creating transaction"
 */

router.post("/", async (req, res) => {
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

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Retrieve a list of transactions
 *     description: Fetches all transactions from the database, including details of the sender and receiver.
 *     responses:
 *       200:
 *         description: A list of transactions with sender and receiver details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID of the transaction
 *                     example: 1
 *                   amount:
 *                     type: number
 *                     description: Amount of money transferred
 *                     example: 100.50
 *                   sender:
 *                     type: object
 *                     description: The sender's account details
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID of the sender's account
 *                         example: 1
 *                       name:
 *                         type: string
 *                         description: Name of the sender
 *                         example: John Doe
 *                   receiver:
 *                     type: object
 *                     description: The receiver's account details
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID of the receiver's account
 *                         example: 2
 *                       name:
 *                         type: string
 *                         description: Name of the receiver
 *                         example: Jane Doe
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Error fetching transactions"
 */

router.get("/", async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: { sender: true, receiver: true },
    });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Error fetching transactions" });
  }
});

/**
 * @swagger
 * /transactions/{transactionId}:
 *   get:
 *     summary: Retrieve a specific transaction by ID
 *     description: Fetches a single transaction from the database, including details of the sender and receiver, based on the transaction ID.
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the transaction to retrieve
 *         example: 1
 *     responses:
 *       200:
 *         description: Transaction details with sender and receiver information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID of the transaction
 *                   example: 1
 *                 amount:
 *                   type: number
 *                   description: Amount of money transferred
 *                   example: 100.50
 *                 sender:
 *                   type: object
 *                   description: The sender's account details
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID of the sender's account
 *                       example: 1
 *                     name:
 *                       type: string
 *                       description: Name of the sender
 *                       example: John Doe
 *                 receiver:
 *                   type: object
 *                   description: The receiver's account details
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID of the receiver's account
 *                       example: 2
 *                     name:
 *                       type: string
 *                       description: Name of the receiver
 *                       example: Jane Doe
 *       404:
 *         description: Transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Transaction not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Error fetching transaction"
 */

router.get("/:transactionId", async (req, res) => {
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
