// pages/api/users/index.ts
import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import { authMiddleware } from "@/utils/authMiddleware"; // for role-based access

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  // Only logged in users can call this API
  const currentUser = await authMiddleware(req, res, ["superadmin", "shopkeeper"]);
  if (!currentUser) return; // authMiddleware already handled unauthorized

  try {
    switch (req.method) {
      // 📌 GET all users in same business
      case "GET": {
        const users = await User.find({
          business: currentUser.business,
          isDeleted: false,
        }).select("-passwordHash");

        return res.status(200).json(users);
      }

      // 📌 POST create new user
      case "POST": {
        const { name, phone, email, password, role } = req.body;

        if (!name || (!phone && !email)) {
          return res
            .status(400)
            .json({ message: "Name and phone/email are required" });
        }

        // Default role = shopkeeper if not provided
        const userRole = role || "shopkeeper";

        // Prepare subscription only if shopkeeper
        let subscription = undefined;
        if (userRole === "shopkeeper") {
          let defaultPlan = await SubscriptionPlan.findOne({ isDefault: true });
          if (!defaultPlan) {
            defaultPlan = await SubscriptionPlan.create({
              name: "Free Trial",
              durationInDays: 30,
              price: 0,
              features: ["basic"],
              isDefault: true,
            });
          }

          const startDate = new Date();
          const endDate = new Date();
          endDate.setDate(startDate.getDate() + defaultPlan.durationInDays);

          subscription = {
            plan: defaultPlan._id,
            startDate,
            endDate,
            isActive: true,
          };
        }

        const newUser = new User({
          name,
          phone,
          email,
          passwordHash: password, // hashed in pre-save hook
          role: userRole,
          business: currentUser.business, // tenant isolation
          createdBy: currentUser._id,
          subscription,
        });

        await newUser.save();

        return res.status(201).json({
          message: "User created successfully",
          user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            subscription: newUser.subscription,
          },
        });
      }

      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error: any) {
    console.error("User API error:", error);
    return res.status(500).json({ message: error.message });
  }
}
