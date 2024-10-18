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

// GET route for fetching all users
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
