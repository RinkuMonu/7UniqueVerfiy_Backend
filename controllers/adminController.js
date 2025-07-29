
const User = require('../models/User');
const Service = require('../models/Service');
const Wallet = require('../models/Wallet');
const crypto = require('crypto');
const bcrypt = require('bcryptjs/dist/bcrypt');

const createUser = async (req, res) => {
  try {
    console.log("Creating user...");

    const { name, email, password, role, ipWhitelist = [] } = req.body;



    // Validation check
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const jwtSecret = crypto.randomBytes(32).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate authKey with Seven### format
    const userCount = await User.countDocuments();
    const paddedNumber = String(userCount + 1).padStart(3, '0'); // "001", "002", etc.
    const authKey = `Seven${paddedNumber}`;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      credentials: {
        jwtSecret,
        authKey,
        ipWhitelist,
        isActive: true
      }
    });

    res.status(201).json({ message: 'User created', user });
  } catch (err) {
    console.error("User creation error:", err);
    res.status(400).json({ message: 'Error creating user', error: err.message });
  }
};
const updateUser = async (req, res) => {
  try {
    const { name, email, password, role, ipWhitelist = [], userId, isVerified } = req.body;

    // Validate input
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;


    if (!user.documents) {
      user.documents = {};
    }
    user.documents.isVerified = isVerified;


    // if (password) {
    //   user.password = await bcrypt.hash(password, 10);
    // }

    // if (ipWhitelist && Array.isArray(ipWhitelist)) {
    //   user.credentials.ipWhitelist = ipWhitelist;
    // }

    await user.save();

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (err) {
    console.error("User update error:", err);
    res.status(500).json({ message: 'Error updating user', error: err.message });
  }
};


const addService = async (req, res) => {
  try {
    const { name, charge, descreption, active_charge, endpoint, method, fields } = req.body.services;

    // Check for existing service
    const existing = await Service.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Service already exists' });
    }

    // Create new service
    const service = await Service.create({
      name,
      charge,
      descreption,
      active_charge,
      endpoint,
      method: method || "POST",
      fields: fields || []
    });

    res.status(201).json({ message: 'Service created successfully', service });
  } catch (err) {
    res.status(500).json({ message: 'Error adding service', error: err.message });
  }
};


const parchaseService = async (req, res) => {
  try {
    const { userId, serviceId } = req.body;

    if (!serviceId) {
      return res.status(400).json({ message: 'Service ID is required' });
    }

    // Get service details
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if service already purchased
    const alreadyPurchased = user.services.includes(serviceId);
    if (alreadyPurchased) {
      return res.status(400).json({ message: 'Service already purchased' });
    }

    // // Check wallet balance
    // if (user.wallet.mode.production < service.active_charge) {
    //   return res.status(400).json({ message: 'Insufficient wallet balance' });
    // }

    // Deduct from wallet
    // user.wallet.mode.production -= service.active_charge;

    // Add service to user's purchased services
    user.services.push(serviceId);
    await user.save();

    // Log the purchase
    await ServicePurchase.create({
      userId,
      serviceId,
      status: true,
    });

    res.status(200).json({ message: 'Service purchased successfully' });

  } catch (error) {
    res.status(500).json({
      message: 'Failed to purchase service',
      error: error.message,
    });
  }
};


const apirequests = async (req, res) => {

  const { search, status } = req.query;
  const filter = {};

  if (status) filter.status = status;

  const searchFilter = search ? new RegExp(search, "i") : null;

  try {
    const apirequestss = await ApiPurchaseRequest.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $lookup: {
          from: "services",
          localField: "serviceId",
          foreignField: "_id",
          as: "service",
        },
      },
      {
        $unwind: "$service",
      },
      {
        $match: {
          ...filter,
          ...(searchFilter && {
            $or: [
              { "user.name": searchFilter },
              { "service.name": searchFilter },
            ],
          }),
        },
      },
      {
        $sort: { requestedAt: -1 },
      },
    ])
    res.status(200).json(apirequestss);
  } catch (err) {
    res.status(400).json({ message: 'Error purchase services', error: err.message });
  }
}


const updateApirequests = async (req, res) => {
  try {

    const { id, userID, serviceId, } = req.body;
    const { status, customCharge } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }
    // Get user
    const user = await User.findById(userID);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const env = user.documents.isVerified ? 'production' : 'credentials'
    // Check wallet balance
    if (user.wallet.mode.env < service.active_charge) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    // Deduct from wallet
    if (status == 'approved') {
      user.wallet.mode.production -= service.active_charge;
      // Add service to user's purchased services
      user.services.push(serviceId);
      await user.save();

      // Log the purchase
      await ServicePurchase.create({
        userId: userID,
        serviceId: serviceId,
        status: true,
      });
    }


    const updatedRequest = await ApiPurchaseRequest.findByIdAndUpdate(
      id,
      {
        status,
        updatedAt: new Date(),
      },
      { new: true }
    )
      .populate("userId", "name")
      .populate("serviceId", "name");

    if (!updatedRequest) {
      return res.status(404).json({ message: "API Request not found." });
    }

    res.status(200).json({
      message: "API Request updated successfully.",
      data: updatedRequest,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating API request status.",
      error: error.message,
    });
  }
};




