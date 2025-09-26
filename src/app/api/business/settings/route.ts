



// import { NextRequest, NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import Business from "@/models/Business";
// import { authMiddleware, UserPayload } from "@/lib/middleware/auth";
// import { uploadFileToCloudinary } from "@/lib/cloudinary";

// // --- GET HANDLER (No changes needed) ---
// export async function GET(req: NextRequest) {
//   try {
//     const user = (await authMiddleware(req)) as UserPayload;
//     if (user instanceof NextResponse) return user;

//     if (user.role !== "shopkeeper") {
//         return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
//     }
//     const userId = user.id;
//     await connectDB();

//     const business = await Business.findOne({ owner: userId, isDeleted: false });

//     if (!business) {
//       return NextResponse.json({ success: true, data: null }, { status: 200 });
//     }

//     return NextResponse.json({ success: true, data: business }, { status: 200 });

//   } catch (error) {
//     console.error("Error in GET /api/business/settings:", error);
//     const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
//     return NextResponse.json({ success: false, message: "Internal Server Error", error: errorMessage }, { status: 500 });
//   }
// }

// // --- POST HANDLER (WITH MANDATORY FIELD VALIDATION) ---
// export async function POST(req: NextRequest) {
//   try {
//     // 1. Authentication
//     const user = (await authMiddleware(req)) as UserPayload;
//     if (user instanceof NextResponse) return user;
//     if (user.role !== "shopkeeper") {
//         return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
//     }
//     const userId = user.id;

//     // 2. Connect to Database
//     await connectDB();

//     // 3. Parse FormData
//     const data = await req.formData();
    
//     // --- 4. SERVER-SIDE VALIDATION (THE FIX) ---
//     const name = data.get("name") as string | null;
//     const registrationType = data.get("registrationType") as string | null;

//     if (!name || name.trim().length < 3 || name.trim().length > 60) {
//         return NextResponse.json(
//             { success: false, message: "Business name must be 3-60 characters." },
//             { status: 400 } // Bad Request
//         );
//     }
//     if (!registrationType || registrationType.trim() === '') {
//         return NextResponse.json(
//             { success: false, message: "Incorporation type is required." },
//             { status: 400 } // Bad Request
//         );
//     }
    
//     // 5. Handle File Uploads
//     const logoFile = data.get("logo") as File | null;
//     const signatureFile = data.get("signature") as File | null;
//     let logoUrl: string | undefined;
//     let signatureUrl: string | undefined;
//     const uploadPromises: Promise<void>[] = [];
//     if (logoFile) {
//         uploadPromises.push(uploadFileToCloudinary(logoFile).then(url => { logoUrl = url; }));
//     }
//     if (signatureFile) {
//         uploadPromises.push(uploadFileToCloudinary(signatureFile).then(url => { signatureUrl = url; }));
//     }
//     await Promise.all(uploadPromises);

//     // 6. Construct Update Payload
//     const updateData: { [key: string]: any } = {
//         name: name, // Use the validated name
//         owner: userId, 
//         phone: data.get("phone"), 
//         email: data.get("email"),
//         address: data.get("address"), 
//         city: data.get("city"), 
//         state: data.get("state"), 
//         pincode: data.get("pincode"),
//         gstNumber: data.get("gstNumber"), 
//         panNumber: data.get("panNumber"), 
//         website: data.get("website"),
//         registrationType: registrationType, // Use the validated registrationType
//         businessTypes: data.getAll("businessTypes[]"),
//         industryTypes: data.getAll("industryTypes[]"), 
//         enableEInvoicing: data.get("enableEInvoicing") === 'true',
//         enableTds: data.get("enableTds") === 'true', 
//         enableTcs: data.get("enableTcs") === 'true',
//         updatedBy: userId,
//     };
//     if (logoUrl) updateData.logoUrl = logoUrl;
//     if (signatureUrl) updateData.signatureUrl = signatureUrl;
//     Object.keys(updateData).forEach(key => (updateData[key] === null || updateData[key] === undefined) && delete updateData[key]);
    
//     // 7. Perform Upsert Operation in Database
//     const updatedBusiness = await Business.findOneAndUpdate(
//       { owner: userId }, 
//       { $set: updateData }, 
//       { new: true, upsert: true, runValidators: true }
//     );

//     return NextResponse.json({ success: true, data: updatedBusiness }, { status: 200 });
//   } catch (error) {
//     console.error("Error in POST /api/business/settings:", error);
//     const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
//     return NextResponse.json({ success: false, message: "Internal Server Error", error: errorMessage }, { status: 500 });
//   }
// }













