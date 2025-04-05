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
app.post("/", async (req, res) => {
  const message = req.body.Body?.toLowerCase();
  const sender = req.body.From;
  console.log("📩 Incoming request body:", req.body);
  console.log("📲 Sender:", sender);

  try {
    if (message.includes("order")) {
      await sendMessage(sender, "Please list the items you want to order.");
    } else if (message.includes("location")) {
      await sendMessage(sender, "Please share your delivery location.");
    } else {
      await sendMessage(sender, "Welcome to Kasi Delivery! Type 'order' to place an order.");
    }
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Error sending message:", err);
    res.sendStatus(500);
  }
});


// Send WhatsApp Message
async function sendMessage(to, body) {
  console.log("Sending message:");
  console.log("From:", twilioNumber);
  console.log("To:", to);

  await twilioClient.messages.create({
    from: `whatsapp:${twilioNumber.replace("whatsapp:", "")}`,
    to,
    body,
  });
}


console.log("Sending message:");
console.log("From:", twilioNumber);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot running on port ${PORT}`));
