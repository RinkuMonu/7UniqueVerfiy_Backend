const express = require("express");
const router = express.Router();


const apiAuthMiddleware = require("../middlewares/apiMiddleware");
const usageTracker = require("../middlewares/trackMiddleware");

const {
  bankVerify,
  bankVerifyV2,
  bankVerifyHybridV3,
  bankVerifyPennyless,
  bankVerifyPennylessV2,
  bankVerifyPennylessV3,
  bankVerifyPennydropV1,
  bankVerifyPennydropV2,
} = require("../controllers/verfiy/Verify1");

const {
  aadhaarValidateWithoutOTP,
  aadhaarVerifyOTP,
  aadhaarSendOTP,
  voterIdValidate,
  drivingLicenceV2Validate,
  drivingLicenceV1Validate,
  gstValidate,
  passportValidate,
  getStateList,
  shopEstablishmentVerify,
  udyamAadhaarV1Validate,
  udyamAadhaarV2Validate,
  tanVerify,
  mcaCompanyVerify,
  ecredit_score,
} = require("../controllers/verfiy/Verify2");

const {
  epfoWithoutOtp,
  epfoKycFetch,
  epfoPassbookDownload,
  verifyEpfoOtp,
  sendEpfoOtp,
  leiVerify,
  emailCheckerV2,
  emailCheckerV1,
  iecVerify,
  fssaiVerify,
  reverseRCVerify,
  rcAdvanceVerify,
  rcVerify
} = require("../controllers/verfiy/Verify3");

const {
  ckycSearch,
  ckycDownload,
  livenessCheck,
  faceMatch,
  upiVerify,
  challanInfoV1,
  challanInfoV2,
  ocrDocUpload,
  aadhaarQRCheck,
  reverseGeocode,
  ipLookup,
  mobileOperator,
  courtCaseCheck,
  companyToTan,
  fuelPrice,
  panToGst,
  stockPrice,
  rtoInfo,
  nameMatch,
  imeiVerify,
  bankStatement,
  bankStatementFatch
} = require("../controllers/verfiy/Verify4");

const {
  get26asList,
  getItr,
  itrList,
  getProfile,
  itrSubmitOtp,
  itrForgetPassword,
  fetchByPan,
  aadhaarToUan,
  uanBasicV2,
  uanBasicV1,
  ifscLookup,
  fetchPersonalProfile,
  pincodeInfo,
  vpnProxyCheck,
  dinToPan,
  dinDetails,
  mobileToPan,
  directorPhone,
  mobileToUpi,
  cardValidator,
  get26as,
  itr_check
} = require("../controllers/verfiy/Verify5");

const verifyController = require("../controllers/verfiy/Verify6");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

// Verify1
router.post("/bankVerify", apiAuthMiddleware, usageTracker("bankVerify"), bankVerify);
router.post("/bankVerify/v2", apiAuthMiddleware, usageTracker("bankVerify/v2"), bankVerifyV2);
router.post("/bankVerify/hybrid/v3", apiAuthMiddleware, usageTracker("bankVerify/hybrid/v3"), bankVerifyHybridV3);
router.post("/bankVerify/pennyless", apiAuthMiddleware, usageTracker("bankVerify/pennyless"), bankVerifyPennyless);
router.post("/bankVerify/pennylessV2", apiAuthMiddleware, usageTracker("bankVerify/pennylessV2"), bankVerifyPennylessV2);
router.post("/bankVerify/pennyless/v3", apiAuthMiddleware, usageTracker("bankVerify/pennyless/v3"), bankVerifyPennylessV3);
router.post("/bankVerify/pennydrop/v1", apiAuthMiddleware, usageTracker("bankVerify/pennydrop/v1"), bankVerifyPennydropV1);
router.post("/bankVerify/pennydrop/v2", apiAuthMiddleware, usageTracker("bankVerify/pennydrop/v2"), bankVerifyPennydropV2);

