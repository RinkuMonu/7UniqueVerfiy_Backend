// const jwt = require("jsonwebtoken");
// const axios = require("axios");
// const logger = require("../../utils/Logger");

// // ✅ JWT Generation Helper
// function generatePaysprintJWT(partnerId, reqid, secretKey) {
//   const timestamp = Date.now();

//   const payload = {
//     timestamp,
//     partnerId,
//     reqid,
//   };

//   return jwt.sign(payload, secretKey, {
//     algorithm: "HS256",
//     expiresIn: "5m",
//   });
// }

// // ✅ Set from .env or hardcode during testing
// const PARTNER_ID = process.env.PAYSPRINT_PARTNER_ID || "CORP00001";
// const JWT_SECRET = process.env.PAYSPRINT_JWT_KEY || "UTA5U1VEQXdNREF4VFZSSmVrNUVWVEpPZWxVd1RuYzlQUT09";
// const AUTH_KEY = process.env.PAYSPRINT_AUTH_KEY || "TVRJek5EVTJOelUwTnpKRFQxSlFNREF3TURFPQ==";

// const getHeaders = (reqid) => ({
//   Token: generatePaysprintJWT(PARTNER_ID, reqid, JWT_SECRET),
//   authorisedkey: AUTH_KEY,
//   "User-Agent": PARTNER_ID,
// });



// // ✅ Aadhaar without OTP Controller


// const aadhaarValidateWithoutOTP = async (req, res) => {
//   const { refid, id_number } = req.body;

//   if (!refid || !id_number) {
//     return res.status(400).json({
//       success: false,
//       message: "refid and id_number (Aadhaar) are required."
//     });
//   }

//   try {
//     const url = "https://uat.paysprint.in/sprintverify-uat/api/v1/verification/aadhaar_without_otp";

//     const response = await axios.post(
//       url,
//       {
//         refid,
//         id_number
//       },
//       {
//         headers: getHeaders(refid)
//       }
//     );

//     return res.status(response.status).json({
//       success: response.status === 200,
//       message: response.status === 200 ? "Aadhaar validated successfully" : "Validation issue",
//       data: response.data
//     });

//   } catch (error) {
//     const status = error.response?.status || 500;
//     const message = error.response?.data?.message || "Internal server error";

//     logger.error("Aadhaar without OTP validation failed", {
//       refid,
//       status,
//       message,
//       error: error.stack
//     });

//     return res.status(status).json({ success: false, message });
//   }
// };
// // ✅ Aadhaar with OTP Send Controller
// const aadhaarSendOTP = async (req, res) => {
//   const { id_number } = req.body;
//   const refid = `ADHRSNDOTP-${Date.now()}`;

//   if (!id_number) {
//     return res.status(400).json({
//       success: false,
//       message: "id_number (Aadhaar) is required."
//     });
//   }

//   try {
//     const url = "https://uat.paysprint.in/sprintverify-uat/api/v1/verification/aadhaar_sendotp";

//     const response = await axios.post(
//       url,
//       {
//         id_number
//       },
//       {
//         headers: getHeaders(refid)
//       }
//     );

//     return res.status(response.status).json({
//       success: response.status === 200,
//       message: response.data.message || "OTP sent successfully",
//       data: response.data
//     });

//   } catch (error) {
//     const status = error.response?.status || 500;
//     const message = error.response?.data?.message || "Internal server error";

//     logger.error("Aadhaar send OTP failed", {
//       refid,
//       id_number,
//       status,
//       message,
//       error: error.stack
//     });

//     return res.status(status).json({ success: false, message });
//   }
// };
// // ✅ Aadhaar with OTP Verify Controller
// const aadhaarVerifyOTP = async (req, res) => {
//   const { refid, otp, client_id } = req.body;

//   if (!refid || !otp || !client_id) {
//     return res.status(400).json({
//       success: false,
//       message: "refid, otp, and client_id are required."
//     });
//   }

//   try {
//     const url = "https://uat.paysprint.in/sprintverify-uat/api/v1/verification/aadhaar_verifyotp";

//     const response = await axios.post(
//       url,
//       {
//         refid,
//         otp,
//         client_id
//       },
//       {
//         headers: getHeaders(refid)
//       }
//     );

//     return res.status(response.status).json({
//       success: response.status === 200,
//       message: response.data.message || "OTP validated successfully",
//       data: response.data
//     });

//   } catch (error) {
//     const status = error.response?.status || 500;
//     const message = error.response?.data?.message || "Internal server error";

//     logger.error("Aadhaar OTP validation failed", {
//       refid,
//       otp,
//       client_id,
//       status,
//       message,
//       error: error.stack
//     });

