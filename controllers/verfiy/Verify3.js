// const axios = require("axios");
// const jwt = require("jsonwebtoken");

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

// // ✅ Header Builder
// const getHeaders = (reqid) => ({
//   Token: generatePaysprintJWT(PARTNER_ID, reqid, JWT_SECRET),
//   authorisedkey: AUTH_KEY,
//   "User-Agent": PARTNER_ID,
//   "Content-Type": "application/json",
// });

// // ✅ Controller Function
// const rcVerify = async (req, res) => {
//   try {
//     const { refid, id_number } = req.body;

//     if (!refid || !id_number) {
//       return res.status(400).json({ message: "refid and id_number are required" });
//     }

//     const headers = getHeaders(refid);

//     const response = await axios.post(
//       "https://uat.paysprint.in/sprintverify-uat/api/v1/verification/rc_verify",
//       { refid, id_number },
//       { headers }
//     );

//     return res.status(200).json(response.data);
//   } catch (error) {
//     console.error("RC Verify Error:", error?.response?.data || error.message);
//     return res.status(500).json({
//       message: "RC verification failed",
//       error: error?.response?.data || error.message,
//     });
//   }
// };
// // Controller Function
// const rcAdvanceVerify = async (req, res) => {
//   try {
//     const { rc_number, refid } = req.body;

//     if (!rc_number || !refid) {
//       return res.status(400).json({ message: "rc_number and refid are required" });
//     }

//     const headers = getHeaders(refid);

//     const response = await axios.post(
//       "https://uat.paysprint.in/sprintverify-uat/api/v1/verification/rc_advance",
//       { rc_number, refid },
//       { headers }
//     );

//     return res.status(200).json(response.data);
//   } catch (error) {
//     console.error("RC Advance Verify Error:", error?.response?.data || error.message);
//     return res.status(500).json({
//       message: "RC Advance verification failed",
//       error: error?.response?.data || error.message,
//     });
//   }
// };
// // ✅ Controller Function: Reverse RC Verify
// const reverseRCVerify = async (req, res) => {
//   try {
//     const { refid, chassis_number } = req.body;

//     if (!refid || !chassis_number) {
//       return res.status(400).json({ message: "refid and chassis_number are required" });
//     }

//     const headers = getHeaders(refid);

//     const response = await axios.post(
//       "https://uat.paysprint.in/sprintverify-uat/api/v1/verification/reverse-rc",
//       { refid, chassis_number },
//       { headers }
//     );

//     return res.status(200).json(response.data);
//   } catch (error) {
//     console.error("Reverse RC Verify Error:", error?.response?.data || error.message);
//     return res.status(500).json({
//       message: "Reverse RC verification failed",
//       error: error?.response?.data || error.message,
//     });
//   }
// };
// // ✅ Controller Function: IEC Verify
// const iecVerify = async (req, res) => {
//   try {
//     const { refid, iec_number } = req.body;

//     if (!refid || !iec_number) {
//       return res.status(400).json({ message: "refid and iec_number are required" });
//     }

//     const headers = getHeaders(refid);

//     const response = await axios.post(
//       "https://uat.paysprint.in/sprintverify-uat/api/v1/verification/iec_verify",
//       { refid, iec_number },
//       { headers }
//     );

//     return res.status(200).json(response.data);
//   } catch (error) {
//     console.error("IEC Verify Error:", error?.response?.data || error.message);
//     return res.status(500).json({
//       message: "IEC verification failed",
//       error: error?.response?.data || error.message,
//     });
//   }
// };
// // ✅ Controller Function: FSSAI Verify
// const fssaiVerify = async (req, res) => {
//   try {
//     const { refid, fssai_number } = req.body;

//     if (!refid || !fssai_number) {
//       return res.status(400).json({ message: "refid and fssai_number are required" });
//     }

//     const headers = getHeaders(refid);

//     const response = await axios.post(
//       "https://uat.paysprint.in/sprintverify-uat/api/v1/verification/fssai_check",
//       { refid, fssai_number },
//       { headers }
//     );

//     return res.status(200).json(response.data);
//   } catch (error) {
//     console.error("FSSAI Verify Error:", error?.response?.data || error.message);
//     return res.status(500).json({
//       message: "FSSAI verification failed",
//       error: error?.response?.data || error.message,
//     });
//   }
// };
// // ✅ Controller Function: Email Checker V1
// const emailCheckerV1 = async (req, res) => {
//   try {
//     const { refid, email } = req.body;

//     if (!refid || !email) {
//       return res.status(400).json({ message: "refid and email are required" });
//     }

//     const headers = getHeaders(refid);

//     const response = await axios.post(
//       "https://uat.paysprint.in/sprintverify-uat/api/v1/verification/email_checker",
//       { refid, email },
//       { headers }
//     );

//     return res.status(200).json(response.data);
//   } catch (error) {
//     console.error("Email Checker V1 Error:", error?.response?.data || error.message);
//     return res.status(500).json({
//       message: "Email verification (V1) failed",
//       error: error?.response?.data || error.message,
//     });
//   }
// };

