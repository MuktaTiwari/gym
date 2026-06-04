import { z } from "zod";
import { Role } from "../../enums/roles.enum";

export const registerSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Name is required" }).min(2, "Name must be at least 2 characters"),
    email: z.string({ required_error: "Email is required" }).email("Invalid email address"),
    password: z.string({ required_error: "Password is required" }).min(6, "Password must be at least 6 characters"),
    role: z.nativeEnum(Role, { required_error: "Role is required" }),
    gymName: z.string().optional(),
    gymId: z.string().optional(),
  }).refine((data) => {
    if (data.role === Role.GYM_OWNER && !data.gymName) {
      return false;
    }
    if ((data.role === Role.GYM_ADMIN || data.role === Role.TRAINER) && !data.gymId) {
      return false;
    }
    return true;
  }, {
    message: "Missing gymName for GYM_OWNER or missing gymId for GYM_ADMIN/TRAINER",
    path: ["role"]
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required" }).email("Invalid email address"),
    password: z.string({ required_error: "Password is required" }),
  })
});
