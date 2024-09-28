const { createTrain } = require("../models/trainModel");
const client = require("../config/config");
exports.addTrain = async (req, res) => {
  try {
    const newTrain = await createTrain(req, res);
    console.log(newTrain);
    res.status(201).json({
      message: "Train added successfully",
      train: newTrain,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error in adding train data",
      error: error.message,
    });
  }
};