// // ✅ Controller Function: Email Checker V2
// const emailCheckerV2 = async (req, res) => {
//   try {
//     const { refid, email } = req.body;

//     if (!refid || !email) {
//       return res.status(400).json({ message: "refid and email are required" });
//     }

//     const headers = getHeaders(refid);

//     const response = await axios.post(
//       "https://uat.paysprint.in/sprintverify-uat/api/v1/verification/email_checker_v2",
//       { refid, email },
//       { headers }
//     );

//     return res.status(200).json(response.data);
//   } catch (error) {
//     console.error("Email Checker V2 Error:", error?.response?.data || error.message);
//     return res.status(500).json({
//       message: "Email verification (V2) failed",
//       error: error?.response?.data || error.message,
//     });
//   }
// };
// // ✅ Controller Function: LEI Verify
// const leiVerify = async (req, res) => {
//   try {
//     const { refid, id_number } = req.body;

//     if (!refid || !id_number) {
//       return res.status(400).json({ message: "refid and id_number are required" });
//     }

//     const headers = getHeaders(refid);

//     const response = await axios.post(
//       "https://uat.paysprint.in/sprintverify-uat/api/v1/verification/lei_verify",
//       { refid, id_number },
//       { headers }
//     );

//     return res.status(200).json(response.data);
//   } catch (error) {
//     console.error("LEI Verify Error:", error?.response?.data || error.message);
//     return res.status(500).json({
//       message: "LEI verification failed",
//       error: error?.response?.data || error.message,
//     });
//   }
// };
// // ✅ Controller Function: Aadhaar QR Check
// const aadhaarQRCheck = async (req, res) => {
//   try {
//     const { qr_text } = req.body;

//     if (!qr_text) {
//       return res.status(400).json({ message: "qr_text is required" });
//     }

//     // You can use a generated refid or UUID here if needed, else pass a dummy for now
//     const refid = `qr_${Date.now()}`;
//     const headers = getHeaders(refid);

//     const response = await axios.post(
//       "https://uat.paysprint.in/sprintverify-uat/api/v1/verification/aadhaar_qr_check",
//       { qr_text },
//       { headers }
//     );

//     return res.status(200).json(response.data);
//   } catch (error) {
//     console.error("Aadhaar QR Check Error:", error?.response?.data || error.message);
//     return res.status(500).json({
//       message: "Aadhaar QR check failed",
//       error: error?.response?.data || error.message,
//     });
//   }
// };
// const sendEpfoOtp = async (req, res) => {
//   try {
//     const { epfo_number } = req.body;

//     if (!epfo_number) {
//       return res.status(400).json({ message: "epfo_number is required" });
//     }

//     const refid = `otp_${Date.now()}`;
//     const headers = getHeaders(refid);

//     const response = await axios.post(
//       "https://uat.paysprint.in/sprintverify-uat/api/v1/verification/sendOtp",
//       { epfo_number },
//       { headers }
//     );

//     return res.status(200).json(response.data);
//   } catch (error) {
//     console.error("EPFO Send OTP Error:", error?.response?.data || error.message);
//     return res.status(500).json({
//       message: "EPFO Send OTP failed",
//       error: error?.response?.data || error.message,
//     });
//   }
// };
// const verifyEpfoOtp = async (req, res) => {
//   try {
//     const { client_id, otp } = req.body;

//     if (!client_id || !otp) {
//       return res.status(400).json({ message: "client_id and otp are required" });
//     }

//     const headers = getHeaders(client_id);

//     const response = await axios.post(
//       "https://uat.paysprint.in/sprintverify-uat/api/v1/verification/VerifyOtp",
//       { client_id, otp },
//       { headers }
//     );

//     return res.status(200).json(response.data);
//   } catch (error) {
//     console.error("EPFO Verify OTP Error:", error?.response?.data || error.message);
//     return res.status(500).json({
//       message: "EPFO Verify OTP failed",
//       error: error?.response?.data || error.message,
//     });
//   }
// };
// const epfoPassbookDownload = async (req, res) => {
//   try {
//     const { client_id } = req.body;

//     if (!client_id) {
//       return res.status(400).json({ message: "client_id is required" });
//     }

//     const headers = getHeaders(client_id);

//     const response = await axios.post(
//       "https://uat.paysprint.in/sprintverify-uat/api/v1/verification/epfo_passbook_download",
//       { client_id },
//       { headers }
//     );

//     return res.status(200).json(response.data);
//   } catch (error) {
//     console.error("EPFO Passbook Download Error:", error?.response?.data || error.message);
//     return res.status(500).json({
//       message: "EPFO Passbook Download failed",
//       error: error?.response?.data || error.message,
//     });
//   }
// };
// const epfoKycFetch = async (req, res) => {
//   try {
//     const { client_id } = req.body;

