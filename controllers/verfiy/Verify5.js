// const axios = require("axios");
// const jwt = require("jsonwebtoken");

// // JWT Generation Helper
// function generatePaysprintJWT(partnerId, reqid, secretKey) {
//   const timestamp = Date.now();
//   const payload = { timestamp, partnerId, reqid };
//   return jwt.sign(payload, secretKey, {
//     algorithm: "HS256",
//     expiresIn: "5m",
//   });
// }

// const PARTNER_ID = process.env.PAYSPRINT_PARTNER_ID || "CORP00001";
// const JWT_SECRET = process.env.PAYSPRINT_JWT_KEY || "UTA5U1VEQXdNREF4VFZSSmVrNUVWVEpPZWxVd1RuYzlQUT09";
// const AUTH_KEY = process.env.PAYSPRINT_AUTH_KEY || "TVRJek5EVTJOelUwTnpKRFQxSlFNREF3TURFPQ==";

// const getHeaders = (refid) => ({
//   Token: generatePaysprintJWT(PARTNER_ID, refid, JWT_SECRET),
//   authorisedkey: AUTH_KEY,
//   "User-Agent": PARTNER_ID,
//   "Content-Type": "application/json",
// });

// const cardValidator = async (req, res) => {
//   try {
//     const { card_num } = req.body;
//     if (!card_num) return res.status(400).json({ message: "card_num is required" });
//     const refid = `card_${Date.now()}`;
//     const headers = getHeaders(refid);
//     const response = await axios.post("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/card_validator", { card_num }, { headers });
//     return res.status(200).json(response.data);
//   } catch (error) {
//     return res.status(500).json({ message: "Card Validator failed", error: error?.response?.data || error.message });
//   }
// };

// const mobileToUpi = async (req, res) => {
//   try {
//     const { refid, mobile } = req.body;
//     if (!refid || !mobile) return res.status(400).json({ message: "refid and mobile are required" });
//     const headers = getHeaders(refid);
//     const response = await axios.post("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/mobile_to_upi", { refid, mobile }, { headers });
//     return res.status(200).json(response.data);
//   } catch (error) {
//     return res.status(500).json({ message: "Mobile to UPI failed", error: error?.response?.data || error.message });
//   }
// };

// const directorPhone = async (req, res) => {
//   try {
//     const { refid, din_number } = req.body;
//     if (!refid || !din_number) return res.status(400).json({ message: "refid and din_number are required" });
//     const headers = getHeaders(refid);
//     const response = await axios.post("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/corporate/director-phone", { refid, din_number }, { headers });
//     return res.status(200).json(response.data);
//   } catch (error) {
//     return res.status(500).json({ message: "Director Phone failed", error: error?.response?.data || error.message });
//   }
// };

// const mobileToPan = async (req, res) => {
//   try {
//     const { refid, name, mobile } = req.body;
//     if (!refid || !name || !mobile) return res.status(400).json({ message: "refid, name, and mobile are required" });
//     const headers = getHeaders(refid);
//     const response = await axios.post("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/mobile_to_pan", { refid, name, mobile }, { headers });
//     return res.status(200).json(response.data);
//   } catch (error) {
//     return res.status(500).json({ message: "Mobile to PAN failed", error: error?.response?.data || error.message });
//   }
// };

// const dinDetails = async (req, res) => {
//   try {
//     const { refid, din_number } = req.body;
//     if (!refid || !din_number) return res.status(400).json({ message: "refid and din_number are required" });
//     const headers = getHeaders(refid);
//     const response = await axios.post("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/corporate/din", { refid, din_number }, { headers });
//     return res.status(200).json(response.data);
//   } catch (error) {
//     return res.status(500).json({ message: "DIN Details failed", error: error?.response?.data || error.message });
//   }
// };

// const dinToPan = async (req, res) => {
//   try {
//     const { refid, din_number } = req.body;
//     if (!refid || !din_number) return res.status(400).json({ message: "refid and din_number are required" });
//     const headers = getHeaders(refid);
//     const response = await axios.post("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/din-to-pan", { refid, din_number }, { headers });
//     return res.status(200).json(response.data);
//   } catch (error) {
//     return res.status(500).json({ message: "DIN to PAN failed", error: error?.response?.data || error.message });
//   }
// };

