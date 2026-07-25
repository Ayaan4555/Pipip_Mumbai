const VehicleServiceHistory = require("../models/VehicleServiceHistory");
const Bike = require("../models/Bike");

// CREATE new vehicle service history entry
exports.createServiceRecord = async (req, res) => {
  try {
    const { bike_id, service_date, service_amount, bill_link, remarks } = req.body;

    if (!bike_id || !service_date || !service_amount) {
      return res.status(400).json({
        message: "Bike, Service Date, and Service Amount are required.",
      });
    }

    const bike = await Bike.findById(bike_id);
    if (!bike) {
      return res.status(404).json({ message: "Selected bike not found." });
    }

    // Determine final bill link (uploaded file path or raw URL link)
    let finalBillLink = bill_link || "";
    if (req.file) {
      finalBillLink = req.file.path;
    } else if (req.files?.bill_link?.[0]) {
      finalBillLink = req.files.bill_link[0].path;
    }

    const serviceAmountNum = Number(service_amount);

    // 1. Create service record
    const serviceRecord = await VehicleServiceHistory.create({
      bike_id,
      service_date,
      service_amount: serviceAmountNum,
      bill_link: finalBillLink,
      remarks: remarks || "",
      recorded_by: req.user._id,
    });

    // 2. Automatically update Bike total service expenses and last service date
    bike.bike_expenses = (bike.bike_expenses || 0) + serviceAmountNum;

    const newServiceDate = new Date(service_date);
    if (
      !bike.last_service_date ||
      newServiceDate >= new Date(bike.last_service_date)
    ) {
      bike.last_service_date = service_date;
    }

    await bike.save();

    const populatedRecord = await VehicleServiceHistory.findById(
      serviceRecord._id
    )
      .populate(
        "bike_id",
        "bike_name model number_plate bike_expenses last_service_date image_url"
      )
      .populate("recorded_by", "fullName email");

    res.status(201).json({
      message: "Vehicle service history recorded successfully",
      record: populatedRecord,
      updated_bike: bike,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET all vehicle service records (with optional search/bike filter)
exports.getServiceRecords = async (req, res) => {
  try {
    const { search, bike_id } = req.query;
    let filter = {};

    if (bike_id) {
      filter.bike_id = bike_id;
    }

    let records = await VehicleServiceHistory.find(filter)
      .populate(
        "bike_id",
        "bike_name model number_plate bike_expenses last_service_date image_url"
      )
      .populate("recorded_by", "fullName email")
      .sort({ service_date: -1, createdAt: -1 });

    if (search) {
      const q = search.toLowerCase();
      records = records.filter((r) => {
        const bikeName = r.bike_id?.bike_name?.toLowerCase() || "";
        const bikeModel = r.bike_id?.model?.toLowerCase() || "";
        const numberPlate = r.bike_id?.number_plate?.toLowerCase() || "";
        const remarks = r.remarks?.toLowerCase() || "";
        return (
          bikeName.includes(q) ||
          bikeModel.includes(q) ||
          numberPlate.includes(q) ||
          remarks.includes(q)
        );
      });
    }

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET specific bike service history timeline & summary
exports.getBikeServiceTimeline = async (req, res) => {
  try {
    const { bikeId } = req.params;
    const bike = await Bike.findById(bikeId);
    if (!bike) {
      return res.status(404).json({ message: "Bike not found" });
    }

    const serviceLogs = await VehicleServiceHistory.find({ bike_id: bikeId })
      .populate("recorded_by", "fullName email")
      .sort({ service_date: -1, createdAt: -1 });

    res.json({
      bike,
      total_service_expenses: bike.bike_expenses || 0,
      last_service_date: bike.last_service_date || null,
      total_service_count: serviceLogs.length,
      logs: serviceLogs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE a service record
exports.updateServiceRecord = async (req, res) => {
  try {
    const record = await VehicleServiceHistory.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Service record not found" });
    }

    const { service_date, service_amount, bill_link, remarks } = req.body;
    const oldAmount = record.service_amount;
    const newAmount = Number(service_amount || oldAmount);

    let finalBillLink = record.bill_link;
    if (req.file) {
      finalBillLink = req.file.path;
    } else if (bill_link !== undefined) {
      finalBillLink = bill_link;
    }

    record.service_date = service_date || record.service_date;
    record.service_amount = newAmount;
    record.bill_link = finalBillLink;
    record.remarks = remarks !== undefined ? remarks : record.remarks;
    await record.save();

    // Adjust Bike cumulative expense delta
    const bike = await Bike.findById(record.bike_id);
    if (bike) {
      const delta = newAmount - oldAmount;
      bike.bike_expenses = Math.max(0, (bike.bike_expenses || 0) + delta);

      // Recalculate latest service date for this bike
      const latestRecord = await VehicleServiceHistory.findOne({
        bike_id: bike._id,
      }).sort({ service_date: -1 });
      if (latestRecord) {
        bike.last_service_date = latestRecord.service_date;
      }
      await bike.save();
    }

    const updated = await VehicleServiceHistory.findById(record._id)
      .populate(
        "bike_id",
        "bike_name model number_plate bike_expenses last_service_date image_url"
      )
      .populate("recorded_by", "fullName email");

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE a service record
exports.deleteServiceRecord = async (req, res) => {
  try {
    const record = await VehicleServiceHistory.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Service record not found" });
    }

    const bikeId = record.bike_id;
    const amount = record.service_amount;

    await VehicleServiceHistory.findByIdAndDelete(req.params.id);

    // Adjust Bike cumulative expense
    const bike = await Bike.findById(bikeId);
    if (bike) {
      bike.bike_expenses = Math.max(0, (bike.bike_expenses || 0) - amount);

      const latestRecord = await VehicleServiceHistory.findOne({
        bike_id: bike._id,
      }).sort({ service_date: -1 });

      bike.last_service_date = latestRecord ? latestRecord.service_date : null;
      await bike.save();
    }

    res.json({ message: "Vehicle service record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};