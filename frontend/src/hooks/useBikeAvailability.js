// import { useState, useCallback } from "react";
// import axios from "axios";

// export function useBikeAvailability() {
//   const [checking, setChecking] = useState(false);

//   const checkAvailability = useCallback(async (bikeId, startDate, endDate) => {
//     if (!bikeId || !startDate || !endDate) {
//       return {
//         isAvailable: false,
//         message: "Invalid date selection",
//       };
//     }

//     setChecking(true);

//     try {
//       const res = await axios.post("https://pipip-backend-eid3.onrender.com/api/availability", {
//         bikeId,
//         start_datetime: startDate.toISOString(),
//         end_datetime: endDate.toISOString(),
//       });

//       return {
//         isAvailable: res.data.isAvailable,
//         message: res.data.message,
//         bookedFrom: res.data.bookedFrom,
//         bookedTo: res.data.bookedTo,
//       };
//     } catch (error) {
//       console.error("Availability check failed:", error);

//       return {
//         isAvailable: false,
//         message: "Failed to check availability",
//       };
//     } finally {
//       setChecking(false);
//     }
//   }, []);

//   return { checkAvailability, checking };
// }



// import { useState, useCallback } from "react";
// import axios from "axios";

// export function useBikeAvailability() {

//   const [checking, setChecking] = useState(false);

//   const checkAvailability = useCallback(

//     async (
//       bikeId,
//       startDate,
//       endDate,
//         isClusterOrBookingId = false,
//       // isCluster = false,
//       bookingId = null
//     ) => {

//       if (!bikeId || !startDate || !endDate) {

//         return {
//           isAvailable: false,
//           message: "Invalid date selection",
//         };

//       }

//       setChecking(true);

//       try {

//         // const res = await axios.post(
//         //   "https://pipip-backend-eid3.onrender.com/api/availability",
//         //   {

//         //     bikeId,
//         console.trace("CHECK AVAILABILITY CALLED");


//         let isCluster = false;

// // Old calls:
// // checkAvailability(bikeId,start,end,bookingId)


// if (
//   typeof isClusterOrBookingId === "string" &&
//   isClusterOrBookingId.length === 24 &&
//   bookingId === null
// ) {
//   // Old calls: checkAvailability(bikeId,start,end,bookingId)
//   bookingId = isClusterOrBookingId;
//   isCluster = false;
// } else {
//   isCluster = isClusterOrBookingId === true;
// }



//         const payload = {

//             start_datetime:
//               startDate.toISOString(),

//             end_datetime:
//               endDate.toISOString(),

//             bookingId: bookingId   // ⭐ MUST SEND

//           };

//           if (isCluster === true) {
//   payload.clusterId = bikeId;
// } else {
//   payload.bikeId = bikeId;
// }
//       // if (isCluster) {
//       //   payload.clusterId = bikeId;
//       // } else {
//       //   payload.bikeId = bikeId;
//       // }

      

//       console.log("===== Availability Check =====");
// console.log("bikeId:", bikeId);
// console.log("isCluster:", isCluster);
// console.log("bookingId:", bookingId);
// console.log("payload:", payload);

//       const res = await axios.post("https://pipip-backend-eid3.onrender.com/api/availability", payload);
//         return res.data;

//       }

//       catch (error) {

//         console.error(
//           "Availability check failed:",
//           error
//         );

//         return {

//           isAvailable: false,
//           message:
//             "Failed to check availability",

//         };

//       }

//       finally {

//         setChecking(false);

//       }

//     },

//     []

//   );

//   return {

//     checkAvailability,
//     checking

//   };

// }


import { useState, useCallback } from "react";
import axios from "axios";

export function useBikeAvailability() {
  const [checking, setChecking] = useState(false);

  const checkAvailability = useCallback(
    async (
      bikeId,
      startDate,
      endDate,
      isClusterOrBookingId = false,
      bookingId = null
    ) => {
      if (!bikeId || !startDate || !endDate) {
        return {
          isAvailable: false,
          message: "Invalid date selection",
        };
      }

      setChecking(true);

      try {
        console.trace("CHECK AVAILABILITY CALLED");

        let finalBookingId = null;
        let isCluster = false;

        // Smart-detect parameter signature patterns
        if (
          typeof isClusterOrBookingId === "string" &&
          isClusterOrBookingId.length === 24
        ) {
          finalBookingId = isClusterOrBookingId;
          isCluster = false;
        } else {
          isCluster = isClusterOrBookingId === true;
          // Ensure we extract a valid string representation of bookingId
          if (bookingId) {
            finalBookingId = typeof bookingId === "object" ? bookingId._id || bookingId.id : bookingId;
          }
        }

        const payload = {
          start_datetime: startDate.toISOString(),
          end_datetime: endDate.toISOString(),
          bookingId: finalBookingId, // Cleaned target string string passed explicitly
        };

        if (isCluster === true) {
          payload.clusterId = bikeId;
        } else {
          payload.bikeId = bikeId;
        }

        console.log("===== Availability Check =====");
        console.log("payload being sent:", payload);

        const res = await axios.post("https://pipip-backend-eid3.onrender.com/api/availability", payload);
        return res.data;

      } catch (error) {
        console.error("Availability check failed:", error);
        return {
          isAvailable: false,
          message: "Failed to check availability",
        };
      } finally {
        setChecking(false);
      }
    },
    []
  );

  return {
    checkAvailability,
    checking
  };
}