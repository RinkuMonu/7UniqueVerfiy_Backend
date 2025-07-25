const mongoose = require("mongoose");

url = "mongodb://localhost:27017/";
// Connect to MongoDB
mongoose
  .connect( url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Connected to MongoDB");

    // Ensure a default merchant account exists
    const merchant = await Merchant.findOne();
    if (!merchant) {
      await Merchant.create({ name: "Default Merchant", accountBalance: 0 });
      console.log("Default merchant account created.");
    }
    // ✅ Start Cron Jobs After DB Connection
    cronJobs;
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
    // process.exit(1); // Exit process on DB connection failure
  });