// pages/api/users/[id].ts
import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { authMiddleware } from "@/utils/authMiddleware";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  // superadmin + shopkeeper allowed
  const currentUser = await authMiddleware(req, res, ["superadmin", "shopkeeper"]);
  if (!currentUser) return;

  const { id } = req.query;

  try {
    const user = await User.findOne({
      _id: id,
      business: currentUser.business,
      isDeleted: false,
    }).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // shopkeepers should not be able to edit/delete other shopkeepers or superadmins
    if (
      currentUser.role === "shopkeeper" &&
      (user.role === "shopkeeper" || user.role === "superadmin")
    ) {
      return res.status(403).json({ message: "Not authorized to manage this user" });
    }

    switch (req.method) {
      // 📌 GET user
      case "GET": {
        return res.status(200).json(user);
      }

      // 📌 UPDATE user
      case "PUT": {
        const { name, phone, email, role, isActive } = req.body;

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (email) user.email = email;

        // only superadmin can change role
        if (role && currentUser.role === "superadmin") {
          user.role = role;
        }

        if (isActive !== undefined) {
          user.isActive = isActive;
        }

        user.updatedBy = currentUser._id;
        await user.save();

        return res
          .status(200)
          .json({ message: "User updated successfully", user });
      }

      // 📌 DELETE user (soft delete)
      case "DELETE": {
        user.isDeleted = true;
        user.deletedAt = new Date();
        user.updatedBy = currentUser._id;
        await user.save();

        return res
          .status(200)
          .json({ message: "User deleted successfully" });
      }

      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error: any) {
    console.error("User API error:", error);
    return res.status(500).json({ message: error.message });
  }
}
