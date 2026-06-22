const express = require("express");
const http = require("http");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

app.get("/", (req, res) => {
  res.send("NEXEORA BACKEND RUNNING 🚀");
});

app.use(cors());
app.use(express.json());

// SOCKET
const io = new Server(server, {
  cors: { origin: "*" },
});

// TEMP STORAGE
let otpStore = {};
let users = [];
let messages = [];

// EMAIL
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

// OTP GENERATOR
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

// SEND OTP
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  const otp = generateOTP();
  otpStore[email] = otp;

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: "NEXEORA OTP",
    text: `Your OTP is: ${otp}`,
  });

  res.json({ success: true });
});

// VERIFY OTP
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (otpStore[email] == otp) {
    users.push({ email });
    return res.json({ success: true });
  }

  res.json({ success: false });
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "NEXEORA backend connected"
  });
});

// SOCKET CHAT
io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("send_message", (data) => {
    messages.push(data);
    io.emit("receive_message", data);
  });
});

server.listen(5000, () => {
  console.log("NEXEORA backend running on 5000");
});