// Verify2
router.post("/adhar/verify", apiAuthMiddleware, usageTracker("adhar/verify"), aadhaarValidateWithoutOTP);
router.post("/adhar/send/otp", apiAuthMiddleware, usageTracker("adhar/send/otp"), aadhaarSendOTP);
router.post("/adhar/verify/otp", apiAuthMiddleware, usageTracker("adhar/verify/otp"), aadhaarVerifyOTP);
router.post("/udyam_aadhaar_verify", apiAuthMiddleware, usageTracker("udyam_aadhaar_verify"), udyamAadhaarV1Validate);
router.post("/udyam_aadhaar_verify_v2", apiAuthMiddleware, usageTracker("udyam_aadhaar_verify_v2"), udyamAadhaarV2Validate);
router.post("/voterid", apiAuthMiddleware, usageTracker("voterid"), voterIdValidate);
router.post("/license/v1", apiAuthMiddleware, usageTracker("license/v1"), drivingLicenceV1Validate);
router.post("/license/v2", apiAuthMiddleware, usageTracker("license/v2"), drivingLicenceV2Validate);
router.post("/gstvalidate", apiAuthMiddleware, usageTracker("gstvalidate"), gstValidate);
router.post("/passport", apiAuthMiddleware, usageTracker("passport"), passportValidate);
router.post("/getStateList", apiAuthMiddleware, usageTracker("getStateList"), getStateList);
router.post("/shop_establishment", apiAuthMiddleware, usageTracker("shop_establishment"), shopEstablishmentVerify);
router.post("/tanVerify", apiAuthMiddleware, usageTracker("tanVerify"), tanVerify);
router.post("/mca_verify", apiAuthMiddleware, usageTracker("mca_verify"), mcaCompanyVerify);
router.post("/bank-statement-analyzer/upload", apiAuthMiddleware, usageTracker("bank-statement-analyzer/upload"), upload.single("file"), bankStatement);
router.post("/bank-statement-analyzer/report-fetch", apiAuthMiddleware, usageTracker("bank-statement-analyzer/report-fetch"), bankStatementFatch);
router.post("/ecredit_score", apiAuthMiddleware, usageTracker("ecredit_score"), ecredit_score);


// Verify3
router.post("/rc_verify", apiAuthMiddleware, usageTracker("rc_verify"), rcVerify);
router.post("/rc_advance", apiAuthMiddleware, usageTracker("rc_advance"), rcAdvanceVerify);
router.post("/reverse_rc", apiAuthMiddleware, usageTracker("reverse_rc"), reverseRCVerify);
router.post("/fssai_verify", apiAuthMiddleware, usageTracker("fssai_verify"), fssaiVerify);
router.post("/iec_verify", apiAuthMiddleware, usageTracker("iec_verify"), iecVerify);
router.post("/email_checker_v1", apiAuthMiddleware, usageTracker("email_checker_v1"), emailCheckerV1);
router.post("/email_checker_v2", apiAuthMiddleware, usageTracker("email_checker_v2"), emailCheckerV2);
router.post("/lei_verify", apiAuthMiddleware, usageTracker("lei_verify"), leiVerify);
router.post("/aadhaar_qr_check", apiAuthMiddleware, usageTracker("aadhaar_qr_check"), upload.single('aadhaar_image'), aadhaarQRCheck);
router.post("/send_epfo_otp", apiAuthMiddleware, usageTracker("send_epfo_otp"), sendEpfoOtp);
router.post("/verify_epfo_otp", apiAuthMiddleware, usageTracker("verify_epfo_otp"), verifyEpfoOtp);
router.post("/epfo_passbook_download", apiAuthMiddleware, usageTracker("epfo_passbook_download"), epfoPassbookDownload);
router.post("/epfo_kyc_fetch", apiAuthMiddleware, usageTracker("epfo_kyc_fetch"), epfoKycFetch);
router.post("/epfo_without_otp", apiAuthMiddleware, usageTracker("epfo_without_otp"), epfoWithoutOtp);

// Verify4
router.post("/ckyc_search", apiAuthMiddleware, usageTracker("ckyc_search"), ckycSearch);
router.post("/ckyc_download", apiAuthMiddleware, usageTracker("ckyc_download"), ckycDownload);
router.post("/liveness_check", apiAuthMiddleware, usageTracker("liveness_check"), upload.single("video_file"), livenessCheck);
router.post("/face_match", apiAuthMiddleware, usageTracker("face_match"), upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }]), faceMatch);
router.post("/upi_verify", apiAuthMiddleware, usageTracker("upi_verify"), upiVerify);
router.post("/challan_info_v1", apiAuthMiddleware, usageTracker("challan_info_v1"), challanInfoV1);
router.post("/challan_info_v2", apiAuthMiddleware, usageTracker("challan_info_v2"), challanInfoV2);
router.post("/ocr_doc_upload", apiAuthMiddleware, usageTracker("ocr_doc_upload"), upload.single("file"), ocrDocUpload);
router.post("/reverse_geocode", apiAuthMiddleware, usageTracker("reverse_geocode"), reverseGeocode);
router.post("/ip_lookup", apiAuthMiddleware, usageTracker("ip_lookup"), ipLookup);
router.post("/mobile_operator", apiAuthMiddleware, usageTracker("mobile_operator"), mobileOperator);
router.post("/court_case_check", apiAuthMiddleware, usageTracker("court_case_check"), courtCaseCheck);
router.post("/company_to_tan", apiAuthMiddleware, usageTracker("company_to_tan"), companyToTan);
router.post("/fuel_price", apiAuthMiddleware, usageTracker("fuel_price"), fuelPrice);
router.post("/pan_to_gst", apiAuthMiddleware, usageTracker("pan_to_gst"), panToGst);
router.post("/stock_price", apiAuthMiddleware, usageTracker("stock_price"), stockPrice);
router.post("/rto_info", apiAuthMiddleware, usageTracker("rto_info"), rtoInfo);
router.post("/name_match", apiAuthMiddleware, usageTracker("name_match"), nameMatch);
router.post("/imei_verification", apiAuthMiddleware, usageTracker("imei_verification"), imeiVerify);