// const vpnProxyCheck = async (req, res) => {
//   try {
//     const { refid, ip_address } = req.body;
//     if (!refid || !ip_address) return res.status(400).json({ message: "refid and ip_address are required" });
//     const headers = getHeaders(refid);
//     const response = await axios.post("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/vpn_proxy", { refid, ip_address }, { headers });
//     return res.status(200).json(response.data);
//   } catch (error) {
//     return res.status(500).json({ message: "VPN Proxy Check failed", error: error?.response?.data || error.message });
//   }
// };

// const pincodeInfo = async (req, res) => {
//   try {
//     const { refid, pincode } = req.body;
//     if (!refid || !pincode) return res.status(400).json({ message: "refid and pincode are required" });
//     const headers = getHeaders(refid);
//     const response = await axios.post("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/pincode_info", { refid, pincode }, { headers });
//     return res.status(200).json(response.data);
//   } catch (error) {
//     return res.status(500).json({ message: "Pincode Info failed", error: error?.response?.data || error.message });
//   }
// };

// const fetchPersonalProfile = async (req, res) => {
//   try {
//     const { refid, phone, first_name, last_name, pan } = req.body;
//     if (!refid || !phone || !first_name) return res.status(400).json({ message: "refid, phone and first_name are required" });
//     const headers = getHeaders(refid);
//     const response = await axios.post("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/fetch_personal_profile", { refid, phone, first_name, last_name, pan }, { headers });
//     return res.status(200).json(response.data);
//   } catch (error) {
//     return res.status(500).json({ message: "Fetch Personal Profile failed", error: error?.response?.data || error.message });
//   }
// };

// const ifscLookup = async (req, res) => {
//   try {
//     const { refid, ifsc } = req.body;
//     if (!refid || !ifsc) return res.status(400).json({ message: "refid and ifsc are required" });
//     const headers = getHeaders(refid);
//     const response = await axios.post("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/ifsc_lookup", { refid, ifsc }, { headers });
//     return res.status(200).json(response.data);
//   } catch (error) {
//     return res.status(500).json({ message: "IFSC Lookup failed", error: error?.response?.data || error.message });
//   }
// };
// const makePostRequest = async (url, body, refid, res, errMsg) => {
//   try {
//     const headers = getHeaders(refid);
//     const response = await axios.post(url, body, { headers });
//     return res.status(200).json(response.data);
//   } catch (error) {
//     return res.status(500).json({ message: errMsg, error: error?.response?.data || error.message });
//   }
// };

// // Controllers
// const uanBasicV1 = (req, res) => {
//   const { refid, employee_name, employer_name, type, mobile, pan_number, uan } = req.body;
//   if (!refid || !employee_name || !type) return res.status(400).json({ message: "Required fields missing" });
//   return makePostRequest("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/uan_basic_v1", {
//     refid, employee_name, employer_name, type, mobile, pan_number, uan
//   }, refid, res, "UAN Basic V1 failed");
// };

// const uanBasicV2 = (req, res) => {
//   const { refid, type, method, employee_name, employer_name, pan_number, mobile, dob, uan } = req.body;
//   if (!refid || !type) return res.status(400).json({ message: "Required fields missing" });
//   return makePostRequest("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/uan_basic_v2", {
//     refid, type, method, employee_name, employer_name, pan_number, mobile, dob, uan
//   }, refid, res, "UAN Basic V2 failed");
// };

// const aadhaarToUan = (req, res) => {
//   const { refid, aadhaar_number } = req.body;
//   if (!refid || !aadhaar_number) return res.status(400).json({ message: "refid and aadhaar_number required" });
//   return makePostRequest("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/aadhaar_to_uan", {
//     refid, aadhaar_number
//   }, refid, res, "Aadhaar to UAN failed");
// };

// const fetchByPan = (req, res) => {
//   const { refid, type, pan_number, mobile, dob, employee_name, employer_name, uan } = req.body;
//   if (!refid || !type) return res.status(400).json({ message: "refid and type required" });
//   return makePostRequest("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/uan/v2/fetch_by_pan", {
//     refid, type, pan_number, mobile, dob, employee_name, employer_name, uan
//   }, refid, res, "PAN to UAN fetch failed");
// };

