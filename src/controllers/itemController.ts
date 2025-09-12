// import { NextRequest, NextResponse } from "next/server";
// import { Item } from "@/models/itemModel";

// // GET all items
// export const getItems = async () => {
//   try {
//     const items = await Item.find();
//     return NextResponse.json(items, { status: 200 });
//   } catch (error) {
//     return NextResponse.json({ message: "Failed to fetch items", error }, { status: 500 });
//   }
// };

// // POST - create item
// export const createItem = async (req: NextRequest) => {
//   try {
//     const body = await req.json();
//     const newItem = new Item(body);
//     const saved = await newItem.save();
//     return NextResponse.json(saved, { status: 201 });
//   } catch (error) {
//     return NextResponse.json({ message: "Failed to create item", error }, { status: 400 });
//   }
// };

// // GET item by ID
// export const getItemById = async (id: string) => {
//   try {
//     const item = await Item.findById(id);
//     if (!item) return NextResponse.json({ message: "Item not found" }, { status: 404 });
//     return NextResponse.json(item, { status: 200 });
//   } catch (error) {
//     return NextResponse.json({ message: "Failed to fetch item", error }, { status: 500 });
//   }
// };

// // PUT / PATCH update item
// export const updateItem = async (id: string, req: NextRequest) => {
//   try {
//     const body = await req.json();

//     // Handle stock increment/decrement
//     if (body.type === "increase") {
//       const updated = await Item.findByIdAndUpdate(id, { $inc: { quantity: 1 } }, { new: true });
//       return NextResponse.json(updated, { status: 200 });
//     }
//     if (body.type === "decrease") {
//       const updated = await Item.findByIdAndUpdate(id, { $inc: { quantity: -1 } }, { new: true });
//       return NextResponse.json(updated, { status: 200 });
//     }

//     // Otherwise do normal update
//     const updatedItem = await Item.findByIdAndUpdate(id, body, {
//       new: true,
//       runValidators: true,
//     });
//     if (!updatedItem) return NextResponse.json({ message: "Item not found" }, { status: 404 });
//     return NextResponse.json(updatedItem, { status: 200 });
//   } catch (error) {
//     return NextResponse.json({ message: "Failed to update item", error }, { status: 400 });
//   }
// };




// // DELETE
// export const deleteItem = async (id: string) => {
//   try {
//     const deleted = await Item.findByIdAndDelete(id);
//     if (!deleted) return NextResponse.json({ message: "Item not found" }, { status: 404 });
//     return NextResponse.json({ message: "Item deleted" }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json({ message: "Failed to delete item", error }, { status: 500 });
//   }
// };




// import { NextRequest, NextResponse } from "next/server";
// import { Item } from "@/models/itemModel";
// import { connectDB } from "@/lib/db";

// // GET all items
// export const getItems = async () => {
//   try {
//     await connectDB();
//     const items = await Item.find();
//     return NextResponse.json(items, { status: 200 });
//   } catch (error: unknown) {
//     console.error("❌ getItems error:", error);
//     const message = error instanceof Error ? error.message : "Unknown error";
//     return NextResponse.json({ message: "Failed to fetch items", error: message }, { status: 500 });
//   }
// };

// // POST - create item
// export const createItem = async (req: NextRequest) => {
//   try {
//     await connectDB();
//     const body = await req.json();
//     const newItem = new Item(body);
//     const saved = await newItem.save();
//     return NextResponse.json(saved, { status: 201 });
//   } catch (error: unknown) {
//     console.error("❌ createItem error:", error);
//     const message = error instanceof Error ? error.message : "Unknown error";
//     return NextResponse.json({ message: "Failed to create item", error: message }, { status: 400 });
//   }
// };

// // GET item by ID
// export const getItemById = async (id: string) => {
//   try {
//     await connectDB();
//     const item = await Item.findById(id);
//     if (!item) return NextResponse.json({ message: "Item not found" }, { status: 404 });
//     return NextResponse.json(item, { status: 200 });
//   } catch (error: unknown) {
//     console.error("❌ getItemById error:", error);
//     const message = error instanceof Error ? error.message : "Unknown error";
//     return NextResponse.json({ message: "Failed to fetch item", error: message }, { status: 500 });
//   }
// };

// // PUT / PATCH update item
// export const updateItem = async (id: string, req: NextRequest) => {
//   try {
//     await connectDB();
//     const body = await req.json();

