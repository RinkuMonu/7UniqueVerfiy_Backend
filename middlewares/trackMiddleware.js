// middleware/usageTracker.js
const Service = require("../models/Service");
const User = require("../models/User");
const Wallet = require("../models/Wallet");

const usageTracker = (serviceName) => {
  return async (req, res, next) => {
    try {
      const user = req.user; // comes from apiMiddleware
      const env = req.environment || "credentials"; // default to credentials if not set
      console.log('env', env);


      if (!serviceName) {
        return res.status(400).json({ message: "Service name is required" });
      }
      console.log(serviceName);
      

      const service = await Service.findOne({ endpoint: serviceName });
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      // Check access
      const hasAccess = user.services.some(id => id.equals(service._id));
      if (!hasAccess) {
        return res.status(403).json({ message: "User not subscribed to this service" });
      }

      // Wallet structure: wallet.mode.credentials / wallet.mode.production
      const walletField = `wallet.mode.${env}`;
      const walletBalance = user.wallet?.mode?.[env] ?? 0;


      if (walletBalance < service.charge) {
        return res.status(402).json({ message: `Insufficient ${env} wallet balance` });
      }
      // Find custom charge if available
      const isCustom = user.customServiceCharges.find(data => data.service.equals(service._id));
      console.log(user.customServiceCharges);


      // Decide deduction amount
      const deductionAmount = isCustom ? -isCustom.customCharge : -service.charge;

      // Update wallet
      await user.updateOne({
        $inc: {
          [`wallet.mode.${env}`]: deductionAmount
        }
      });


      // Create Wallet Entry
      await Wallet.create({
        userId: user._id,
        type: 'debit',
        amount: service.charge,
        mode: env,
        description: `Charge for ${serviceName} (${env})`,
        referenceId: `SRV-${Date.now()}`
      });

      // Track usage
      const usageMatched = await User.updateOne(
        { _id: user._id, "serviceUsage.service": serviceName },
        {
          $inc: {
            "serviceUsage.$.hitCount": 1,
            "serviceUsage.$.totalCharge": service.charge
          }
        }
      );

      // If serviceUsage entry doesn't exist, create it
      if (usageMatched.modifiedCount === 0) {
        await User.updateOne(
          { _id: user._id },
          {
            $push: {
              serviceUsage: {
                service: serviceName,
                mode: env,
                hitCount: 1,
                totalCharge: service.charge
              }
            }
          }
        );
      }

      req.service = service;
      next();
    } catch (err) {
      console.error("UsageTracker error:", err);
      res.status(500).json({ message: "Tracking error", error: err.message });
    }
  };
};

module.exports = usageTracker;
