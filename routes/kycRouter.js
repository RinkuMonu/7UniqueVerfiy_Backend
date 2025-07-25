const express = require("express");
const multer = require("multer");
const path = require("path");
const User = require("../models/User");
const KYCRequest = require("../models/KycModel.js");

const kycRouter = express.Router();

// multer config
const storage = multer.diskStorage({
    destination: "uploads1/",
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// 1. Request KYC
kycRouter.post("/request", async (req, res) => {
    const { userId } = req.body;
    const kyc = await KYCRequest.create({ user: userId });
    res.json({ message: "KYC requested", kyc });
});

// 2. Approve request (admin)
kycRouter.patch("/approve/:id", async (req, res) => {
    const { id } = req.params;
    const { scheduledTime } = req.body;
    const kyc = await KYCRequest.findByIdAndUpdate(id, {
        status: "approved",
        scheduledTime
    }, { new: true });
    res.json({ message: "KYC approved", kyc });
});

// 3. Create room (admin)
kycRouter.patch("/create-room/:id", async (req, res) => {
    const { id } = req.params;
    const roomLink = `https://meet.jit.si/kyc-room-${id}`;
    const kyc = await KYCRequest.findByIdAndUpdate(id, {
        roomLink,
        status: "room_created"
    }, { new: true });
    res.json({ message: "Room created", kyc });
});

// 4. Upload screenshot (agent)
kycRouter.post("/upload-screenshot", upload.single("screenshot"), async (req, res) => {
    const { userId } = req.body;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findById(userId);
    user.documents1.push(req.file.path);
    await user.save();

    res.json({ message: "Screenshot uploaded", path: req.file.path });
});

// 5. Get all requests (admin)
kycRouter.get("/all", async (req, res) => {
    const data = await KYCRequest.find().populate("user");
    res.json(data);
});

module.exports = kycRouter;