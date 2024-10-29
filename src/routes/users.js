import express from "express";
import { PrismaClient } from "@prisma/client";
import Joi from "joi";

const router = express.Router();
const prisma = new PrismaClient();

// Joi schema for user and profile validation
const userSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  profile: Joi.object({
    age: Joi.number().integer().min(18).required(),
    bio: Joi.string().optional(),
    identityType: Joi.string().required(), // Required field based on Prisma schema
    identityNumber: Joi.string().required(), // Required field based on Prisma schema
    address: Joi.string().required(), // Required field based on Prisma schema
  }).required(),
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the user
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 description: The email of the user
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 description: The password of the user
 *                 example: P@ssw0rd123
 *               profile:
 *                 type: object
 *                 description: Profile information associated with the user
 *                 properties:
 *                   bio:
 *                     type: string
 *                     description: The biography of the user
 *                     example: Software developer from XYZ.
 *                   age:
 *                     type: integer
 *                     description: Age of the user
 *                     example: 25
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID of the user
 *                   example: 1
 *                 name:
 *                   type: string
 *                   description: Name of the user
 *                   example: John Doe
 *                 email:
 *                   type: string
 *                   description: Email of the user
 *                   example: johndoe@example.com
 *                 profile:
 *                   type: object
 *                   description: Profile information of the user
 *                   properties:
 *                     bio:
 *                       type: string
 *                       description: Biography of the user
 *                       example: Software developer from XYZ.
 *                     age:
 *                       type: integer
 *                       description: Age of the user
 *                       example: 25
 *       400:
 *         description: Bad request - validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Validation error: email is required"
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
 *                   example: "Internal Server Error"
 */

router.post("/", async (req, res) => {
  const { error, value } = userSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { name, email, password, profile } = value;

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        profile: {
          create: profile,
        },
      },
      include: { profile: true },
    });
    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error); // Log full error to the console
    res.status(500).json({ error: error.message }); // Send full error message to the client
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve a list of users
 *     description: Fetches all users from the database along with their associated profile information.
 *     responses:
 *       200:
 *         description: A list of users with their profile information
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID of the user
 *                     example: 1
 *                   name:
 *                     type: string
 *                     description: Name of the user
 *                     example: John Doe
 *                   email:
 *                     type: string
 *                     description: Email of the user
 *                     example: johndoe@example.com
 *                   profile:
 *                     type: object
 *                     description: Profile information of the user
 *                     properties:
 *                       bio:
 *                         type: string
 *                         description: Biography of the user
 *                         example: Software developer from XYZ.
 *                       age:
 *                         type: integer
 *                         description: Age of the user
 *                         example: 25
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
 *                   example: "Error fetching users"
 */

router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { profile: true },
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

export default router;