const assignServices = async (req, res) => {
  try {
    const { userId, services, customCharge } = req.body;

    const user = await User.findOne({ _id: userId });

    const newServices = services.filter(serviceId => !user.services.includes(serviceId));

    if (customCharge && customCharge.length > 0) {

      const updatedCharges = [...user.customServiceCharges];

      customCharge.forEach(charge => {
        const index = updatedCharges.findIndex(c => c.service.toString() === charge.service);
        if (index !== -1) {
          updatedCharges[index].customCharge = charge.customCharge;
        } else {
          updatedCharges.push({
            service: charge.service,
            customCharge: charge.customCharge,
          });
        }
      });

      user.customServiceCharges = updatedCharges;
      user.services = [...user.services, ...newServices];
    }

    await user.save();
    res.json({ message: 'Services assigned successfully', services: user.services });

  } catch (err) {
    res.status(400).json({ message: 'Error assigning services', error: err.message });
  }
};




const assignAllServicesToUser = async (req, res) => {
  try {
    const { userId } = req.body;

    // 1. Find all service IDs
    const allServices = await Service.find({}, "_id");
    const serviceIds = allServices.map(service => service._id);

    // 2. Assign to user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.services = serviceIds;
    await user.save();

    res.json({ message: "All services assigned to user", serviceCount: serviceIds.length });
  } catch (err) {
    console.error("Assign error:", err);
    res.status(400).json({ message: "Error assigning services", error: err.message });
  }
};