// const itrForgetPassword = (req, res) => {
//   const { client_id, password } = req.body;
//   if (!client_id || !password) return res.status(400).json({ message: "client_id and password required" });
//   return makePostRequest("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/itr_forget_password", {
//     client_id, password
//   }, client_id, res, "ITR Forget Password failed");
// };

// const itrSubmitOtp = (req, res) => {
//   const { client_id, otp } = req.body;
//   if (!client_id || !otp) return res.status(400).json({ message: "client_id and otp required" });
//   return makePostRequest("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/itr_submit_otp", {
//     client_id, otp
//   }, client_id, res, "ITR Submit OTP failed");
// };

// const getProfile = (req, res) => {
//   const { client_id } = req.body;
//   if (!client_id) return res.status(400).json({ message: "client_id required" });
//   return makePostRequest("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/get_Profile", {
//     client_id
//   }, client_id, res, "Get Profile failed");
// };

// const itrList = (req, res) => {
//   const { client_id } = req.body;
//   if (!client_id) return res.status(400).json({ message: "client_id required" });
//   return makePostRequest("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/itr_list", {
//     client_id
//   }, client_id, res, "Get ITR List failed");
// };

// const getItr = (req, res) => {
//   const { client_id, itr_id } = req.body;
//   if (!client_id || !itr_id) return res.status(400).json({ message: "client_id and itr_id required" });
//   return makePostRequest("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/get_itr", {
//     client_id, itr_id
//   }, client_id, res, "Get ITR Details failed");
// };

// const get26asList = (req, res) => {
//   const { client_id } = req.body;
//   if (!client_id) return res.status(400).json({ message: "client_id required" });
//   return makePostRequest("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/26as_list", {
//     client_id
//   }, client_id, res, "Get 26AS List failed");
// };

// const get26as = (req, res) => {
//   const { client_id, tds_id } = req.body;
//   if (!client_id || !tds_id) return res.status(400).json({ message: "client_id and tds_id required" });
//   return makePostRequest("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/get_26as", {
//     client_id, tds_id
//   }, client_id, res, "Get 26AS Detail failed");
// };


// module.exports = {
//   cardValidator,
//   mobileToUpi,
//   directorPhone,
//   mobileToPan,
//   dinDetails,
//   dinToPan,
//   vpnProxyCheck,
//   pincodeInfo,
//   fetchPersonalProfile,
//   ifscLookup,
//   uanBasicV1,
//   uanBasicV2,
//   aadhaarToUan,
//   fetchByPan,
//   itrForgetPassword,
//   itrSubmitOtp,
//   getProfile,
//   itrList,
//   getItr,
//   get26asList,
//   get26as
// };
// ✅ Refactored Paysprint Verification Controller
const axios = require("axios");
const jwt = require("jsonwebtoken");
const logger = require("../../utils/Logger");
const VerificationLog = require("../../models/VerificationLog");
const FormData = require("form-data");
const fs = require("fs");

const PARTNER_ID = "CORP00002028";
const JWT_SECRET = process.env.PAYSPRINT_JWT_KEY || "UTA5U1VEQXdNREF5TURJNFRucEpOVTU2UVhsT2FrVjRUMUU5UFE9PQ==";

// const PARTNER_ID = "CORP00001";
// const JWT_SECRET = "UTA5U1VEQXdNREF4VFZSSmVrNUVWVEpPZWxVd1RuYzlQUT09";
// const AUTH_KEY = process.env.PAYSPRINT_AUTH_KEY || "TVRJek5EVTJOelUwTnpKRFQxSlFNREF3TURFPQ==";

function generatePaysprintJWT(partnerId, reqid, secretKey) {
  const timestamp = Math.floor(Date.now()) - 10000;
  console.log("dfdgfsdsdsd", timestamp);

  const payload = { timestamp, partnerId, reqid };
  const token = jwt.sign(payload, secretKey, {
    algorithm: 'HS256',
    header: {
      typ: 'JWT',
      alg: 'HS256'
    }
  })
  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0aW1lc3RhbXAiOjE3NTAxNjAxOTQzMzgsInBhcnRuZXJJZCI6IkNPUlAwMDAwMjAyOCIsInJlcWlkIjoiNDQ4NTQ1NDU0NCIsImlhdCI6MTc1MDE2MDIwNH0.Zr_UIuF-bh0GHDomGO9dYvFqcCcZoVE5sTmjtUXBRD8"
}

