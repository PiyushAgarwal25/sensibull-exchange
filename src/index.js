const express = require("express");
const app = express();
const orders = require("./routes/order");
const connectToMongo = require("./db/dbconnect");
const { v1: uuidv1 } = require('uuid');
const { cronJob } = require("./controllers/order");
const checkXAuthToken = require("./middleware/checkAuthToken");

const timestampUuid = uuidv1();
console.log(timestampUuid);


const PORT = process.env.PORT||3000;

connectToMongo();
cronJob.start();


app.use("/api/order",orders);

app.listen(PORT,()=>{
    console.log(`App started at PORT: ${PORT}`)
})