//     return res.status(status).json({ success: false, message });
//   }
// };
// // ✅ Voter ID Verification Controller
// const voterIdValidate = async (req, res) => {
//   const { refid, id_number } = req.body;

//   if (!refid || !id_number) {
//     return res.status(400).json({
//       success: false,
//       message: "refid and id_number (Voter ID) are required."
//     });
//   }

//   try {
//     const url = "https://uat.paysprint.in/sprintverify-uat/api/v1/verification/voter_verify";

//     const response = await axios.post(
//       url,
//       { refid, id_number },
//       { headers: getHeaders(refid) }
//     );

//     return res.status(response.status).json({
//       success: response.status === 200,
//       message: response.data.message || "Voter ID validated successfully",
//       data: response.data
//     });

//   } catch (error) {
//     const status = error.response?.status || 500;
//     const message = error.response?.data?.message || "Internal server error";

//     logger.error("Voter ID validation failed", {
//       refid,
//       id_number,
//       status,
//       message,
//       error: error.stack
//     });

//     return res.status(status).json({ success: false, message });
//   }
// };

// // ✅ Driving Licence V2 Verification Controller
// const drivingLicenceV2Validate = async (req, res) => {
//   const { refid, driving_licence, dob } = req.body;

//   if (!refid || !driving_licence || !dob) {
//     return res.status(400).json({
//       success: false,
//       message: "refid, driving_licence, and dob are required."
//     });
//   }

//   try {
//     const url = "https://uat.paysprint.in/sprintverify-uat/api/v1/verification/driving_licence_v2";

//     const response = await axios.post(
//       url,
//       { refid, driving_licence, dob },
//       { headers: getHeaders(refid) }
//     );

//     return res.status(response.status).json({
//       success: response.status === 200,
//       message: response.data.message || "Driving Licence V2 validated successfully",
//       data: response.data
//     });

//   } catch (error) {
//     const status = error.response?.status || 500;
//     const message = error.response?.data?.message || "Internal server error";

//     logger.error("Driving Licence V2 validation failed", {
//       refid,
//       driving_licence,
//       dob,
//       status,
//       message,
//       error: error.stack
//     });

//     return res.status(status).json({ success: false, message });
//   }
// };

// // ✅ Driving Licence V1 Verification Controller
// const drivingLicenceV1Validate = async (req, res) => {
//   const { refid, id_number, dob } = req.body;

//   if (!refid || !id_number || !dob) {
//     return res.status(400).json({
//       success: false,
//       message: "refid, id_number, and dob are required."
//     });
//   }

//   try {
//     const url = "https://uat.paysprint.in/sprintverify-uat/api/v1/verification/drivinglicense_verify";

//     const response = await axios.post(
//       url,
//       { refid, id_number, dob },
//       { headers: getHeaders(refid) }
//     );

//     return res.status(response.status).json({
//       success: response.status === 200,
//       message: response.data.message || "Driving Licence V1 validated successfully",
//       data: response.data
//     });

//   } catch (error) {
//     const status = error.response?.status || 500;
//     const message = error.response?.data?.message || "Internal server error";

//     logger.error("Driving Licence V1 validation failed", {
//       refid,
//       id_number,
//       dob,
//       status,
//       message,
//       error: error.stack
//     });

//     return res.status(status).json({ success: false, message });
//   }
// };

// // ✅ GST Verification Controller
// const gstValidate = async (req, res) => {
//   const { refid, id_number, filing_status } = req.body;

//   if (!refid || !id_number || typeof filing_status !== "boolean") {
//     return res.status(400).json({
//       success: false,
//       message: "refid, id_number, and filing_status (true/false) are required."
//     });
//   }

//   try {
//     const url = "https://uat.paysprint.in/sprintverify-uat/api/v1/verification/gst_verify";

//     const response = await axios.post(
//       url,
//       { refid, id_number, filing_status },
//       { headers: getHeaders(refid) }
//     );

//     return res.status(response.status).json({
//       success: response.status === 200,
//       message: response.data.message || "GST validated successfully",
//       data: response.data
//     });

//   } catch (error) {
//     const status = error.response?.status || 500;
//     const message = error.response?.data?.message || "Internal server error";

//     logger.error("GST validation failed", {
//       refid,
//       id_number,
//       filing_status,
//       status,
//       message,
//       error: error.stack
//     });

//     return res.status(status).json({ success: false, message });
//   }
// };
// // ✅ Passport Verification Controller
// const passportValidate = async (req, res) => {
//   const { refid, id_number, dob } = req.body;

