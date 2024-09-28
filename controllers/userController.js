const client = require('../config/config');
/*
    . Get Seat Availability
    Create an endpoint for the users where they can enter the source and destination 
    and fetch all the trains between that route with their availabilities
    */
exports.getSeatAvailability = async (req, res) => {
  try {
    const { source_station, destination_station } = req.body;

    if (!source_station || !destination_station) {
      return res.status(400).json({
        success: false,
        message: 'Source and destination must be provided',
      });
    }

    const result = await client.query(
      `SELECT * FROM train WHERE source_station = $1 AND destination_station = $2;`,
      [source_station, destination_station]
    );

    console.log(result.rows);
    res.status(200).json({
      success: true,
      message:
        'Successfully fetched train data between given source and destination',
      data: result.rows,
    });
  } catch (error) {
    console.log('Error while fetching train details:', error);
    res.status(500).json({
      success: false,
      message:
        'Failed to fetch train data between given source and destination',
      error: error.message,
    });
  }
};

exports.bookSeat = async (req, res) => {
  try {
    const { train_number, source_station, destination_station } = req.body;
    let booking_status, booking_time;
    const date = new Date();

    if (!train_number || !source_station || !destination_station || !req.user.user_id) {
      return res.status(400).json({
        success: false,
        message: 'Train number, source, destination, and user must be provided',
      });
    }

    const seats = await client.query(
      `SELECT available_seats, total_seats, train_id FROM train WHERE train_number = $1 AND source_station = $2 AND destination_station = $3;`,
      [train_number,source_station,destination_station]
    );

    if (seats.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Train not found',
      });
    }

    const availableSeats = seats.rows[0].available_seats;
    const totalSeats = seats.rows[0].total_seats;
    const train_id = seats.rows[0].train_id;

    if (availableSeats > 0 && availableSeats <= totalSeats && totalSeats>=1) {
      await client.query(
        `UPDATE train SET available_seats = available_seats - 1 WHERE train_number = $1;`,
        [train_number]
      );
      booking_status = 'Confirmed';
    } else if (availableSeats <= 0 && availableSeats > -49 && totalSeats>=1) {
      await client.query(
        `UPDATE train SET available_seats = available_seats - 1 WHERE train_number = $1;`,
        [train_number]
      );
      booking_status = 'Waitlisted';
    } else {
      booking_status = 'Cancelled';
    }

    booking_time = date.toISOString();

    await client.query(
      `INSERT INTO booking (user_id, train_id, booking_status, booking_time) VALUES ($1, $2, $3, $4);`,
      [req.user.user_id, train_id, booking_status, booking_time]
    );

    res.status(201).json({
      success: true,
      message: 'Successfully booked the ticket',
      booking_status,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error booking the ticket',
      error: error.message,
    });
  }
};
