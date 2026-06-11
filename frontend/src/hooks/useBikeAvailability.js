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



import { useState, useCallback } from "react";
import axios from "axios";

export function useBikeAvailability() {

  const [checking, setChecking] = useState(false);

  const checkAvailability = useCallback(

    async (
      bikeId,
      startDate,
      endDate,
      isCluster = false,
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

        // const res = await axios.post(
        //   "https://pipip-backend-eid3.onrender.com/api/availability",
        //   {

        //     bikeId,

        const payload = {

            start_datetime:
              startDate.toISOString(),

            end_datetime:
              endDate.toISOString(),

            bookingId: bookingId   // ⭐ MUST SEND

          };
      // if (isCluster) {
      //   payload.clusterId = bikeId;
      // } else {
      //   payload.bikeId = bikeId;
      // }

      payload.bikeId = bikeId;

      console.log("===== Availability Check =====");
console.log("bikeId:", bikeId);
console.log("isCluster:", isCluster);
console.log("bookingId:", bookingId);
console.log("payload:", payload);

      const res = await axios.post("https://pipip-backend-eid3.onrender.com/api/availability", payload);
        return res.data;

      }

      catch (error) {

        console.error(
          "Availability check failed:",
          error
        );

        return {

          isAvailable: false,
          message:
            "Failed to check availability",

        };

      }

      finally {

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