import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Business from "@/models/Business";
import { authMiddleware, UserPayload } from "@/lib/middleware/auth";
import { uploadFileToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

// --- GET HANDLER (Fetches the current business settings) ---
export async function GET(req: NextRequest) {
  try {
    const user = (await authMiddleware(req)) as UserPayload;
    if (user instanceof NextResponse) return user;

    if (user.role !== "shopkeeper") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }
    const userId = user.userId;
    await connectDB();

    const business = await Business.findOne({ owner: userId, isDeleted: false });

    if (!business) {
      return NextResponse.json({ success: true, data: null }, { status: 200 });
    }

    return NextResponse.json({ success: true, data: business }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/business/settings:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ success: false, message: "Internal Server Error", error: errorMessage }, { status: 500 });
  }
}

// --- POST HANDLER (Creates or Updates business settings with file handling) ---
export async function POST(req: NextRequest) {
  try {
    // 1. Authentication & Authorization
    const user = (await authMiddleware(req)) as UserPayload;
    if (user instanceof NextResponse) return user;
    if (user.role !== "shopkeeper") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }
    const userId = user.userId;
    const ownerId = user.userId;


    // 2. Connect to DB and Parse Form Data
    await connectDB();
    const data = await req.formData();

    // 3. Server-Side Validation for mandatory fields
    const name = data.get("name") as string | null;
    const registrationType = data.get("registrationType") as string | null;

    if (!name || name.trim().length < 3 || name.trim().length > 60) {
      return NextResponse.json({ success: false, message: "Business name must be 3-60 characters." }, { status: 400 });
    }
    if (!registrationType || registrationType.trim() === '') {
      return NextResponse.json({ success: false, message: "Incorporation type is required." }, { status: 400 });
    }

    // 4. Smartly Handle Image Uploads and Deletions
    const existingBusiness = await Business.findOne({ owner: userId });
    const cloudPromises: Promise<void>[] = [];

    const deleteLogoFlag = data.get("deleteLogo") === 'true';
    const newLogoFile = data.get("logo") as File | null;
    let newLogoUrl: string | null | undefined = undefined; // undefined: no change, null: delete, string: new URL

    if (deleteLogoFlag && existingBusiness?.logoUrl) {
      cloudPromises.push(deleteFromCloudinary(existingBusiness.logoUrl));
      newLogoUrl = null;
    } else if (newLogoFile) {
      if (existingBusiness?.logoUrl) {
        cloudPromises.push(deleteFromCloudinary(existingBusiness.logoUrl));
      }
      cloudPromises.push(uploadFileToCloudinary(newLogoFile).then(url => { newLogoUrl = url; }));
    }

    const deleteSignatureFlag = data.get("deleteSignature") === 'true';
    const newSignatureFile = data.get("signature") as File | null;
    let newSignatureUrl: string | null | undefined = undefined;

    if (deleteSignatureFlag && existingBusiness?.signatureUrl) {
      cloudPromises.push(deleteFromCloudinary(existingBusiness.signatureUrl));
      newSignatureUrl = null;
    } else if (newSignatureFile) {
      if (existingBusiness?.signatureUrl) {
        cloudPromises.push(deleteFromCloudinary(existingBusiness.signatureUrl));
      }
      cloudPromises.push(uploadFileToCloudinary(newSignatureFile).then(url => { newSignatureUrl = url; }));
    }
    
    // Wait for all cloud operations to complete
    await Promise.all(cloudPromises);

    // 5. Construct Update Payload
    const updateData: { [key: string]: any } = {
        name, owner: ownerId, phone: data.get("phone"), email: data.get("email"),
        address: data.get("address"), city: data.get("city"), state: data.get("state"), pincode: data.get("pincode"),
        gstNumber: data.get("gstNumber"), panNumber: data.get("panNumber"), website: data.get("website"),
        registrationType, businessTypes: data.getAll("businessTypes[]"), industryTypes: data.getAll("industryTypes[]"),
        enableEInvoicing: data.get("enableEInvoicing") === 'true', enableTds: data.get("enableTds") === 'true',
        enableTcs: data.get("enableTcs") === 'true', updatedBy: userId,
    };
    
    // Conditionally add image URLs to payload to avoid overwriting with undefined
    if (newLogoUrl !== undefined) updateData.logoUrl = newLogoUrl;
    if (newSignatureUrl !== undefined) updateData.signatureUrl = newSignatureUrl;
    
    // 6. Perform Upsert Operation in Database
    const updatedBusiness = await Business.findOneAndUpdate(
      { owner: ownerId },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json({ success: true, data: updatedBusiness }, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/business/settings:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ success: false, message: "Internal Server Error", error: errorMessage }, { status: 500 });
  }
}