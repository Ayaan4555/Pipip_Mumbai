const Bike = require("../models/Bike");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * ADMIN: Create Bike
 */
// const createBike = async (req, res) => {
// console.log("FILE =>", req.file);
// console.log("BODY =>", req.body);
//   try {
//     const image_url = req.file ? req.file.path : null;

//     const bike = await Bike.create({
//       ...req.body,
//       image_url,
//     });

//     res.status(201).json(bike);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// const createBike = async (req, res) => {
//   try {
//     // 👇 ADD THIS LINE HERE
//     console.log("REQ.FILE =>", req.file);
//     console.log(req.body);

//     const image_url = req.file ? req.file.path : null;
//     console.log(image_url);

    
//     const bike = await Bike.create({
//       ...req.body,
//       image_url,
//     });
   
 
//     res.status(201).json(bike);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


const createBike = async (req, res) => {
  try {

    if (req.user && req.user.role === "staff") {
      const hasArea = req.user.assigned_areas.some(
        (area) => area._id.toString() === req.body.area_id?.toString()
      );
      if (!hasArea) {
        return res.status(403).json({ message: "Access denied: You are not assigned to this area" });
      }
    }


    // Main image handle karein
    const image_url = req.files?.image_url ? req.files.image_url[0].path : null;

    // Extra images handle karein
    let extraImagePaths = [];
    if (req.files?.extra_images) {
      extraImagePaths = req.files.extra_images.map((file) => file.path);
    }

    const bike = await Bike.create({
      ...req.body,
      image_url,
      extra_images: extraImagePaths,
    });

    

    res.status(201).json(bike);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};







/**
 * PUBLIC: Get All Bikes
 */
const getBikes = async (req, res) => {
  try {
    // const bikes = await Bike.find();
    const filter = {};
    if (req.headers.authorization?.startsWith("Bearer")) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user && user.role === "staff") {
          filter.area_id = { $in: user.assigned_areas };
        }
      } catch (err) {
        // ignore jwt errors
      }
    }
    const bikes = await Bike.find(filter);
    res.status(200).json(bikes);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ADMIN: Update Bike
 */
// const updateBike = async (req, res) => {
//   try {
//     const updateData = { ...req.body };

//     if (req.file) {
//       updateData.image_url = req.file.path;
//     }

//     const bike = await Bike.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       { new: true }
//     );

//     res.status(200).json(bike);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


const updateBike = async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) return res.status(404).json({ message: "Not found" });

    if (req.user && req.user.role === "staff") {
      const hasOldArea = req.user.assigned_areas.some(
        (area) => area._id.toString() === bike.area_id?.toString()
      );
      if (!hasOldArea) {
        return res.status(403).json({ message: "Access denied: You are not assigned to the bike's current area" });
      }
      if (req.body.area_id) {
        const hasNewArea = req.user.assigned_areas.some(
          (area) => area._id.toString() === req.body.area_id.toString()
        );
        if (!hasNewArea) {
          return res.status(403).json({ message: "Access denied: You cannot move the bike to an unassigned area" });
        }
      }
    }

    const updateData = { ...req.body };

    // 1. Handle Main Profile Image
    if (req.files?.image_url) {
      updateData.image_url = req.files.image_url[0].path;
    }

    // 2. Handle Extra Images (Syncing Deletions + New Uploads)
    let finalExtraImages = [];

    // Check if frontend sent the list of images to KEEP
    if (req.body.remaining_extra_images) {
      try {
        // Parse the stringified array sent from FormData
        finalExtraImages = JSON.parse(req.body.remaining_extra_images);
      } catch (e) {
        finalExtraImages = [];
      }
    } else {
      // If no 'remaining' field is sent, assume we keep existing ones
      // (Safety fallback, though frontend should always send this now)
      finalExtraImages = bike.extra_images || [];
    }

    // Append NEWLY uploaded files to the kept ones
    if (req.files?.extra_images) {
      const newPaths = req.files.extra_images.map((f) => f.path);
      finalExtraImages = [...finalExtraImages, ...newPaths];
    }

    // Enforce the 5-image limit and update the data object
    updateData.extra_images = finalExtraImages.slice(0, 5);

    const updatedBike = await Bike.findByIdAndUpdate(
      req.params.id,
      { $set: updateData }, // Use $set to ensure array replacement
      { new: true },
    );

    res.status(200).json(updatedBike);
  } catch (error) {
    console.error("Backend Update Error:", error);
    res.status(500).json({ message: error.message });
  }
};


/**
 * ADMIN: Delete Bike
 */
const deleteBike = async (req, res) => {
  try {

    const bike = await Bike.findById(req.params.id);
    if (!bike) return res.status(404).json({ message: "Bike not found" });
    if (req.user && req.user.role === "staff") {
      const hasArea = req.user.assigned_areas.some(
        (area) => area._id.toString() === bike.area_id?.toString()
      );
      if (!hasArea) {
        return res.status(403).json({ message: "Access denied: You are not assigned to the bike's area" });
      }
    }

    await Bike.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Bike deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSingleBike = async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    
    if (!bike) {
      return res.status(404).json({ message: "Bike not found" });
    }

    // Optional token checking for staff area restriction
    if (req.headers.authorization?.startsWith("Bearer")) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user && user.role === "staff") {
          const hasArea = user.assigned_areas.some(
            (areaId) => areaId.toString() === bike.area_id?.toString()
          );
          if (!hasArea) {
            return res.status(403).json({ message: "Access denied: You do not have access to this area" });
          }
        }
      } catch (err) {
        // ignore jwt errors
      }
    }

    res.json(bike);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createBike,
  getBikes,
  updateBike,
  deleteBike,
  getSingleBike,
};
