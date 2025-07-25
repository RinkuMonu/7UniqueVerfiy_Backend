// // ✅ Dependencies
// const jwt = require("jsonwebtoken");
// const axios = require("axios");
// const Logger = require("../../utils/Logger");


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

// const createPaysprintController = (endpointPath) => {
//   return async (req, res) => {
//     const { refid, account_number, ifsc_code, extended_data } = req.body;

//     Logger.info(`Request received at ${endpointPath}`, {
//       refid,
//       account_number: `****${account_number.slice(-4)}`,
//       ifsc_code,
//       timestamp: new Date().toISOString()
//     });

//     // validation...
//     if (!refid || !account_number || !ifsc_code) {
//       Logger.warn("Validation failed - missing required fields", { refid });
//       return res.status(400).json({
//         success: false,
//         message: "refid, account_number, and ifsc_code are required.",
//       });
//     }

//     try {
//       const url = `https://uat.paysprint.in/sprintverify-uat/api/v1/verification/${endpointPath}`;

//       const response = await axios.post(
//         url,
//         {
//           refid,
//           account_number,
//           ifsc_code,
//           ...(extended_data !== undefined && { extended_data }),
//         },
//         {
//           headers: getHeaders(refid),
//         }
//       );

//       Logger.info(`Paysprint UAT response from ${endpointPath}`, {
//         refid,
//         status: response.status,
//         response: response.data,
//       });

//       return res.status(response.status).json({
//         success: response.status === 200,
//         message: response.status === 200 ? "Verification successful" : "Verification completed with issues",
//         data: response.data,
//       });

//     } catch (error) {
//       const status = error.response?.status || 500;
//       const message = error.response?.data?.message || "Internal server error";

//       Logger.error(`Error in ${endpointPath}`, {
//         refid,
//         status,
//         message,
//         error: error.stack,
//       });

//       return res.status(status).json({ success: false, message });
//     }
//   };
// };


// // ✅ Export Controllers
// module.exports = {
//   bankVerify: createPaysprintController("bank_verify"),
//   bankVerifyV2: createPaysprintController("bank_verify_v2"),
//   bankVerifyHybridV3: createPaysprintController("bank_verify_hybrid_v3"),
//   bankVerifyPennyless: createPaysprintController("bank_verify_pennyless"),
//   bankVerifyPennylessV2: createPaysprintController("bank_verify_pennyless_v2"),
//   bankVerifyPennylessV3: createPaysprintController("bank_verify_pennyless_v3"),
//   bankVerifyPennydropV1: createPaysprintController("penny_drop"),
//   bankVerifyPennydropV2: createPaysprintController("penny_drop_v2"),
// };

// ✅ Refactored Paysprint Verification Controller
const axios = require("axios");
const jwt = require("jsonwebtoken");
const logger = require("../../utils/Logger");
const VerificationLog = require("../../models/VerificationLog");

const PARTNER_ID = "CORP00002028";
const JWT_SECRET = "UTA5U1VEQXdNREF5TURJNFRucEpOVTU2UVhsT2FrVjRUMUU5UFE9PQ==";
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
    logger.info("Verification log saved", log);
  } catch (err) {
    logger.error("DB Log Save Error", { error: err.message });
  }
};

const handleVerification = async (req, res, endpoint, type, refidKey = "refid") => {
  const refid = req.body[refidKey] || `${type.toUpperCase()}-${Date.now()}`;
  const headers = getHeaders(refid);
  const requestPayload = { ...req.body };
  const env = req.environment;
  logger.info("Request initiated", { type, refid, requestPayload });

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

    const response = await axios.post(endpoint, requestPayload, { headers });


    await saveVerificationLog({
      refid,
      type,
      requestPayload,
      responsePayload: response.data,
      statusCode: response.status,
      success: true,
    });

    logger.info("Request successful", { type, refid, resData: response.data, statusCode: response.status });

    return res.status(response.status).json({
      success: true,
      message: response.data.message || `${type} verification successful`,
      data: response.data,
    });
  } catch (error) {
    const statusCode = error?.response?.status || 500;
    const errorMsg = error?.response?.data?.message || error.message;

    await saveVerificationLog({
      refid,
      type,
      requestPayload,
      responsePayload: error?.response?.data || { error: errorMsg },
      statusCode,
      success: false,
    });

    logger.error("Request failed", { type, refid, error: errorMsg });

    return res.status(statusCode).json({
      success: false,
      message: error,
    });
  }
};

const createPaysprintController = (endpointPath, type) => {
  return (req, res) =>
    handleVerification(
      req,
      res,
      `https://api.verifya2z.com/api/v1/verification/${endpointPath}`,
      type
    );
};

module.exports = {
  panVerify: createPaysprintController("pan_verify", "pan_verify"),
  panDetailsVerify: createPaysprintController("pandetails_verify", "pan_details_verify"),
  companyToCin: createPaysprintController("company_name_to_cin", "company_to_cin"),
  sendTelecomOtp: createPaysprintController("telecom/sendotp", "send_telecom_otp"),
  verifyTelecomOtp: createPaysprintController("telecom/verifyotp", "verify_telecom_otp"),
  crimeCheckIndividual: createPaysprintController("crime-check/individual", "crime_check_individual"),
  crimeCheckCompany: createPaysprintController("crime-check/company", "crime_check_company"),
  crimeReportPdf: createPaysprintController("crime-check/download_pdf_report", "crime_report_pdf"),
  crimeReportJson: createPaysprintController("crime-check/download_json_report", "crime_report_json"),
  digilockerInitSession: createPaysprintController("digilocker/initiate_session", "digilocker_initiate_session"),
  digilockerToken: createPaysprintController("digilocker/access_token", "digilocker_access_token"),
  digilockerIssuedFiles: createPaysprintController("digilocker/issued_files", "digilocker_issued_files"),
  digilockerDownloadPdf: createPaysprintController("digilocker/download_pdf", "digilocker_download_pdf"),
  digilockerDownloadXml: createPaysprintController("digilocker/download_xml", "digilocker_download_xml"),
  digilockerEaadhaarXml: createPaysprintController("digilocker/eaadhaar", "digilocker_eaadhaar_xml"),
  bankVerify: createPaysprintController("bank_verify", "bank_verify"),
  bankVerifyV2: createPaysprintController("bank_verify_v2", "bank_verify_v2"),
  bankVerifyHybridV3: createPaysprintController("bank_verify_hybrid_v3", "bank_verify_hybrid_v3"),
  bankVerifyPennyless: createPaysprintController("bank_verify_pennyless", "bank_verify_pennyless"),
  bankVerifyPennylessV2: createPaysprintController("bank_verify_pennyless_v2", "bank_verify_pennyless_v2"),
  bankVerifyPennylessV3: createPaysprintController("bank_verify_pennyless_v3", "bank_verify_pennyless_v3"),
  bankVerifyPennydropV1: createPaysprintController("penny_drop", "penny_drop"),
  bankVerifyPennydropV2: createPaysprintController("penny_drop_v2", "penny_drop_v2"),
};