// const addMultipleServices = async () => {
//   try {
//     const servicesToAdd = [
//       {
//         name: "bankVerify",
//         charge: 2,
//         descreption: "bankVerify",
//         active_charge: 2,
//         endpoint: "bankVerify",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Account Number",
//             name: "account_number",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Ifsc Code",
//             name: "ifsc_code",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "bankVerify/v2",
//         charge: 2,
//         descreption: "bankVerify/v2",
//         active_charge: 2,
//         endpoint: "bankVerify/v2",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Account Number",
//             name: "account_number",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Ifsc Code",
//             name: "ifsc_code",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "bankVerify/hybrid/v3",
//         charge: 2,
//         descreption: "bankVerify/hybrid/v3",
//         active_charge: 2,
//         endpoint: "bankVerify/hybrid/v3",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Account Number",
//             name: "account_number",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Ifsc Code",
//             name: "ifsc_code",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "bankVerify/pennyless",
//         charge: 2,
//         descreption: "bankVerify/pennyless",
//         active_charge: 2,
//         endpoint: "bankVerify/pennyless",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Account Number",
//             name: "account_number",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Ifsc Code",
//             name: "ifsc_code",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "bankVerify/pennyless/v3",
//         charge: 2,
//         descreption: "bankVerify/pennyless/v3",
//         active_charge: 2,
//         endpoint: "bankVerify/pennyless/v3",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Account Number",
//             name: "account_number",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Ifsc Code",
//             name: "ifsc_code",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "bankVerify/pennydrop/v1",
//         charge: 2,
//         descreption: "bankVerify/pennydrop/v1",
//         active_charge: 2,
//         endpoint: "bankVerify/pennydrop/v1",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Account Number",
//             name: "account_number",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Ifsc Code",
//             name: "ifsc_code",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Extended Data",
//             name: "extended_data",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "bankVerify/pennydrop/v2",
//         charge: 2,
//         descreption: "bankVerify/pennydrop/v2",
//         active_charge: 2,
//         endpoint: "bankVerify/pennydrop/v2",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Account Number",
//             name: "account_number",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Ifsc Code",
//             name: "ifsc_code",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Extended Data",
//             name: "extended_data",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "adhar/verify",
//         charge: 2,
//         descreption: "adhar/verify",
//         active_charge: 2,
//         endpoint: "adhar/verify",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Id Number",
//             name: "id_number",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "adhar/send/otp",
//         charge: 2,
//         descreption: "adhar/send/otp",
//         active_charge: 2,
//         endpoint: "adhar/send/otp",
//         method: "POST",
//         fields: [
//           {
//             label: "Id Number",
//             name: "id_number",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "adhar/verify/otp",
//         charge: 2,
//         descreption: "adhar/verify/otp",
//         active_charge: 2,
//         endpoint: "adhar/verify/otp",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Client Id",
//             name: "client_id",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Otp",
//             name: "otp",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "voterid",
//         charge: 2,
//         descreption: "voterid",
//         active_charge: 2,
//         endpoint: "voterid",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Id Number",
//             name: "id_number",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "license/v1",
//         charge: 2,
//         descreption: "license/v1",
//         active_charge: 2,
//         endpoint: "license/v1",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Id Number",
//             name: "id_number",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Dob",
//             name: "dob",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "license/v2",
//         charge: 2,
//         descreption: "license/v2",
//         active_charge: 2,
//         endpoint: "license/v2",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Driving Licence",
//             name: "driving_licence",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Dob",
//             name: "dob",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "gstvalidate",
//         charge: 2,
//         descreption: "gstvalidate",
//         active_charge: 2,
//         endpoint: "gstvalidate",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Id Number",
//             name: "id_number",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Filing Status",
//             name: "filing_status",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "passport",
//         charge: 2,
//         descreption: "passport",
//         active_charge: 2,
//         endpoint: "passport",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Driving Licence",
//             name: "driving_licence",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Dob",
//             name: "dob",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "rc_verify",
//         charge: 2,
//         descreption: "rc_verify",
//         active_charge: 2,
//         endpoint: "rc_verify",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Id Number",
//             name: "id_number",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "rc_advance",
//         charge: 2,
//         descreption: "rc_advance",
//         active_charge: 2,
//         endpoint: "rc_advance",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Rc Number",
//             name: "rc_number",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "reverse_rc",
//         charge: 2,
//         descreption: "reverse_rc",
//         active_charge: 2,
//         endpoint: "reverse_rc",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Chassis Number",
//             name: "chassis_number",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "fssai_verify",
//         charge: 2,
//         descreption: "fssai_verify",
//         active_charge: 2,
//         endpoint: "fssai_verify",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Fssai Number",
//             name: "fssai_number",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "iec_verify",
//         charge: 2,
//         descreption: "iec_verify",
//         active_charge: 2,
//         endpoint: "iec_verify",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Iec Number",
//             name: "iec_number",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "email_checker_v1",
//         charge: 2,
//         descreption: "email_checker_v1",
//         active_charge: 2,
//         endpoint: "email_checker_v1",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Email",
//             name: "email",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "email_checker_v2",
//         charge: 2,
//         descreption: "email_checker_v2",
//         active_charge: 2,
//         endpoint: "email_checker_v2",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Email",
//             name: "email",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "lei_verify",
//         charge: 2,
//         descreption: "lei_verify",
//         active_charge: 2,
//         endpoint: "lei_verify",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Id Number",
//             name: "id_number",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "aadhaar_qr_check",
//         charge: 2,
//         descreption: "aadhaar_qr_check",
//         active_charge: 2,
//         endpoint: "aadhaar_qr_check",
//         method: "POST",
//         fields: [
//           {
//             label: "Aadhaar Image",
//             name: "aadhaar_image",
//             type: "file",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "send_epfo_otp",
//         charge: 2,
//         descreption: "send_epfo_otp",
//         active_charge: 2,
//         endpoint: "send_epfo_otp",
//         method: "POST",
//         fields: [
//           {
//             label: "Epfo Number",
//             name: "epfo_number",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "verify_epfo_otp",
//         charge: 2,
//         descreption: "verify_epfo_otp",
//         active_charge: 2,
//         endpoint: "verify_epfo_otp",
//         method: "POST",
//         fields: [
//           {
//             label: "Client Id",
//             name: "client_id",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Otp",
//             name: "otp",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "epfo_passbook_download",
//         charge: 2,
//         descreption: "epfo_passbook_download",
//         active_charge: 2,
//         endpoint: "epfo_passbook_download",
//         method: "POST",
//         fields: [
//           {
//             label: "Client Id",
//             name: "client_id",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "epfo_kyc_fetch",
//         charge: 2,
//         descreption: "epfo_kyc_fetch",
//         active_charge: 2,
//         endpoint: "epfo_kyc_fetch",
//         method: "POST",
//         fields: [
//           {
//             label: "Client Id",
//             name: "client_id",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "epfo_without_otp",
//         charge: 2,
//         descreption: "epfo_without_otp",
//         active_charge: 2,
//         endpoint: "epfo_without_otp",
//         method: "POST",
//         fields: [
//           {
//             label: "Uan Number",
//             name: "uan_number",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "ckyc_search",
//         charge: 2,
//         descreption: "ckyc_search",
//         active_charge: 2,
//         endpoint: "ckyc_search",
//         method: "POST",
//         fields: [
//           {
//             label: "Document Type",
//             name: "document_type",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Id Number",
//             name: "id_number",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "ckyc_download",
//         charge: 2,
//         descreption: "ckyc_download",
//         active_charge: 2,
//         endpoint: "ckyc_download",
//         method: "POST",
//         fields: [
//           {
//             label: "Auth Factor Type",
//             name: "auth_factor_type",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Auth Factor",
//             name: "auth_factor",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Client Id",
//             name: "client_id",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "liveness_check",
//         charge: 2,
//         descreption: "liveness_check",
//         active_charge: 2,
//         endpoint: "liveness_check",
//         method: "POST",
//         fields: [
//           {
//             label: "Video Url",
//             name: "video_url",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "face_match",
//         charge: 2,
//         descreption: "face_match",
//         active_charge: 2,
//         endpoint: "face_match",
//         method: "POST",
//         fields: [
//         ]
//       },
//       {
//         name: "upi_verify",
//         charge: 2,
//         descreption: "upi_verify",
//         active_charge: 2,
//         endpoint: "upi_verify",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Id Number",
//             name: "id_number",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "challan_info_v1",
//         charge: 2,
//         descreption: "challan_info_v1",
//         active_charge: 2,
//         endpoint: "challan_info_v1",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Vehicle Id",
//             name: "vehicle_id",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Chassis",
//             name: "chassis",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "challan_info_v2",
//         charge: 2,
//         descreption: "challan_info_v2",
//         active_charge: 2,
//         endpoint: "challan_info_v2",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Rc Number",
//             name: "rc_number",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Chassis Number",
//             name: "chassis_number",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Engine Number",
//             name: "engine_number",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "ocr_doc_upload",
//         charge: 2,
//         descreption: "ocr_doc_upload",
//         active_charge: 2,
//         endpoint: "ocr_doc_upload",
//         method: "POST",
//         fields: [
//           {
//             label: "Type",
//             name: "type",
//             type: "text",
//             required: true
//           },
//           {
//             label: "File",
//             name: "file",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Link",
//             name: "link",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Back",
//             name: "back",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "reverse_geocode",
//         charge: 2,
//         descreption: "reverse_geocode",
//         active_charge: 2,
//         endpoint: "reverse_geocode",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Latitude",
//             name: "latitude",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Longitude",
//             name: "longitude",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "ip_lookup",
//         charge: 2,
//         descreption: "ip_lookup",
//         active_charge: 2,
//         endpoint: "ip_lookup",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Ip Address",
//             name: "ip_address",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "mobile_operator",
//         charge: 2,
//         descreption: "mobile_operator",
//         active_charge: 2,
//         endpoint: "mobile_operator",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Mobile",
//             name: "mobile",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "court_case_check",
//         charge: 2,
//         descreption: "court_case_check",
//         active_charge: 2,
//         endpoint: "court_case_check",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Name",
//             name: "name",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Father Name",
//             name: "father_name",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Address",
//             name: "address",
//             type: "text",
//             required: true
//           },
//           {
//             label: "State Name",
//             name: "state_name",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Year",
//             name: "year",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Source",
//             name: "source",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Case Type",
//             name: "case_type",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Search Type",
//             name: "search_type",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Filters",
//             name: "filters",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Category",
//             name: "category",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "company_to_tan",
//         charge: 2,
//         descreption: "company_to_tan",
//         active_charge: 2,
//         endpoint: "company_to_tan",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Company Name",
//             name: "company_name",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "fuel_price",
//         charge: 2,
//         descreption: "fuel_price",
//         active_charge: 2,
//         endpoint: "fuel_price",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Citystate",
//             name: "citystate",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "pan_to_gst",
//         charge: 2,
//         descreption: "pan_to_gst",
//         active_charge: 2,
//         endpoint: "pan_to_gst",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Pan Number",
//             name: "pan_number",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "stock_price",
//         charge: 2,
//         descreption: "stock_price",
//         active_charge: 2,
//         endpoint: "stock_price",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Company",
//             name: "company",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "rto_info",
//         charge: 2,
//         descreption: "rto_info",
//         active_charge: 2,
//         endpoint: "rto_info",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Rto Code",
//             name: "rto_code",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "name_match",
//         charge: 2,
//         descreption: "name_match",
//         active_charge: 2,
//         endpoint: "name_match",
//         method: "POST",
//         fields: [
//           {
//             label: "Name 1",
//             name: "name_1",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Name 2",
//             name: "name_2",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "imei_verification",
//         charge: 2,
//         descreption: "imei_verification",
//         active_charge: 2,
//         endpoint: "imei_verification",
//         method: "POST",
//         fields: [
//           {
//             label: "Imei No",
//             name: "imei_no",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "card-validator",
//         charge: 2,
//         descreption: "card-validator",
//         active_charge: 2,
//         endpoint: "card-validator",
//         method: "POST",
//         fields: [
//           {
//             label: "Card Num",
//             name: "card_num",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "mobile-to-upi",
//         charge: 2,
//         descreption: "mobile-to-upi",
//         active_charge: 2,
//         endpoint: "mobile-to-upi",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Mobile",
//             name: "mobile",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "director-phone",
//         charge: 2,
//         descreption: "director-phone",
//         active_charge: 2,
//         endpoint: "director-phone",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Din Number",
//             name: "din_number",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "mobile-to-pan",
//         charge: 2,
//         descreption: "mobile-to-pan",
//         active_charge: 2,
//         endpoint: "mobile-to-pan",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Moblie",
//             name: "moblie",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Name",
//             name: "name",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "din-details",
//         charge: 2,
//         descreption: "din-details",
//         active_charge: 2,
//         endpoint: "din-details",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Din Number",
//             name: "din_number",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "din-to-pan",
//         charge: 2,
//         descreption: "din-to-pan",
//         active_charge: 2,
//         endpoint: "din-to-pan",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Din Number",
//             name: "din_number",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "vpn-proxy-check",
//         charge: 2,
//         descreption: "vpn-proxy-check",
//         active_charge: 2,
//         endpoint: "vpn-proxy-check",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Ip Address",
//             name: "ip_address",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "pincode-info",
//         charge: 2,
//         descreption: "pincode-info",
//         active_charge: 2,
//         endpoint: "pincode-info",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Pincode",
//             name: "pincode",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "fetch-personal-profile",
//         charge: 2,
//         descreption: "fetch-personal-profile",
//         active_charge: 2,
//         endpoint: "fetch-personal-profile",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Phone",
//             name: "phone",
//             type: "text",
//             required: true
//           },
//           {
//             label: "First Name",
//             name: "first_name",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Last Name",
//             name: "last_name",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Pan",
//             name: "pan",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "ifsc-lookup",
//         charge: 2,
//         descreption: "ifsc-lookup",
//         active_charge: 2,
//         endpoint: "ifsc-lookup",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Ifsc",
//             name: "ifsc",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "uan-basic-v1",
//         charge: 2,
//         descreption: "uan-basic-v1",
//         active_charge: 2,
//         endpoint: "uan-basic-v1",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Employee Name",
//             name: "employee_name",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Employer Name",
//             name: "employer_name",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Type",
//             name: "type",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Mobile",
//             name: "mobile",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Pan Number",
//             name: "pan_number",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "uan-basic-v2",
//         charge: 2,
//         descreption: "uan-basic-v2",
//         active_charge: 2,
//         endpoint: "uan-basic-v2",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Type",
//             name: "type",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Method",
//             name: "method",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Mobile",
//             name: "mobile",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Employee Name",
//             name: "employee_name",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Dob",
//             name: "dob",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "aadhaar-to-uan",
//         charge: 2,
//         descreption: "aadhaar-to-uan",
//         active_charge: 2,
//         endpoint: "aadhaar-to-uan",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Aadhaar Number",
//             name: "aadhaar_number",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "fetch-by-pan",
//         charge: 2,
//         descreption: "fetch-by-pan",
//         active_charge: 2,
//         endpoint: "fetch-by-pan",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Type",
//             name: "type",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Pan Number",
//             name: "pan_number",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Mobile",
//             name: "mobile",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Dob",
//             name: "dob",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Employee Name",
//             name: "employee_name",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Employer Name",
//             name: "employer_name",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "itr-forget-password",
//         charge: 2,
//         descreption: "itr-forget-password",
//         active_charge: 2,
//         endpoint: "itr-forget-password",
//         method: "POST",
//         fields: [
//           {
//             label: "Client Id",
//             name: "client_id",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Password",
//             name: "password",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "itr-submit-otp",
//         charge: 2,
//         descreption: "itr-submit-otp",
//         active_charge: 2,
//         endpoint: "itr-submit-otp",
//         method: "POST",
//         fields: [
//           {
//             label: "Client Id",
//             name: "client_id",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Otp",
//             name: "otp",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "get-profile",
//         charge: 2,
//         descreption: "get-profile",
//         active_charge: 2,
//         endpoint: "get-profile",
//         method: "POST",
//         fields: [
//           {
//             label: "Client Id",
//             name: "client_id",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "itr-list",
//         charge: 2,
//         descreption: "itr-list",
//         active_charge: 2,
//         endpoint: "itr-list",
//         method: "POST",
//         fields: [
//           {
//             label: "Client Id",
//             name: "client_id",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "get-itr",
//         charge: 2,
//         descreption: "get-itr",
//         active_charge: 2,
//         endpoint: "get-itr",
//         method: "POST",
//         fields: [
//           {
//             label: "Client Id",
//             name: "client_id",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Itr Id",
//             name: "itr_id",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "get-26as-list",
//         charge: 2,
//         descreption: "get-26as-list",
//         active_charge: 2,
//         endpoint: "get-26as-list",
//         method: "POST",
//         fields: [
//           {
//             label: "Client Id",
//             name: "client_id",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "get-26as",
//         charge: 2,
//         descreption: "get-26as",
//         active_charge: 2,
//         endpoint: "get-26as",
//         method: "POST",
//         fields: [
//           {
//             label: "Client Id",
//             name: "client_id",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Tds Id",
//             name: "tds_id",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "pan_verify",
//         charge: 2,
//         descreption: "pan_verify",
//         active_charge: 2,
//         endpoint: "pan_verify",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Pannumber",
//             name: "pannumber",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "pandetails_verify",
//         charge: 2,
//         descreption: "pandetails_verify",
//         active_charge: 2,
//         endpoint: "pandetails_verify",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Id Number",
//             name: "id_number",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "company_name_to_cin",
//         charge: 2,
//         descreption: "company_name_to_cin",
//         active_charge: 2,
//         endpoint: "company_name_to_cin",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Company Name",
//             name: "company_name",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "send_telecom_otp",
//         charge: 2,
//         descreption: "send_telecom_otp",
//         active_charge: 2,
//         endpoint: "send_telecom_otp",
//         method: "POST",
//         fields: [
//           {
//             label: "Id Numberid Number",
//             name: "id_numberid_number",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "verify_telecom_otp",
//         charge: 2,
//         descreption: "verify_telecom_otp",
//         active_charge: 2,
//         endpoint: "verify_telecom_otp",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Client Id",
//             name: "client_id",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Otp",
//             name: "otp",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "crime_check_individual",
//         charge: 2,
//         descreption: "crime_check_individual",
//         active_charge: 2,
//         endpoint: "crime_check_individual",
//         method: "POST",
//         fields: [
//           {
//             label: "Name",
//             name: "name",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Father Name",
//             name: "father_name",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Address",
//             name: "address",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Dob",
//             name: "dob",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Pan Number",
//             name: "pan_number",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Report Mode",
//             name: "report_mode",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Req Tag",
//             name: "req_tag",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Ticket Size",
//             name: "ticket_size",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Crimewatch",
//             name: "crimewatch",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "crime_check_company",
//         charge: 2,
//         descreption: "crime_check_company",
//         active_charge: 2,
//         endpoint: "crime_check_company",
//         method: "POST",
//         fields: [
//           {
//             label: "Company Name",
//             name: "company_name",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Company Type",
//             name: "company_type",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Company Address",
//             name: "company_address",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Directors",
//             name: "directors",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Report Mode",
//             name: "report_mode",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Cin Number",
//             name: "cin_number",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Gst Number",
//             name: "gst_number",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Req Tag",
//             name: "req_tag",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Ticket Size",
//             name: "ticket_size",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Crime Watch",
//             name: "crime_watch",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "crime_report_download_pdf",
//         charge: 2,
//         descreption: "crime_report_download_pdf",
//         active_charge: 2,
//         endpoint: "crime_report_download_pdf",
//         method: "POST",
//         fields: [
//           {
//             label: "Request Id",
//             name: "request_id",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "crime_report_download_json",
//         charge: 2,
//         descreption: "crime_report_download_json",
//         active_charge: 2,
//         endpoint: "crime_report_download_json",
//         method: "POST",
//         fields: [
//           {
//             label: "Redirect Url",
//             name: "redirect_url",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "digilocker/initiate_session",
//         charge: 2,
//         descreption: "digilocker/initiate_session",
//         active_charge: 2,
//         endpoint: "digilocker/initiate_session",
//         method: "POST",
//         fields: [
//           {
//             label: "Redirect Url",
//             name: "redirect_url",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "digilocker/access_token",
//         charge: 2,
//         descreption: "digilocker/access_token",
//         active_charge: 2,
//         endpoint: "digilocker/access_token",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "digilocker/issued_files",
//         charge: 2,
//         descreption: "digilocker/issued_files",
//         active_charge: 2,
//         endpoint: "digilocker/issued_files",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "digilocker/download_pdf",
//         charge: 2,
//         descreption: "digilocker/download_pdf",
//         active_charge: 2,
//         endpoint: "digilocker/download_pdf",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Uri",
//             name: "uri",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "digilocker/download_xml",
//         charge: 2,
//         descreption: "digilocker/download_xml",
//         active_charge: 2,
//         endpoint: "digilocker/download_xml",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//           {
//             label: "Uri",
//             name: "uri",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//       {
//         name: "digilocker/eaadhaar",
//         charge: 2,
//         descreption: "digilocker/eaadhaar",
//         active_charge: 2,
//         endpoint: "digilocker/eaadhaar",
//         method: "POST",
//         fields: [
//           {
//             label: "Refid",
//             name: "refid",
//             type: "text",
//             required: true
//           },
//         ]
//       },
//     ];