const getHeaders = (refid) => ({
  Token: generatePaysprintJWT(PARTNER_ID, refid, JWT_SECRET),
  // authorisedkey: AUTH_KEY,
  "User-Agent": PARTNER_ID,
  "Content-Type": "application/json",
});

const saveVerificationLog = async (log) => {
  try {
    await VerificationLog.create(log);
  } catch (err) {
    console.error("DB Log Save Error:", err.message);
  }
};

const handleVerification = async (req, res, endpoint, type, refidKey = "refid") => {
  const refid = req.body[refidKey] || `${type.toUpperCase()}-${Date.now()}`;
  const headers = getHeaders(refid);
  const requestPayload = req.body;
  const env = req.environment;
  try {
    if (env === "credentials") {
      // ✅ Lookup saved log in credentials mode
      const log = await VerificationLog.findOne({ type });
      if (!log) {
        return res.status(404).json({
          success: false,
          message: "No previous verification log found for this type in credentials mode",
        });
      }

      logger.info("Returning cached log in credentials mode", { type });

      return res.status(log.statusCode || 200).json({
        success: log.success,
        message: "Fetched from credentials log",
        data: log.responsePayload,
      });

    }

    logger.info(`Sending request for ${type}`, { refid, requestPayload });
    const response = await axios.post(endpoint, requestPayload, { headers });

    await saveVerificationLog({ refid, type, requestPayload, responsePayload: response.data, statusCode: response.status, success: true });
    logger.info(`Verification success: ${type}`, { refid, resData: response.data, status: response.status });
    return res.status(response.status).json({ success: true, message: response.data.message || `${type} verification successful`, data: response.data });
  } catch (error) {

    const statusCode = error?.response?.status || 500;
    const errorMsg = error?.response?.data?.message || error.message;
    await saveVerificationLog({ refid, type, requestPayload, responsePayload: error?.response?.data || { error: errorMsg }, statusCode, success: false });
    logger.error(`${type} verification failed`, { refid, error: errorMsg });
    return res.status(statusCode).json({ success: false, message: errorMsg });
  }
};

module.exports = {
  // ...existing endpoints...

  cardValidator: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/card_validator", "card_validator", "card_num"),
  mobileToUpi: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/mobile_to_upi", "mobile_to_upi", "refid"),
  directorPhone: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/corporate/director-phone", "director_phone", "refid"),
  mobileToPan: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/mobile_to_pan", "mobile_to_pan", "refid"),
  dinDetails: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/corporate/din", "din_details", "refid"),
  dinToPan: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/din-to-pan", "din_to_pan", "refid"),
  vpnProxyCheck: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/vpn_proxy", "vpn_proxy", "refid"),
  pincodeInfo: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/pincode_info", "pincode_info", "refid"),
  fetchPersonalProfile: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/fetch_personal_profile", "fetch_personal_profile", "refid"),
  ifscLookup: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/ifsc_lookup", "ifsc_lookup", "refid"),
  uanBasicV1: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/uan_basic_v1", "uan_basic_v1", "refid"),
  uanBasicV2: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/uan_basic_v2", "uan_basic_v2", "refid"),
  aadhaarToUan: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/aadhaar_to_uan", "aadhaar_to_uan", "refid"),
  fetchByPan: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/uan/v2/fetch_by_pan", "uan_fetch_by_pan", "refid"),
  itrForgetPassword: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/itr_forget_password", "itr_forget_password", "client_id"),
  itrSubmitOtp: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/itr_submit_otp", "itr_submit_otp", "client_id"),
  getProfile: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/get_Profile", "get_profile", "client_id"),
  itrList: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/itr_list", "itr_list", "client_id"),
  getItr: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/get_itr", "get_itr", "client_id"),
  itr_check: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/itr_check", "itr_check", "client_id"),
  get26asList: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/26as_list", "get_26as_list", "client_id"),
  get26as: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/get_26as", "get_26as", "client_id"),
};
