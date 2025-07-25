// // controllers/verificationController.js
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

// // Helper
// const makeApiCall = async (endpoint, data, res, refidPrefix = "ref") => {
//   try {
//     const refid = `${refidPrefix}_${Date.now()}`;
//     const headers = getHeaders(refid);
//     const response = await axios.post(endpoint, data, { headers });
//     return res.status(200).json(response.data);
//   } catch (error) {
//     console.error("API Error:", error?.response?.data || error.message);
//     return res.status(500).json({
//       message: "API request failed",
//       error: error?.response?.data || error.message,
//     });
//   }
// };

// module.exports = {
//   panVerify: (req, res) => makeApiCall("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/pan_verify", req.body, res, "panverify"),
//   panDetailsVerify: (req, res) => makeApiCall("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/pandetails_verify", req.body, res, "pandetails"),
//   companyToCin: (req, res) => makeApiCall("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/company_name_to_cin", req.body, res, "companycin"),
//   sendTelecomOtp: (req, res) => makeApiCall("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/telecom/sendotp", req.body, res, "sendotp"),
//   verifyTelecomOtp: (req, res) => makeApiCall("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/telecom/verifyotp", req.body, res, "verifyotp"),
//   crimeCheckIndividual: (req, res) => makeApiCall("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/crime-check/individual", req.body, res, "crimeindv"),
//   crimeCheckCompany: (req, res) => makeApiCall("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/crime-check/company", req.body, res, "crimecomp"),
//   crimeReportPdf: (req, res) => makeApiCall("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/crime-check/download_pdf_report", req.body, res, "crimepdf"),
//   crimeReportJson: (req, res) => makeApiCall("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/crime-check/download_json_report", req.body, res, "crimejson"),
//   digilockerInitSession: (req, res) => makeApiCall("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/digilocker/initiate_session", req.body, res, "digiinit"),
//   digilockerToken: (req, res) => makeApiCall("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/digilocker/access_token", req.body, res, "digitoken"),
//   digilockerIssuedFiles: (req, res) => makeApiCall("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/digilocker/issued_files", req.body, res, "digifiles"),
//   digilockerDownloadPdf: (req, res) => makeApiCall("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/digilocker/download_pdf", req.body, res, "digipdf"),
//   digilockerDownloadXml: (req, res) => makeApiCall("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/digilocker/download_xml", req.body, res, "digixml"),
//   digilockerEaadhaarXml: (req, res) => makeApiCall("https://uat.paysprint.in/sprintverify-uat/api/v1/verification/digilocker/eaadhaar", req.body, res, "eaadhaar"),
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
  panVerify: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/pan_verify", "pan_verify"),
  panDetailsVerify: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/pandetails_verify", "pan_details_verify"),
  companyToCin: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/company_name_to_cin", "company_to_cin"),
  sendTelecomOtp: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/telecom/sendotp", "send_telecom_otp"),
  verifyTelecomOtp: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/telecom/verifyotp", "verify_telecom_otp"),
  crimeCheckIndividual: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/crime-check/individual", "crime_check_individual"),
  crimeCheckCompany: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/crime-check/company", "crime_check_company"),
  crimeReportPdf: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/crime-check/download_pdf_report", "crime_report_pdf"),
  crimeReportJson: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/crime-check/download_json_report", "crime_report_json"),
  digilockerInitSession: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/digilocker/initiate_session", "digilocker_initiate_session"),
  digilockerToken: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/digilocker/access_token", "digilocker_access_token"),
  digilockerIssuedFiles: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/digilocker/issued_files", "digilocker_issued_files"),
  digilockerDownloadPdf: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/digilocker/download_pdf", "digilocker_download_pdf"),
  digilockerDownloadXml: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/digilocker/download_xml", "digilocker_download_xml"),
  digilockerEaadhaarXml: (req, res) => handleVerification(req, res, "https://api.verifya2z.com/api/v1/verification/digilocker/eaadhaar", "digilocker_eaadhaar_xml"),
};


// const handleVerification = async (req, res, endpoint, type, refidKey = "refid") => {
//   const refid = req.body[refidKey] || `${type.toUpperCase()}-${Date.now()}`;
//   const headers = getHeaders(refid);
//   const requestPayload = req.body;

//   const isUatEnv = req.headers["x-env"] === "uat"; // 👈 Check UAT environment

//   // ✅ MOCK MODE for UAT
//   if (isUatEnv) {
//     const mockData = {
//       success: true,
//       message: `${type} mock success`,
//       data: {
//         name: "Test User",
//         status: "Verified",
//         mock: true,
//       },
//     };

//     await saveVerificationLog({
//       refid,
//       type,
//       requestPayload,
//       responsePayload: mockData,
//       statusCode: 200,
//       success: true,
//       mode: "mock",
//     });

//     return res.status(200).json(mockData);
//   }

//   // ✅ Real API call for Production
//   try {
//     const response = await axios.post(endpoint, requestPayload, { headers });
//     await saveVerificationLog({
//       refid,
//       type,
//       requestPayload,
//       responsePayload: response.data,
//       statusCode: response.status,
//       success: true,
//     });

//     return res.status(response.status).json({
//       success: true,
//       message: response.data.message || `${type} verification successful`,
//       data: response.data,
//     });
//   } catch (error) {
//     const statusCode = error?.response?.status || 500;
//     const errorMsg = error?.response?.data?.message || error.message;

//     await saveVerificationLog({
//       refid,
//       type,
//       requestPayload,
//       responsePayload: error?.response?.data || { error: errorMsg },
//       statusCode,
//       success: false,
//     });

//     logger.error(`${type} verification failed`, { refid, error: errorMsg });

//     return res.status(statusCode).json({
//       success: false,
//       message: errorMsg,
//     });
//   }
// };
