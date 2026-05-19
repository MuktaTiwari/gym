import mongoose from "mongoose";
import { User } from "../models/user.model";
import { Role } from "../enums/roles.enum";
import { env } from "../config/env";

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log("Connected to DB...");

    const existingAdmin = await User.findOne({ role: Role.SUPER_ADMIN });
    if (existingAdmin) {
      console.log("Super Admin already exists!");
      console.log(`Email: ${existingAdmin.email}`);
      process.exit(0);
    }

    const superAdmin = await User.create({
      name: "Super Administrator",
      email: "admin@fitcore.com",
      password: "SuperSecretPassword123!",
      role: Role.SUPER_ADMIN,
    });

    console.log("=========================================");
    console.log("SUCCESS: Super Admin account created!");
    console.log("=========================================");
    console.log(`Email: ${superAdmin.email}`);
    console.log(`Password: SuperSecretPassword123!`);
    console.log("=========================================");
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding Super Admin:", error);
    process.exit(1);
  }
};

seedSuperAdmin();
