const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");


require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors({ credentials: true, origin: "http://localhost:5173" }));

const userRouter = require("./Routes/UserRoute")
const FileRoute = require("./Routes/FileRoute")
const PORT = 3000;

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));


app.use("/user", userRouter);
app.use("/dashboard", FileRoute);



app.listen(PORT, () => console.log("Connected to port 3000"));
