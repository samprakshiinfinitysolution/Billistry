import HSN from "@/models/HSN";

// // ✅ Add new HSN
// export const createHSN = async (data: any) => {
//   const hsn = new HSN(data);
//   return await hsn.save();
// };

// // ✅ Search HSN (by code or name)
// export const searchHSN = async (search?: string) => {
//   const query: any = {};
//   if (search) {
//     query.$or = [
//       { hsn_code: { $regex: search, $options: "i" } },
//       { hsn_name: { $regex: search, $options: "i" } }
//     ];
//   }
//   return await HSN.find(query).limit(20);
// };

// // ✅ Get HSN by ID
// export const getHSNById = async (id: string) => {
//   return await HSN.findById(id);
// };


// ✅ Add single or multiple HSN
export const createHSN = async (data: any | any[]) => {
  if (Array.isArray(data)) {
    // multiple insert
    return await HSN.insertMany(data, { ordered: false });
  } else {
    // single insert
    const hsn = new HSN(data);
    return await hsn.save();
  }
};

// ✅ Search HSN (by code or name, limit 20)
export const searchHSN = async (search?: string) => {
  const query: any = {};
  if (search) {
    query.$or = [
      { hsn_code: { $regex: search, $options: "i" } },
      { hsn_name: { $regex: search, $options: "i" } }
    ];
  }
  return await HSN.find(query).limit(20);
};

// ✅ Get HSN by ID
export const getHSNById = async (id: string) => {
  return await HSN.findById(id);
};

// ✅ Update HSN by ID
export const updateHSN = async (id: string, data: any) => {
  return await HSN.findByIdAndUpdate(id, data, { new: true });
};

// ✅ Delete HSN by ID
export const deleteHSN = async (id: string) => {
  return await HSN.findByIdAndDelete(id);
};