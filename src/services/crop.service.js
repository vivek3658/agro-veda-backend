const Crop = require('../models/Crop');

const createCrop = async (farmerId, cropData) => {
  return await Crop.create({ ...cropData, farmer: farmerId });
};

const getAllCrops = async (filters = {}) => {
  const { search, category, minPrice, maxPrice, sortBy, order, page = 1, limit = 10 } = filters;
  let query = { isAvailable: true };

  // Text search on name and description
  if (search) {
    query.$text = { $search: search };
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by price range
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  let sort = {};
  if (sortBy) {
    sort[sortBy] = order === 'desc' ? -1 : 1;
  } else {
    sort.createdAt = -1; // Newest first by default
  }

  const skip = (page - 1) * limit;

  const crops = await Crop.find(query)
    .populate('farmer', 'name email')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await Crop.countDocuments(query);

  return {
    crops,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit)
    }
  };
};

const getCropById = async (cropId) => {
  const crop = await Crop.findById(cropId).populate('farmer', 'name email');
  if (!crop) throw new Error('Crop not found');
  return crop;
};

const updateCrop = async (farmerId, cropId, updateData) => {
  const crop = await Crop.findById(cropId);
  if (!crop) throw new Error('Crop not found');

  // Check if crop belongs to the farmer
  if (crop.farmer.toString() !== farmerId.toString()) {
    throw new Error('You are not authorized to update this crop');
  }

  Object.assign(crop, updateData);
  await crop.save();
  return crop;
};

const deleteCrop = async (farmerId, cropId) => {
  const crop = await Crop.findById(cropId);
  if (!crop) throw new Error('Crop not found');

  // Check if crop belongs to the farmer
  if (crop.farmer.toString() !== farmerId.toString()) {
    throw new Error('You are not authorized to delete this crop');
  }

  await crop.deleteOne();
  return { message: 'Crop removed successfully' };
};

const getFarmerCrops = async (farmerId) => {
  return await Crop.find({ farmer: farmerId });
};

module.exports = {
  createCrop,
  getAllCrops,
  getCropById,
  updateCrop,
  deleteCrop,
  getFarmerCrops
};
