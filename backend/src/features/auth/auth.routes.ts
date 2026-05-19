import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../middleware/validate.middleware";
import { registerSchema, loginSchema } from "./auth.schema";
import { verifyJWT } from "../../middleware/auth.middleware";

const router = Router();

const authcontroller =  new AuthController();

router.post("/register", validate(registerSchema), authcontroller.register);
router.post("/login", validate(loginSchema), authcontroller.login);
router.post("/refresh", authcontroller.refresh);
router.post("/logout", verifyJWT as any, authcontroller.logout as any);
router.get("/me", verifyJWT as any, authcontroller.getMe as any);

export default router;