//   if (!refid || !id_number || !dob) {
//     return res.status(400).json({
//       success: false,
//       message: "refid, id_number, and dob are required."
//     });
//   }

//   try {
//     const url = "https://uat.paysprint.in/sprintverify-uat/api/v1/verification/passport_verify";

//     const response = await axios.post(
//       url,
//       { refid, id_number, dob },
//       { headers: getHeaders(refid) }
//     );

//     return res.status(response.status).json({
//       success: response.status === 200,
//       message: response.data.message || "Passport validated successfully",
//       data: response.data
//     });

//   } catch (error) {
//     const status = error.response?.status || 500;
//     const message = error.response?.data?.message || "Internal server error";

//     logger.error("Passport validation failed", {
//       refid,
//       id_number,
//       dob,
//       status,
//       message,
//       error: error.stack
//     });

//     return res.status(status).json({ success: false, message });
//   }
// };
// // ✅ Udyam Aadhaar V1 Verification Controller
// const udyamAadhaarV1Validate = async (req, res) => {
//   const { refid, id_number } = req.body;

//   if (!refid || !id_number) {
//     return res.status(400).json({
//       success: false,
//       message: "refid and id_number are required."
//     });
//   }

//   try {
//     const url = "https://uat.paysprint.in/sprintverify-uat/api/v1/verification/udyam_aadhaar_verify";

//     const response = await axios.post(
//       url,
//       { refid, id_number },
//       { headers: getHeaders(refid) }
//     );

//     return res.status(response.status).json({
//       success: response.status === 200,
//       message: response.data.message || "Udyam Aadhaar V1 validated successfully",
//       data: response.data
//     });

//   } catch (error) {
//     const status = error.response?.status || 500;
//     const message = error.response?.data?.message || "Internal server error";

//     logger.error("Udyam Aadhaar V1 validation failed", {
//       refid,
//       id_number,
//       status,
//       message,
//       error: error.stack
//     });

//     return res.status(status).json({ success: false, message });
//   }
// };

// // ✅ Udyam Aadhaar V2 Verification Controller
// const udyamAadhaarV2Validate = async (req, res) => {
//   const { refid, udyam_aadhaar } = req.body;

//   if (!refid || !udyam_aadhaar) {
//     return res.status(400).json({
//       success: false,
//       message: "refid and udyam_aadhaar are required."
//     });
//   }

//   try {
//     const url = "https://uat.paysprint.in/sprintverify-uat/api/v1/verification/udyam_aadhaar_verify_v2";

//     const response = await axios.post(
//       url,
//       { refid, udyam_aadhaar },
//       { headers: getHeaders(refid) }
//     );

//     return res.status(response.status).json({
//       success: response.status === 200,
//       message: response.data.message || "Udyam Aadhaar V2 validated successfully",
//       data: response.data
//     });

//   } catch (error) {
//     const status = error.response?.status || 500;
//     const message = error.response?.data?.message || "Internal server error";

//     logger.error("Udyam Aadhaar V2 validation failed", {
//       refid,
//       udyam_aadhaar,
//       status,
//       message,
//       error: error.stack
//     });

//     return res.status(status).json({ success: false, message });
//   }
// };
// // ✅ ITR Check Controller
// const itrCheck = async (req, res) => {
//   const { pan_number } = req.body;

//   if (!pan_number) {
//     return res.status(400).json({
//       success: false,
//       message: "pan_number is required."
//     });
//   }

//   const refid = `ITRCHK-${Date.now()}`;

//   try {
//     const url = "https://uat.paysprint.in/sprintverify-uat/api/v1/verification/itr_check";

//     const response = await axios.post(
//       url,
//       { pan_number },
//       { headers: getHeaders(refid) }
//     );

//     return res.status(response.status).json({
//       success: response.status === 200,
//       message: response.data.message || "ITR check successful",
//       data: response.data
//     });

//   } catch (error) {
//     const status = error.response?.status || 500;
//     const message = error.response?.data?.message || "Internal server error";

//     logger.error("ITR check failed", {
//       pan_number,
//       status,
//       message,
//       error: error.stack
//     });

//     return res.status(status).json({ success: false, message });
//   }
// };

// // ✅ ITR Acknowledgement Controller
// const itrAcknowledgement = async (req, res) => {
//   const { ack_number } = req.body;

//   if (!ack_number) {
//     return res.status(400).json({
//       success: false,
//       message: "ack_number is required."
//     });
//   }

//   const refid = `ITRACK-${Date.now()}`;

//   try {
//     const url = "https://uat.paysprint.in/sprintverify-uat/api/v1/verification/itr_ack";

