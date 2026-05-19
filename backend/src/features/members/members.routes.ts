import { Router } from "express";
import { MembersController } from "./members.controller";
import { verifyJWT } from "../../middleware/auth.middleware";

const router = Router();
const membersController = new MembersController();

// All member routes are protected
router.use(verifyJWT as any);

router.get("/", membersController.getMembers as any);
router.post("/", membersController.createMember as any);
router.get("/:id", membersController.getMember as any);

export default router;
