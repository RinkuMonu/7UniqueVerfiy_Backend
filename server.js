const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const axios = require("axios")
const cloudinary = require('cloudinary').v2
const path = require("path");



dotenv.config();

const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
// const paymentRoutes = require('./routes/paymentRoutes');
const verifyService = require('./routes/Verify1');
const contectRouter = require('./routes/contactRouter');
const blogRouter = require('./routes/blogRouter');
const kycRouter = require('./routes/kycRouter');
const walletReqRouter = require('./routes/walletReqRouter');


const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Middleware
app.use(cors(
  {
    origin: '*'
  }
));
app.use(express.json());
app.use(morgan('dev'));
const timestamp = Math.floor(Date.now() / 1000);
const timestamp2 = Date.now();

console.log("dfdgfsdsdsd", timestamp, timestamp2);
// Routes
// app.use('/api/payment', paymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/verify', verifyService);
app.use('/api/contact', contectRouter);
app.use('/api/blog', blogRouter);
app.use('/api/kyc', kycRouter);
app.use('/api/topupReq', walletReqRouter);


app.get('/', (req, res) => {
  res.send('Role-Based Service Backend Running');
});



// cloudinary part
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
})


// async function hitBankVerifyAPI100Times() {
//   const url = 'http://127.0.0.1:5050/api/verify/bankVerify'; // safer with IPv4
//   const headers = {
//     'client-id': 'Seven003',
//     'Content-Type': 'application/json',
//     'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.54dASYUxbGi4s4i0VRYR33olg2NQnMil5zyjaX_wBqc',
//   };

//   const baseData = {
//     account_number: '1234567890',
//     ifsc_code: 'HDFC0001234',
//     serviceName: 'adhar_verify',
//   };

//   const requests = [];

//   for (let i = 1; i <= 100; i++) {
//     const data = {
//       ...baseData,
//       refid: `test-ref-${i}`
//     };
//     requests.push(axios.post(url, data, { headers })); 
//   } 


//   try {
//     const responses = await Promise.all(requests);
//     console.log(`✅ ${responses.length} requests completed successfully`);
//     responses.forEach((res, i) => {
//       console.log(`Response ${i + 1}:`, res.data.message);
//     });  
//   } catch (err) {
//     console.error('❌ Error during bulk requests:', err.message || err);
//   }
// }

// Call the function

// MongoDB Connection
mongoose.connect("mongodb+srv://vijaysinghrasoolpur2003:Ca5lOsDr8blS4mtK@cluster0.sqsolnw.mongodb.net/", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5060, () => {
      console.log(`Server running on port ${process.env.PORT || 5060}`);
      // hitBankVerifyAPI100Times();

    });
  })
  .catch((err) => console.error('MongoDB connection error:', err));



// x-env: uat     or     x-env: production
