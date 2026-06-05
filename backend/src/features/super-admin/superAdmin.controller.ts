import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { Gym } from "../../models/gym.model";
import { Member } from "../../models/member.model";
import { User } from "../../models/user.model";
import { Role } from "../../enums/roles.enum";
import mongoose from "mongoose";
import { sendWelcomeEmail } from "../../utils/email";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";

export class SuperAdminController {
  getDashboardData = asyncHandler(async (req: Request, res: Response) => {
    // Platform Stats
    const totalGyms = await Gym.countDocuments();
    const totalMembers = await Member.countDocuments();
    
    // Gyms List with Owner Info
    const gyms = await Gym.find()
      .populate("ownerId", "name email")
      .lean();

    // Get members count per gym
    const gymIds = gyms.map(g => g._id);
    const memberCounts = await Member.aggregate([
      { $match: { gymId: { $in: gymIds } } },
      { $group: { _id: "$gymId", count: { $sum: 1 } } }
    ]);

    const memberCountMap = memberCounts.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr.count;
      return acc;
    }, {} as Record<string, number>);

    const formattedGyms = gyms.map((gym: any) => ({
      id: gym._id,
      name: gym.name,
      owner: gym.ownerId?.name || "Unknown",
      email: gym.ownerId?.email || "N/A",
      members: memberCountMap[gym._id.toString()] || 0,
      plan: gym.plan || "Standard",
      status: gym.status || "ACTIVE"
    }));

    return res.status(200).json({
      success: true,
      data: {
        platformStats: {
          totalGyms,
          totalMembers,
          uptime: "99.98%", // Mocked for now
          mrr: "$0", // Mocked for now
        },
        gyms: formattedGyms
      }
    });
  });

  addGym = asyncHandler(async (req: Request, res: Response) => {
    const { name, ownerName, ownerEmail, password } = req.body;

    if (!name || !ownerName || !ownerEmail) {
      return res.status(400).json({ success: false, message: "Gym name, owner name, and owner email are required" });
    }

    // Generate a secure random password if not provided (they will reset it anyway)
    const initialPassword = password || Math.random().toString(36).slice(-10) + "A1!";

    // Check if user exists
    const existingUser = await User.findOne({ email: ownerEmail.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "A user with this email already exists" });
    }

    const userId = new mongoose.Types.ObjectId();
    const gymId = new mongoose.Types.ObjectId();

    // Create the Gym
    const gym = new Gym({
      _id: gymId,
      name,
      ownerId: userId,
    });
    await gym.save();

    // Create the Gym Owner User
    const user = new User({
      _id: userId,
      name: ownerName,
      email: ownerEmail.toLowerCase(),
      password: initialPassword,
      role: Role.GYM_OWNER,
      gymId: gym._id,
    });
    await user.save();

    // Generate setup token
    const setupToken = jwt.sign(
      { _id: user._id, isMember: false }, 
      env.ACCESS_TOKEN_SECRET!, 
      { expiresIn: '7d' }
    );

    // Send email notification
    sendWelcomeEmail({
      email: user.email,
      name: user.name,
      role: user.role,
      contextMessage: `for ${gym.name}`,
      setupToken
    });

    return res.status(201).json({
      success: true,
      message: "Gym and owner created successfully",
      data: {
        gym,
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      }
    });
  });

  updateGym = asyncHandler(async (req: Request, res: Response) => {
    const { gymId } = req.params;
    const { name, plan, status } = req.body;

    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ success: false, message: "Gym not found" });
    }

    if (name) gym.name = name;
    if (plan) gym.plan = plan;
    if (status) gym.status = status;

    await gym.save();

    return res.status(200).json({
      success: true,
      message: "Gym updated successfully",
      data: gym
    });
  });

  suspendGym = asyncHandler(async (req: Request, res: Response) => {
    const { gymId } = req.params;
    
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ success: false, message: "Gym not found" });
    }

    gym.status = gym.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    await gym.save();

    return res.status(200).json({
      success: true,
      message: `Gym ${gym.status.toLowerCase()} successfully`,
      data: gym
    });
  });
}