//     if (!client_id) {
//       return res.status(400).json({ message: "client_id is required" });
//     }

//     const headers = getHeaders(client_id);

//     const response = await axios.post(
//       "https://uat.paysprint.in/sprintverify-uat/api/v1/verification/epfo_kyc_fetch",
//       { client_id },
//       { headers }
//     );

//     return res.status(200).json(response.data);
//   } catch (error) {
//     console.error("EPFO KYC Fetch Error:", error?.response?.data || error.message);
//     return res.status(500).json({
//       message: "EPFO KYC Fetch failed",
//       error: error?.response?.data || error.message,
//     });
//   }
// };
// const epfoWithoutOtp = async (req, res) => {
//   try {
//     const { uan_number } = req.body;

//     if (!uan_number) {
//       return res.status(400).json({ message: "uan_number is required" });
//     }

//     const refid = `epfwo_${Date.now()}`;
//     const headers = getHeaders(refid);

//     const response = await axios.post(
//       "https://uat.paysprint.in/sprintverify-uat/api/v1/verification/epfo_without_otp",
//       { uan_number },
//       { headers }
//     );

//     return res.status(200).json(response.data);
//   } catch (error) {
//     console.error("EPFO Without OTP Error:", error?.response?.data || error.message);
//     return res.status(500).json({
//       message: "EPFO Without OTP failed",
//       error: error?.response?.data || error.message,
//     });
//   }
// };







// module.exports = {rcVerify,rcAdvanceVerify ,reverseRCVerify,fssaiVerify,iecVerify,emailCheckerV1,
//     emailCheckerV2,leiVerify,aadhaarQRCheck,sendEpfoOtp,verifyEpfoOtp,epfoPassbookDownload,epfoKycFetch,epfoWithoutOtp};
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

const createPaysprintController = (endpointPath, type) => {
  return (req, res) => handleVerification(req, res, `https://api.verifya2z.com/api/v1/verification/${endpointPath}`, type);
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
  rcVerify: createPaysprintController("rc_verify", "rc_verify"),
  rcAdvanceVerify: createPaysprintController("rc_advance", "rc_advance_verify"),
  reverseRCVerify: createPaysprintController("reverse-rc", "reverse_rc_verify"),
  iecVerify: createPaysprintController("iec_verify", "iec_verify"),
  fssaiVerify: createPaysprintController("fssai_check", "fssai_verify"),
  emailCheckerV1: createPaysprintController("email_checker", "email_checker_v1"),
  emailCheckerV2: createPaysprintController("email_checker_v2", "email_checker_v2"),
  leiVerify: createPaysprintController("lei_verify", "lei_verify"),
  sendEpfoOtp: createPaysprintController("sendOtp", "epfo_send_otp"),
  verifyEpfoOtp: createPaysprintController("VerifyOtp", "epfo_verify_otp"),
  epfoPassbookDownload: createPaysprintController("epfo_passbook_download", "epfo_passbook_download"),
  epfoKycFetch: createPaysprintController("epfo_kyc_fetch", "epfo_kyc_fetch"),
  epfoWithoutOtp: createPaysprintController("epfo_without_otp", "epfo_without_otp"),
  ckycSearch: createPaysprintController("ckyc_search", "ckyc_search"),
  ckycDownload: createPaysprintController("ckyc_download", "ckyc_download"),
  upiVerify: createPaysprintController("upi_verify", "upi_verify"),
  challanInfoV1: createPaysprintController("chalan_info", "challan_info_v1"),
  challanInfoV2: createPaysprintController("challan-info-v2", "challan_info_v2"),
  reverseGeocode: createPaysprintController("reverse_geocode", "reverse_geocode"),
  ipLookup: createPaysprintController("ip_geo_lookup", "ip_lookup"),
  mobileOperator: createPaysprintController("mobile_operator", "mobile_operator"),
  courtCaseCheck: createPaysprintController("court_case_check", "court_case_check"),
  companyToTan: createPaysprintController("company_to_tan", "company_to_tan"),
  fuelPrice: createPaysprintController("fuel_price", "fuel_price"),
  panToGst: createPaysprintController("pan_to_gst", "pan_to_gst"),
  stockPrice: createPaysprintController("stock_price", "stock_price"),
  rtoInfo: createPaysprintController("rto_info", "rto_info"),
  nameMatch: createPaysprintController("name_match", "name_match"),
  aadhaarQRCheck: createPaysprintController("aadhaar_qr_check", "aadhaar_qr_check"),
  imeiVerify: createPaysprintController("imei_verification", "imei_verification"),
  // ocrDocUpload: (req, res) => handleFileUpload(req, res, "ocr_doc", "ocr_doc_upload", "file"),
  // faceMatch: (req, res) => handleFileUpload(req, res, "face_match", "face_match", "image1", { additionalFields: ["threshold", "image2_url"] }),
  // livenessCheck: (req, res) => handleFileUpload(req, res, "liveness_check", "liveness_check", "video_file", { allowURL: true }),
};
