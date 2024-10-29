import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /accounts:
 *   post:
 *     summary: Create a new account for a user
 *     description: Creates a new account associated with a user, including the account name and balance.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user to associate with the account
 *                 example: 1
 *               accountName:
 *                 type: string
 *                 description: Name of the account
 *                 example: "Savings Account"
 *               balance:
 *                 type: number
 *                 description: Initial balance of the account
 *                 example: 1000.00
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID of the created account
 *                   example: 1
 *                 accountName:
 *                   type: string
 *                   description: Name of the account
 *                   example: "Savings Account"
 *                 balance:
 *                   type: number
 *                   description: The account balance
 *                   example: 1000.00
 *                 userId:
 *                   type: integer
 *                   description: ID of the user associated with the account
 *                   example: 1
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
 *                   example: "Error creating account"
 */
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

/**
 * @swagger
 * /accounts:
 *   get:
 *     summary: Retrieve a list of accounts
 *     description: Fetches all accounts from the database.
 *     responses:
 *       200:
 *         description: A list of accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID of the account
 *                     example: 1
 *                   accountName:
 *                     type: string
 *                     description: Name of the account
 *                     example: "Savings Account"
 *                   balance:
 *                     type: number
 *                     description: Balance of the account
 *                     example: 1000.00
 *                   userId:
 *                     type: integer
 *                     description: ID of the user associated with the account
 *                     example: 1
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
 *                   example: "Error fetching accounts"
 */
router.get("/", async (req, res) => {
  try {
    const accounts = await prisma.account.findMany();
    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ error: "Error fetching accounts" });
  }
});

/**
 * @swagger
 * /accounts/{accountId}:
 *   get:
 *     summary: Retrieve a specific account by ID
 *     description: Fetches a single account from the database based on the account ID.
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the account to retrieve
 *         example: 1
 *     responses:
 *       200:
 *         description: Details of the requested account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID of the account
 *                   example: 1
 *                 accountName:
 *                   type: string
 *                   description: Name of the account
 *                   example: "Savings Account"
 *                 balance:
 *                   type: number
 *                   description: Balance of the account
 *                   example: 1000.00
 *                 userId:
 *                   type: integer
 *                   description: ID of the user associated with the account
 *                   example: 1
 *       404:
 *         description: Account not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Account not found"
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
 *                   example: "Error fetching account"
 */
router.get("/:accountId", async (req, res) => {
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
