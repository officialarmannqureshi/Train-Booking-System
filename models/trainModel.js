const client = require("../config/config");

exports.createTrain = async (req, res) => {
  const {
    train_number,
    source_station,
    destination_station,
    total_seats,
    available_seats,
  } = req.body;

  console.log(req.body);

  try {
    const parsedTrainNumber = parseInt(train_number, 10);
    const parsedTotalSeats = parseInt(total_seats, 10);
    const parsedAvailableSeats = parseInt(available_seats, 10);
    const last_updated_by = req.user.user_id;

    if (
      isNaN(parsedTrainNumber) ||
      isNaN(parsedTotalSeats) ||
      isNaN(parsedAvailableSeats)
    ) {
      throw new Error(
        "Train number, total seats, and available seats must be valid numbers"
      );
    }

    if (!source_station || !destination_station || !last_updated_by) {
      throw new Error(
        "Train number, total seats, and available seats must be valid numbers"
      );
    }
    const result = await client.query(
      `INSERT INTO train (train_number, source_station, destination_station, total_seats, available_seats, last_updated_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`,
      [
        parsedTrainNumber,
        source_station,
        destination_station,
        parsedTotalSeats,
        parsedAvailableSeats,
        last_updated_by,
      ]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error("Error in adding new train");
  }
};
