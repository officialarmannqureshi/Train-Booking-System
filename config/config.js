const { Client } = require('pg')
const dotenv = require('dotenv')

dotenv.config()

const client = new Client({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.DATABASE_NAME,
  max: 50,
})

global.configDB = async function () {
  try {
    await client.connect()
    console.log('Connected to PostgreSQL database')

    await client.query(`
      DROP TABLE IF EXISTS booking;
      DROP TABLE IF EXISTS train CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS blacklist;
      
    `)
    await client.query(`DROP TYPE IF EXISTS booking_status;`)

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255),
        role INT DEFAULT 0 CHECK(role IN (0,1)),
        auth_token VARCHAR(255) UNIQUE NOT NULL 
        
      );
    `)
    console.log('Table users created.')

    await client.query(`
      CREATE TABLE IF NOT EXISTS blacklist (
      token VARCHAR(255)
);
`)
    
    console.log('Table admin created.')

    await client.query(`
      CREATE TABLE IF NOT EXISTS train (
        train_id SERIAL PRIMARY KEY,
        train_number INT NOT NULL UNIQUE,
        source_station VARCHAR(255) NOT NULL,
        destination_station VARCHAR(255) NOT NULL,
        total_seats INT NOT NULL,
        available_seats INT NOT NULL,
        last_updated_by INT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CHECK (total_seats >= 0),
        CHECK (total_seats >= available_seats),
        CONSTRAINT fk_user FOREIGN KEY (last_updated_by) REFERENCES users(user_id)
      );
    `)
    console.log('Table train created.')

    await client.query(`
      CREATE TYPE booking_status AS ENUM (
        'Confirmed', 
        'Cancelled',  
        'Waitlisted');
    `)
    console.log('Enum type booking_status created.')

    await client.query(`
      CREATE TABLE IF NOT EXISTS booking (
        booking_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        train_id INT NOT NULL,
        booking_status booking_status,
        booking_time TIMESTAMP,
        CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id),
        CONSTRAINT fk_train FOREIGN KEY (train_id) REFERENCES train(train_id)
      );
    `)
    console.log('Table booking created.')
  } catch (err) {
    console.error('Error executing query', err)
  }
}

module.exports = client
