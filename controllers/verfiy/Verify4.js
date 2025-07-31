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

const getHeaders = (refid, isForm = false) => ({
  Token: generatePaysprintJWT(PARTNER_ID, refid, JWT_SECRET),
  // authorisedkey: AUTH_KEY,
  "User-Agent": PARTNER_ID,
  ...(isForm ? {} : { "Content-Type": "application/json" }), // ✅ only include if not form-data
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

const handleFileUpload = async (req, res, endpoint, type, fileField, extraFields = []) => {
  const refid = req.body.refid || `${type.toUpperCase()}-${Date.now()}`;
  const form = new FormData();

  if (req.files) {
    const image1 = req.files?.image1?.[0];
    const image2 = req.files?.image2?.[0];

    form.append("image1", image1.buffer, { filename: image1.originalname });
    form.append("image2", image2.buffer, { filename: image2.originalname });
  } else {
    // Add main file
    form.append(fileField, req.file.buffer, { filename: req.file.originalname });
  }

  // Add extra fields
  Array.isArray(extraFields) &&
    extraFields?.forEach((field) => {
      if (req.body[field]) {
        form.append(field, req.body[field]);
      }
    });

  const headers = {
    ...getHeaders(refid, true),
    ...form.getHeaders(),
  };

  try {
    logger.info(`Sending request for ${type}`, { refid }, req.body);

    const response = await axios.post(`https://api.verifya2z.com/api/v1/verification/${endpoint}`, form, { headers });
    await saveVerificationLog({
      refid,
      type,
      requestPayload: { fields: req.body },
      responsePayload: response.data,
      statusCode: response.status,
      success: true,
    });
    logger.info(`success response: ${type}`, { refid, resData: response.data, status: response.status });
    return res.status(response.status).json({ success: true, data: response.data });
  } catch (error) {
    const statusCode = error.response?.status || 500;
    const errorMsg = error.response?.data?.message || error.message;
    await saveVerificationLog({
      refid,
      type,
      requestPayload: { fields: req.body },
      responsePayload: error.response?.data || { error: errorMsg },
      statusCode,
      success: false,
    });
    logger.error(`❌ ${type} failed`, { refid, error: errorMsg });
    return res.status(statusCode).json({ success: false, message: errorMsg });
  }
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
  imeiVerify: createPaysprintController("imei_verification", "imei_verification"),
  ocrDocUpload: (req, res) => handleFileUpload(req, res, "ocr_doc", "ocr_doc_upload", "file", ["type", "link", "back"]),
  faceMatch: (req, res) => handleFileUpload(req, res, "face_match", "face_match", ["image1", "image2"], ["threshold"]),
  livenessCheck: (req, res) => handleFileUpload(req, res, "liveness_check", "liveness_check", "video_file", { allowURL: true }),
  aadhaarQRCheck: (req, res) => handleFileUpload(req, res, "aadhaar_qr_check", "aadhaar_qr_check", "aadhaar_image"),
  bankStatement: (req, res) => handleFileUpload(req, res, "bank-statement-analyzer/upload", "bank-statement-analyzer/upload", "file", ["refid"]),
  bankStatementFatch: createPaysprintController("bank-statement-analyzer/report-fetch", "bank-statement-analyzer/report-fetch",),

};