//     const response = await axios.post(
//       url,
//       { ack_number },
//       { headers: getHeaders(refid) }
//     );

//     return res.status(response.status).json({
//       success: response.status === 200,
//       message: response.data.message || "ITR acknowledgement fetched successfully",
//       data: response.data
//     });

//   } catch (error) {
//     const status = error.response?.status || 500;
//     const message = error.response?.data?.message || "Internal server error";

//     logger.error("ITR acknowledgement failed", {
//       ack_number,
//       status,
//       message,
//       error: error.stack
//     });

//     return res.status(status).json({ success: false, message });
//   }
// };


// // ✅ MCA Company Details Verification Controller
// const mcaCompanyVerify = async (req, res) => {
//   const { refid, id_number } = req.body;

//   if (!refid || !id_number) {
//     return res.status(400).json({
//       success: false,
//       message: "refid and id_number are required."
//     });
//   }

//   try {
//     const url = "https://uat.paysprint.in/sprintverify-uat/api/v1/verification/mca_verify";

//     const response = await axios.post(
//       url,
//       { refid, id_number },
//       { headers: getHeaders(refid) }
//     );

//     return res.status(response.status).json({
//       success: response.status === 200,
//       message: response.data.message || "MCA company details fetched successfully",
//       data: response.data
//     });

//   } catch (error) {
//     const status = error.response?.status || 500;
//     const message = error.response?.data?.message || "Internal server error";

//     logger.error("MCA verification failed", {
//       refid,
//       id_number,
//       status,
//       message,
//       error: error.stack
//     });

//     return res.status(status).json({ success: false, message });
//   }
// };
// // ✅ TAN Verification Controller
// const tanVerify = async (req, res) => {
//   const { refid, id_number } = req.body;

//   if (!refid || !id_number) {
//     return res.status(400).json({
//       success: false,
//       message: "refid and id_number are required."
//     });
//   }

//   try {
//     const url = "https://uat.paysprint.in/sprintverify-uat/api/v1/verification/tan_verify";

//     const response = await axios.post(
//       url,
//       { refid, id_number },
//       { headers: getHeaders(refid) }
//     );

//     return res.status(response.status).json({
//       success: response.status === 200,
//       message: response.data.message || "TAN validated successfully",
//       data: response.data
//     });

//   } catch (error) {
//     const status = error.response?.status || 500;
//     const message = error.response?.data?.message || "Internal server error";

//     logger.error("TAN verification failed", {
//       refid,
//       id_number,
//       status,
//       message,
//       error: error.stack
//     });

//     return res.status(status).json({ success: false, message });
//   }
// };
// // ✅ Get State List Controller
// const getStateList = async (req, res) => {

//   const refid = `GETSTATE-${Date.now()}`;

//   try {
//     const url = "https://uat.paysprint.in/sprintverify-uat/api/v1/verification/getStateList";

//     const response = await axios.post(
//       url,
//       {},
//       { headers: getHeaders(refid) }
//     );

//     return res.status(response.status).json({
//       success: response.status === 200,
//       message: response.data.message || "State list fetched successfully",
//       data: response.data
//     });

//   } catch (error) {
//     const status = error.response?.status || 500;
//     const message = error.response?.data?.message || "Internal server error";

//     logger.error("State list fetch failed", {
//       refid,
//       status,
//       message,
//       error: error.stack
//     });

//     return res.status(status).json({ success: false, message });
//   }
// };
// // ✅ Shop Establishment Verification Controller
// const shopEstablishmentVerify = async (req, res) => {
//   const { refid, state_code, shop_number } = req.body;

//   if (!refid || !state_code || !shop_number) {
//     return res.status(400).json({
//       success: false,
//       message: "refid, state_code, and shop_number are required."
//     });
//   }

//   try {
//     const url = "https://uat.paysprint.in/sprintverify-uat/api/v1/verification/shop_establishment";

//     const response = await axios.post(
//       url,
//       { refid, state_code, shop_number },
//       { headers: getHeaders(refid) }
//     );

//     return res.status(response.status).json({
//       success: response.status === 200,
//       message: response.data.message || "Shop Establishment validated successfully",
//       data: response.data
//     });

//   } catch (error) {
//     const status = error.response?.status || 500;
//     const message = error.response?.data?.message || "Internal server error";

//     logger.error("Shop Establishment verification failed", {
//       refid,
//       state_code,
//       shop_number,
//       status,
//       message,
//       error: error.stack
//     });

//     return res.status(status).json({ success: false, message });
//   }
// };