//     if (body.type === "increase") {
//       const updated = await Item.findByIdAndUpdate(id, { $inc: { openingStock: 1 } }, { new: true });
//       return NextResponse.json(updated, { status: 200 });
//     }

//     if (body.type === "decrease") {
//       const updated = await Item.findByIdAndUpdate(id, { $inc: { openingStock: -1 } }, { new: true });
//       return NextResponse.json(updated, { status: 200 });
//     }

//     const updatedItem = await Item.findByIdAndUpdate(id, body, {
//       new: true,
//       runValidators: true,
//     });

//     if (!updatedItem) return NextResponse.json({ message: "Item not found" }, { status: 404 });
//     return NextResponse.json(updatedItem, { status: 200 });
//   } catch (error: unknown) {
//     console.error("❌ updateItem error:", error);
//     const message = error instanceof Error ? error.message : "Unknown error";
//     return NextResponse.json({ message: "Failed to update item", error: message }, { status: 400 });
//   }
// };

// // DELETE item
// export const deleteItem = async (id: string) => {
//   try {
//     await connectDB();
//     const deleted = await Item.findByIdAndDelete(id);
//     if (!deleted) return NextResponse.json({ message: "Item not found" }, { status: 404 });
//     return NextResponse.json({ message: "Item deleted" }, { status: 200 });
//   } catch (error: unknown) {
//     console.error("❌ deleteItem error:", error);
//     const message = error instanceof Error ? error.message : "Unknown error";
//     return NextResponse.json({ message: "Failed to delete item", error: message }, { status: 500 });
//   }
// };














// import { NextRequest, NextResponse } from "next/server";
// import { Item } from "@/models/itemModel";
// import { connectDB } from "@/lib/db";

// // Get all items
// export const getItems = async () => {
//   try {
//     await connectDB();
//     const items = await Item.find();
//     return NextResponse.json(items, { status: 200 });
//   } catch (error: unknown) {
//     const message = error instanceof Error ? error.message : "Unknown error";
//     return NextResponse.json({ message: "Failed to fetch items", error: message }, { status: 500 });
//   }
// };

// // Create a new item
// export const createItem = async (req: NextRequest) => {
//   try {
//     await connectDB();
//     const body = await req.json();
//     const newItem = await Item.create(body);
//     return NextResponse.json(newItem, { status: 201 });
//   } catch (error: unknown) {
//     const message = error instanceof Error ? error.message : "Unknown error";
//     return NextResponse.json({ message: "Failed to create item", error: message }, { status: 400 });
//   }
// };

// // Get item by ID
// export const getItemById = async (id: string) => {
//   try {
//     await connectDB();
//     const item = await Item.findById(id);
//     if (!item) return NextResponse.json({ message: "Item not found" }, { status: 404 });
//     return NextResponse.json(item, { status: 200 });
//   } catch (error: unknown) {
//     const message = error instanceof Error ? error.message : "Unknown error";
//     return NextResponse.json({ message: "Failed to fetch item", error: message }, { status: 500 });
//   }
// };

// // Update item
// export const updateItem = async (id: string, req: NextRequest) => {
//   try {
//     await connectDB();
//     const body = await req.json();

//     let updated;
//     if (body.type === "increase") {
//       updated = await Item.findByIdAndUpdate(id, { $inc: { openingStock: 1 } }, { new: true });
//     } else if (body.type === "decrease") {
//       updated = await Item.findByIdAndUpdate(id, { $inc: { openingStock: -1 } }, { new: true });
//     } else {
//       updated = await Item.findByIdAndUpdate(id, body, {
//         new: true,
//         runValidators: true,
//       });
//     }

//     if (!updated) return NextResponse.json({ message: "Item not found" }, { status: 404 });
//     return NextResponse.json(updated, { status: 200 });
//   } catch (error: unknown) {
//     const message = error instanceof Error ? error.message : "Unknown error";
//     return NextResponse.json({ message: "Failed to update item", error: message }, { status: 400 });
//   }
// };

// // Delete item
// export const deleteItem = async (id: string) => {
//   try {
//     await connectDB();
//     const deleted = await Item.findByIdAndDelete(id);
//     if (!deleted) return NextResponse.json({ message: "Item not found" }, { status: 404 });
//     return NextResponse.json({ message: "Item deleted" }, { status: 200 });
//   } catch (error: unknown) {
//     const message = error instanceof Error ? error.message : "Unknown error";
//     return NextResponse.json({ message: "Failed to delete item", error: message }, { status: 500 });
//   }
// };
