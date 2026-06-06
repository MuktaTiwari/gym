import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../middleware/validate.middleware";
import { registerSchema, loginSchema } from "./auth.schema";
import { verifyJWT } from "../../middleware/auth.middleware";

const router = Router();
const authController = new AuthController();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", verifyJWT, authController.logout);
router.get("/me", verifyJWT, authController.getMe);
router.post("/set-password", authController.setPassword);

export default router;