//     const existing = await Service.find({ name: { $in: servicesToAdd.map(s => s.name) } });
//     const existingNames = existing.map(s => s.name);

//     const toInsert = servicesToAdd
//       .filter(s => !existingNames.includes(s.name))
//       .map(s => ({
//         name: s.name,
//         charge: s.charge,
//         descreption: s.name,          // same as name, or customize if needed
//         active_charge: s.charge       // duplicate of charge for now
//       }));

//     if (toInsert.length === 0) {
//       // return res.status(200).json({ message: "All services already exist" });
//     }

//     const result = await Service.insertMany(toInsert);
//     // res.status(201).json({ message: "Services added", count: result.length, services: result });
//   } catch (err) {
//     console.error("Error adding services:", err);
//     // res.status(500).json({ message: "Internal server error", error: err.message });
//   }
// };





// Update service charges


const updateServiceCharge = async (req, res) => {
  try {
    const { editId } = req.params;
    const { name, charge, descreption, active_charge, endpoint, method, fields } = req.body;
    const service = await Service.findOneAndUpdate({ _id: editId }, { name, charge, active_charge, descreption, endpoint, method, fields }, { new: true, upsert: true });
    res.json({ message: 'Service charge updated', service });
  } catch (err) {
    res.status(400).json({ message: 'Error updating charge', error: err.message });
  }
};
// Get all available services
const getAllServices = async (req, res) => {

  try {
    const {
      search = "",
      method = "",
      minCharge,
      maxCharge,
      activeOnly,
      page = 1,
      limit = '',
    } = req.query;

    const query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (method) {
      query.method = method;
    }

    if (activeOnly === "true") {
      query.active_charge = { $gt: 0 };
    }

    if (minCharge || maxCharge) {
      query.charge = {};
      if (minCharge) query.charge.$gte = Number(minCharge);
      if (maxCharge) query.charge.$lte = Number(maxCharge);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [services, total] = await Promise.all([
      Service.find(query).sort({ name: 1 }).skip(skip).limit(Number(limit)),
      Service.countDocuments(query),
    ]);

    res.json({
      services,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch services", error: err.message });
  }
};




const productionKey = async (req, res) => {
  try {
    const services = await Service.find().sort({ name: 1 }); // sorted A-Z
    res.json({ services });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch services', error: err.message });
  }
};

module.exports.getAllServices = getAllServices;

const getAllUsers = async (req, res) => {
  try {
    const {
      userId,
      role,
      isVerified,
      email,
      fromDate,
      toDate,
      page = 1,
      limit = 10,
      sort = 'desc'
    } = req.query;

    const query = {};

    if (userId) {
      if (mongoose.Types.ObjectId.isValid(userId)) {
        query._id = new mongoose.Types.ObjectId(userId);
      } else {
        return res.status(400).json({ message: "Invalid userId format" });
      }
    }

    // Role filter
    if (role) {
      query.role = role;
    }

    // Verification status filter
    if (isVerified !== undefined && isVerified !== '') {
      query['documents.isVerified'] = isVerified === 'true' ? true : false;
    }

    // Email partial match filter
    if (email) {
      query.email = { $regex: email, $options: 'i' };
    }

    // Date range filter
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) {
        query.createdAt.$gte = new Date(fromDate);
      }
      if (toDate) {
        query.createdAt.$lte = new Date(toDate);
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .select('-password') // exclude password field
      .sort({ createdAt: sort === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      message: "Error fetching users",
      error: error.message,
    });
  }
};


const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('services') // To fetch full service details
      .lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// Get usage report of all users
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');
const { default: mongoose } = require('mongoose');
const ApiPurchaseRequest = require('../models/ApiPurchaseRequest');
const ServicePurchase = require('../models/ServicePurchase');


const getServiceReport = async (req, res) => {
  try {
    const { search = "", service = "", page = 1, limit = 10, export: exportType } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    if (service) {
      const safeService = service.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter["serviceUsage.service"] = { $regex: safeService, $options: "i" };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
      .select("name email serviceUsage")
      .skip(exportType ? 0 : skip)
      .limit(exportType ? 10000 : parseInt(limit)) // Max 10,000 for export
      .sort({ createdAt: -1 });

    // Handle CSV/Excel export
    if (exportType === 'csv' || exportType === 'excel') {
      const data = [];

      users.forEach(user => {
        user.serviceUsage.forEach(usage => {
          if (!service || usage.service === service) {
            data.push({
              Name: user.name,
              Email: user.email,
              Service: usage.service,
              HitCount: usage.hitCount,
              TotalCharge: usage.totalCharge,
            });
          }
        });
      });

      if (exportType === 'csv') {
        const parser = new Parser();
        const csv = parser.parse(data);

        res.header('Content-Type', 'text/csv');
        res.attachment('usage-report.csv');
        return res.send(csv);
      }

      if (exportType === 'excel') {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Usage Report');

        worksheet.columns = [
          { header: 'Name', key: 'Name', width: 20 },
          { header: 'Email', key: 'Email', width: 25 },
          { header: 'Service', key: 'Service', width: 20 },
          { header: 'Hit Count', key: 'HitCount', width: 10 },
          { header: 'Total Charge', key: 'TotalCharge', width: 15 },
        ];

        worksheet.addRows(data);

        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
          'Content-Disposition',
          'attachment; filename=usage-report.xlsx'
        );

        return workbook.xlsx.write(res).then(() => res.end());
      }
    }

    // Default paginated response (no export)
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      users,
      totalUsers,
      totalPages,
      currentPage: parseInt(page),
    });

  } catch (err) {
    console.error("Service report error:", err);
    res.status(500).json({ message: "Error fetching report", error: err.message });
  }
};

const getKycRequestedUsers = async (req, res) => {
  try {
    const {
      search = '',                // Search by name/email
      role,                      // Filter by role (admin/user)
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { 'documents.kycRequest': true };

    // Text search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Role filter
    if (role) {
      query.role = role;
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const users = await User.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      data: users,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch KYC requests', error: err.message });
  }
};


const verifyKYC = async (req, res) => {
  try {
    const { userId, isVerified, ipWhitelist = [] } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate jwtSecret
    const jwtSecret = crypto.randomBytes(32).toString('hex');

    // Generate Seven### formatted authKey
    const userCount = await User.countDocuments();
    const paddedNumber = String(userCount + 1).padStart(3, '0');
    const authKey = user.credentials.authKey;

    // Update document and production info
    user.documents.isVerified = isVerified;
    user.documents.kycRequest = false;

    user.production = {
      jwtSecret,
      authKey,
      ipWhitelist,
      isActive: true
    };

    await user.save();

    res.json({
      message: 'KYC approved and production credentials set.',
      production: user.production
    });
  } catch (err) {
    res.status(500).json({ message: 'Approval failed', error: err.message });
  }
};





// Admin adds money manually to a user's wallet
const adminWalletTopup = async (req, res) => {
  try {
    const { userId, mode, amount, description } = req.body;

    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) {
      return res.status(400).json({ message: 'Invalid amount provided' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: 'user not found' });
    }
    if (!mode) {
      return res.status(400).json({ message: 'Invalid wallet mode' });
    }
    user.wallet.mode[mode] += numericAmount

    await user.save();

    await Wallet.create({
      userId: userId,
      mode: mode,
      type: 'credit',
      amount: numericAmount,
      description: description || 'Admin Top-Up',
      referenceId: 'ADMIN-' + Date.now()
    });

    res.json({ message: `${mode} Wallet credited by admin` });
  } catch (err) {
    res.status(500).json({ message: 'Admin top-up failed', error: err.message });
  }
};


// View user wallet ledger by userId


const getUserLedger = async (req, res) => {
  try {
    const { userId } = req.params;

    const {
      mode,
      fromDate,
      toDate,
      page = 1,
      limit = 10,
      sort = 'desc',
      export: exportType // 'csv' or 'excel'
    } = req.query;

    const {
      type,
      minAmount,
      maxAmount
    } = req.query;

    const modeData = mode === 'true' ? 'production' : 'credentials';

    const query = { userId, mode: modeData };

    if (type) query.type = type;

    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = Number(minAmount);
      if (maxAmount) query.amount.$lte = Number(maxAmount);
    }

    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(new Date(fromDate).setHours(0, 0, 0, 0));
      if (toDate) query.createdAt.$lte = new Date(new Date(toDate).setHours(23, 59, 59, 999));
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOption = { createdAt: sort === 'asc' ? 1 : -1 };

    const records = await Wallet.find(query)
      .sort(sortOption)
      .skip(exportType ? 0 : skip)
      .limit(exportType ? 10000 : parseInt(limit));

    if (exportType === 'csv' || exportType === 'excel') {
      const exportData = records.map((entry) => ({
        Type: entry.type,
        Mode: entry.mode,
        Amount: entry.amount,
        Description: entry.description,
        ReferenceID: entry.referenceId,
        Date: entry.createdAt.toISOString(),
      }));

      if (exportType === 'csv') {
        const parser = new Parser();
        const csv = parser.parse(exportData);
        res.header('Content-Type', 'text/csv');
        res.attachment('ledger.csv');
        return res.send(csv);
      }

      if (exportType === 'excel') {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('User Ledger');

        worksheet.columns = [
          { header: 'Type', key: 'Type', width: 10 },
          { header: 'Mode', key: 'Mode', width: 12 },
          { header: 'Amount', key: 'Amount', width: 15 },
          { header: 'Description', key: 'Description', width: 30 },
          { header: 'Reference ID', key: 'ReferenceID', width: 25 },
          { header: 'Date', key: 'Date', width: 20 },
        ];

        worksheet.addRows(exportData);

        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader('Content-Disposition', 'attachment; filename=ledger.xlsx');

        return workbook.xlsx.write(res).then(() => res.end());
      }
    }

    const total = await Wallet.countDocuments(query);

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      ledger: records,
      totalPages: Math.ceil(records.length / limit),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch ledger', error: err.message });
  }
};


const putStatusChange = async (req, res) => {
  try {
    const { userId } = req.params;
    const { environment_mode } = req.body;


    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { environment_mode },
      { new: true }
    )
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Environment mode updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update environment_mode', error: err.message });
  }
};




