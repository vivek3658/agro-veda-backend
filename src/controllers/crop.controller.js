const cropService = require('../services/crop.service');

const createCrop = async (req, res) => {
  try {
    const crop = await cropService.createCrop(req.user.id, req.body);
    res.status(201).json(crop);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllCrops = async (req, res) => {
  try {
    const filters = req.query; // includes search, category, etc.
    const crops = await cropService.getAllCrops(filters);
    res.status(200).json(crops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCropById = async (req, res) => {
  try {
    const crop = await cropService.getCropById(req.params.id);
    res.status(200).json(crop);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateCrop = async (req, res) => {
  try {
    const crop = await cropService.updateCrop(req.user.id, req.params.id, req.body);
    res.status(200).json(crop);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCrop = async (req, res) => {
  try {
    const result = await cropService.deleteCrop(req.user.id, req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMyCrops = async (req, res) => {
  try {
    const crops = await cropService.getFarmerCrops(req.user.id);
    res.status(200).json(crops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCrop,
  getAllCrops,
  getCropById,
  updateCrop,
  deleteCrop,
  getMyCrops
};