// Verify5
router.post('/card-validator', apiAuthMiddleware, usageTracker("card-validator"), cardValidator);
router.post('/mobile-to-upi', apiAuthMiddleware, usageTracker("mobile-to-upi"), mobileToUpi);
router.post('/director-phone', apiAuthMiddleware, usageTracker("director-phone"), directorPhone);
router.post('/mobile-to-pan', apiAuthMiddleware, usageTracker("mobile-to-pan"), mobileToPan);
router.post('/din-details', apiAuthMiddleware, usageTracker("din-details"), dinDetails);
router.post('/din-to-pan', apiAuthMiddleware, usageTracker("din-to-pan"), dinToPan);
router.post('/vpn-proxy-check', apiAuthMiddleware, usageTracker("vpn-proxy-check"), vpnProxyCheck);
router.post('/pincode-info', apiAuthMiddleware, usageTracker("pincode-info"), pincodeInfo);
router.post('/fetch-personal-profile', apiAuthMiddleware, usageTracker("fetch-personal-profile"), fetchPersonalProfile);
router.post('/ifsc-lookup', apiAuthMiddleware, usageTracker("ifsc-lookup"), ifscLookup);
router.post('/uan-basic-v1', apiAuthMiddleware, usageTracker("uan-basic-v1"), uanBasicV1);
router.post('/uan-basic-v2', apiAuthMiddleware, usageTracker("uan-basic-v2"), uanBasicV2);
router.post('/aadhaar-to-uan', apiAuthMiddleware, usageTracker("aadhaar-to-uan"), aadhaarToUan);
router.post('/fetch-by-pan', apiAuthMiddleware, usageTracker("fetch-by-pan"), fetchByPan);
router.post('/itr-forget-password', apiAuthMiddleware, usageTracker("itr-forget-password"), itrForgetPassword);
router.post('/itr-submit-otp', apiAuthMiddleware, usageTracker("itr-submit-otp"), itrSubmitOtp);
router.post('/get-profile', apiAuthMiddleware, usageTracker("get-profile"), getProfile);
router.post('/itr-list', apiAuthMiddleware, usageTracker("itr-list"), itrList);
router.post('/get-itr', apiAuthMiddleware, usageTracker("get-itr"), getItr);
router.post('/itr_check', apiAuthMiddleware, usageTracker("itr_check"), itr_check);
router.post('/get-26as-list', apiAuthMiddleware, usageTracker("get-26as-list"), get26asList);
router.post('/get-26as', apiAuthMiddleware, usageTracker("get-26as"), get26as);

// Verify6
router.post("/pan_verify", apiAuthMiddleware, usageTracker("pan_verify"), verifyController.panVerify);
router.post("/pandetails_verify", apiAuthMiddleware, usageTracker("pandetails_verify"), verifyController.panDetailsVerify);
router.post("/company_name_to_cin", apiAuthMiddleware, usageTracker("company_name_to_cin"), verifyController.companyToCin);
router.post("/send_telecom_otp", apiAuthMiddleware, usageTracker("send_telecom_otp"), verifyController.sendTelecomOtp);
router.post("/verify_telecom_otp", apiAuthMiddleware, usageTracker("verify_telecom_otp"), verifyController.verifyTelecomOtp);
router.post("/crime_check_individual", apiAuthMiddleware, usageTracker("crime_check_individual"), verifyController.crimeCheckIndividual);
router.post("/crime_check_company", apiAuthMiddleware, usageTracker("crime_check_company"), verifyController.crimeCheckCompany);
router.post("/crime_report_download_pdf", apiAuthMiddleware, usageTracker("crime_report_download_pdf"), verifyController.crimeReportPdf);
router.post("/crime_report_download_json", apiAuthMiddleware, usageTracker("crime_report_download_json"), verifyController.crimeReportJson);
router.post("/digilocker/initiate_session", apiAuthMiddleware, usageTracker("digilocker/initiate_session"), verifyController.digilockerInitSession);
router.post("/digilocker/access_token", apiAuthMiddleware, usageTracker("digilocker/access_token"), verifyController.digilockerToken);
router.post("/digilocker/issued_files", apiAuthMiddleware, usageTracker("digilocker/issued_files"), verifyController.digilockerIssuedFiles);
router.post("/digilocker/download_pdf", apiAuthMiddleware, usageTracker("digilocker/download_pdf"), verifyController.digilockerDownloadPdf);
router.post("/digilocker/download_xml", apiAuthMiddleware, usageTracker("digilocker/download_xml"), verifyController.digilockerDownloadXml);
router.post("/digilocker/eaadhaar", apiAuthMiddleware, usageTracker("digilocker/eaadhaar"), verifyController.digilockerEaadhaarXml);

module.exports = router;