const getTotalWalletBalance = async (req, res) => {
  try {
    const {
      search = "",
      role = "",
      mode,
      minWallet,
      maxWallet,
      page = 1,
      limit = 10,
      sortBy = "wallet",   // wallet or name
      sort = "desc",       // asc or desc
      export: exportType   // csv or excel
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (minWallet || maxWallet) {

      let modeType;
      if (mode == 'true') {
        modeType = 'production'
      }
      if (mode == 'false') {
        modeType = 'credentials'
      }
      filter[`wallet.mode.${modeType}`] = {};
      if (minWallet) filter[`wallet.mode.${modeType}`].$gte = parseFloat(minWallet);
      if (maxWallet) filter[`wallet.mode.${modeType}`].$lte = parseFloat(maxWallet);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOption = { [sortBy]: sort === "asc" ? 1 : -1 };

    const users = await User.find(filter)
      .select("name email role wallet")
      .sort(sortOption)
      .skip(exportType ? 0 : skip)
      .limit(exportType ? 10000 : parseInt(limit));

    const totalUsers = await User.countDocuments(filter);

    const modeType = mode === 'true' ? 'production' : 'credentials';
    const totalWalletBalance = await User.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalBalance: { $sum: `$wallet.mode.${modeType}` }
        }
      }
    ]);
    // console.log(totalWalletBalance);

    const totalBalance = totalWalletBalance[0]?.totalBalance || 0;

    if (exportType === "csv" || exportType === "excel") {
      const data = users.map((user) => ({
        Name: user.name,
        Email: user.email,
        Role: user.role,
        Wallet: user.wallet.mode.production,
      }));

      if (exportType === "csv") {
        const parser = new Parser();
        const csv = parser.parse(data);
        res.header("Content-Type", "text/csv");
        res.attachment("wallet-report.csv");
        return res.send(csv);
      }

      if (exportType === "excel") {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Wallet Report");

        worksheet.columns = [
          { header: "Name", key: "Name", width: 20 },
          { header: "Email", key: "Email", width: 25 },
          { header: "Role", key: "Role", width: 15 },
          { header: "Wallet", key: "Wallet", width: 15 },
        ];

        worksheet.addRows(data);

        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader("Content-Disposition", "attachment; filename=wallet-report.xlsx");

        return workbook.xlsx.write(res).then(() => res.end());
      }
    }

    res.json({
      totalUsers,
      totalWalletBalance: totalBalance,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalUsers / limit),
      users
    });
  } catch (err) {
    console.error("Wallet report error:", err);
    res.status(500).json({
      message: "Failed to fetch wallet data",
      error: err.message
    });
  }
};

module.exports = {
  createUser,
  assignServices,
  updateServiceCharge,
  getAllUsers,
  getServiceReport,
  addService,
  getAllServices,
  updateUser,
  verifyKYC,
  adminWalletTopup,
  putStatusChange,
  getUserLedger,
  getTotalWalletBalance,
  assignAllServicesToUser, getKycRequestedUsers,
  parchaseService, apirequests, updateApirequests, getUserById
};