// module.exports={
//     aadhaarValidateWithoutOTP,
//     aadhaarSendOTP,
//     aadhaarVerifyOTP,
//     voterIdValidate,drivingLicenceV2Validate,drivingLicenceV1Validate ,gstValidate,passportValidate,
//     udyamAadhaarV2Validate,udyamAadhaarV1Validate ,itrCheck,itrAcknowledgement,mcaCompanyVerify,tanVerify,
//     getStateList,shopEstablishmentVerify
// }
// ✅ Refactored Paysprint Verification Controller
const axios = require("axios");
const jwt = require("jsonwebtoken");
const logger = require("../../utils/Logger");
const VerificationLog = require("../../models/VerificationLog");

const PARTNER_ID = "CORP00002028";
const JWT_SECRET = process.env.PAYSPRINT_JWT_KEY || "UTA5U1VEQXdNREF5TURJNFRucEpOVTU2UVhsT2FrVjRUMUU5UFE9PQ==";
// const AUTH_KEY = process.env.PAYSPRINT_AUTH_KEY || "TVRJek5EVTJOelUwTnpKRFQxSlFNREF3TURFPQ==";



// JWT Generator
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

// Headers Setup
const getHeaders = (refid) => ({
  Token: generatePaysprintJWT(PARTNER_ID, refid, JWT_SECRET),
  // authorisedkey: AUTH_KEY,
  "User-Agent": PARTNER_ID,
  "Content-Type": "application/json",
});

// Save to DB
const saveVerificationLog = async (log) => {
  try {
    await VerificationLog.create(log);
    logger.info(`Verification log saved: ${log.type} - ${log.refid}`);
  } catch (err) {
    logger.error("DB Log Save Error:", err.message);
  }
};

// Main Handler with Logs
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

      logger.info("Returning cached log in credentials mode", { type }, { refid, requestPayload });

      return res.status(log.statusCode || 200).json({
        success: log.success,
        message: "Fetched from credentials log",
        data: log.responsePayload,
      });

    }
    logger.info(`Sending request for ${type}`, { refid, requestPayload });

    const response = await axios.post(endpoint, requestPayload, { headers });

    const logData = {
      refid,
      type,
      requestPayload,
      responsePayload: response.data,
      statusCode: response.status,
      success: true,
    };

    await saveVerificationLog(logData);

    logger.info(`Verification success: ${type}`, { refid, resData: response.data, status: response.status });

    return res.status(response.status).json({
      success: true,
      message: response.data.message || `${type} verification successful`,
      data: response.data,
    });

  } catch (error) {
    const statusCode = error?.response?.status || 500;
    const errorMsg = error?.response?.data?.message || error.message;

    const logData = {
      refid,
      type,
      requestPayload,
      responsePayload: error?.response?.data || { error: errorMsg },
      statusCode,
      success: false,
    };

    await saveVerificationLog(logData);

    logger.error(`Verification failed: ${type}`, { refid, status: statusCode, error: errorMsg });

    return res.status(statusCode).json({
      success: false,
      message: errorMsg,
    });
  }
};


// Exported Controllers
module.exports = {
  aadhaarValidateWithoutOTP: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/aadhaar_without_otp", "aadhaar_without_otp"),
  aadhaarSendOTP: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/aadhaar_sendotp", "aadhaar_sendotp", "id_number"),
  aadhaarVerifyOTP: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/aadhaar_verifyotp", "aadhaar_verifyotp"),
  voterIdValidate: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/voter_verify", "voter_verify"),
  drivingLicenceV1Validate: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/drivinglicense_verify", "driving_licence_v1"),
  drivingLicenceV2Validate: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/driving_licence_v2", "driving_licence_v2"),
  gstValidate: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/gst_verify", "gst_verify"),
  passportValidate: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/passport_verify", "passport_verify"),
  udyamAadhaarV1Validate: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/udyam_aadhaar_verify", "udyam_aadhaar_v1"),
  udyamAadhaarV2Validate: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/udyam_aadhaar_verify_v2", "udyam_aadhaar_v2"),
  itrCheck: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/itr_check", "itr_check", "pan_number"),
  itrAcknowledgement: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/itr_ack", "itr_ack", "ack_number"),
  mcaCompanyVerify: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/mca_verify", "mca_verify"),
  tanVerify: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/tan_verify", "tan_verify"),
  getStateList: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/getStateList", "get_state_list"),
  ecredit_score: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/ecredit_score", "ecredit_score"),
  credit_report_checker: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/credit_report_checker", "credit_report_checker"),
  cibil_score: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/cbil_score", "cibil_score"),
  shopEstablishmentVerify: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/shop_establishment", "shop_establishment"),
};
