const mongoose = require('mongoose');
const {MONGODB_CONNECTION_STRING} = require('../config/index')

const dbconnect = async() =>{
    console.log(`Special Error: ${MONGODB_CONNECTION_STRING}`);

    try {
     const conn =  await mongoose.connect(MONGODB_CONNECTION_STRING );
     console.log(`Database connected to host:${conn.connection.host}`);

    } catch (error) {
        console.log(`Error: ${error}`);
    }
}
module.exports = dbconnect;