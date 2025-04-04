require("dotenv").config();
const express = require("express");
const twilio = require("twilio");
const axios = require("axios");
const mongoose = require("mongoose");

const app = express();
app.use(express.urlencoded({ extended: false }));

// Twilio Credentials
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);
const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Order Schema
const Order = mongoose.model("Order", {
  phone: String,
  items: String,
  location: String,
  status: { type: String, default: "Pending" },
});

// Webhook for Incoming WhatsApp Messages
app.post("/whatsapp", async (req, res) => {
  const message = req.body.Body.toLowerCase();
  const sender = req.body.From;

  if (message.includes("order")) {
    await sendMessage(sender, "Please list the items you want to order.");
  } else if (message.includes("location")) {
    await sendMessage(sender, "Please share your location (send location on WhatsApp)." );
  } else {
    await sendMessage(sender, "Welcome to Kasi Delivery! Type 'order' to place an order.");
  }

  res.sendStatus(200);
});

// Send WhatsApp Message
async function sendMessage(to, body) {
  await twilioClient.messages.create({
    from: `whatsapp:${twilioNumber}`,
    to,
    body,
  });
}

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot running on port ${PORT}`));
