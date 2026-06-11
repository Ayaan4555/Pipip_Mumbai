import { useState, useEffect , useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bike,
  IndianRupee,
  MapPin,
  Gauge,
  Star,
  Zap,
  Shield,
  ArrowRight,
  Grid,
  List,
  Filter,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  AlertCircle,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { useBikes } from "../hooks/useBikes";
import { useActiveAreas } from "../hooks/useAreas";
import useSEO from "../hooks/useSEO";
import {useClusters} from "../hooks/useClusters"
import {useBikeAvailability} from "../hooks/useBikeAvailability"


// const Catalog = () => {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
  

//   const urlAreaId = searchParams.get("area");
//   const urlStart = searchParams.get("start");
//   const urlEnd = searchParams.get("end");

//   useSEO({
//     title: "Bikes & Scooters Catalog | Rent a Bike in Mumbai - Pipip",
//     description: "Choose from our complete catalog of well-maintained self-drive scooters and motorcycles in Mumbai. Activa, KTM, Jupiter, and Royal Enfield available at cheap hourly and daily rates."
//   });

//   const [selectedArea, setSelectedArea] = useState("all");
//   const [ccFilter, setCcFilter] = useState("all");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [viewMode, setViewMode] = useState("grid");
//   const [initialized, setInitialized] = useState(false);
//   const [hoveredBike, setHoveredBike] = useState(null);

//   const { data: bikes, isLoading: bikesLoading } = useBikes();
//   const { data: areas } = useActiveAreas();



//   useEffect(() => {
//     if (!initialized && areas && areas.length > 0) {
//       if (urlAreaId && areas.some((a) => a._id === urlAreaId)) {
//         setSelectedArea(urlAreaId);
//       }
//       setInitialized(true);
//     }
//   }, [urlAreaId, areas, initialized]);

//   const getAreaName = (areaId) => {
//     if (!areaId || !areas) return null;
//     const area = areas.find((a) => a._id === areaId);
//     return area ? area.name : null;
//   };

//  const filteredBikes =
//   bikes?.filter((bike) => {
    
//   const areaMatch =
//   selectedArea === "all" ||
//   String(bike.area_id) === String(selectedArea);

//     const ccMatch =
//       ccFilter === "all" ||
//       (ccFilter === "under125" && bike.cc <= 125) ||
//       (ccFilter === "125to150" && bike.cc > 125 && bike.cc <= 150) ||
//       (ccFilter === "above150" && bike.cc > 150);

//     const statusMatch =
//       statusFilter === "all" || bike.status === statusFilter;

//     return areaMatch && ccMatch && statusMatch;
//   }) || [];

//   const handleBookNow = (bikeId) => {
//     const params = new URLSearchParams();
//     if (urlStart) params.set("start", urlStart);
//     if (urlEnd) params.set("end", urlEnd);
//     if (selectedArea !== "all") params.set("area", selectedArea);

//     navigate(`/book/${bikeId}?${params.toString()}`);
//   };

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: { staggerChildren: 0.08, delayChildren: 0.1 },
//     },
//   };

//   const cardVariants = {
//     hidden: { opacity: 0, y: 40, scale: 0.95 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       scale: 1,
//       transition: { type: "spring", stiffness: 100, damping: 15 },
//     },
//   };
//  return (
//     <div className="min-h-screen bg-background pt-[60px]">
//       <Header />
      
//       <main className="pt-24 pb-16">
//         <div className="container mx-auto px-4">
//           {/* Page Header */}
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-center mb-12"
//           >
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//               transition={{ type: "spring", delay: 0.2 }}
//               className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-4"
//             >
//               <Zap className="w-4 h-4 text-primary" />
//               <span className="text-sm font-medium text-primary">Full Catalog</span>
//             </motion.div>
//             <h1 className="font-display text-4xl md:text-5xl text-gradient-sunset mb-4">
//               Bike Catalog
//             </h1>
//             <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
//               Browse our complete collection of scooters and bikes available for rent
//             </p>
//             <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
//               For Visual Representation Only.
//             </p>
//             <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
//               The Images of Bike may or may not match the actual Product.
//             </p>
//           </motion.div>

//           {/* Filters Bar */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="bg-card/80 backdrop-blur-md border border-border rounded-2xl p-6 mb-10 shadow-golden"
//           >
//             <div className="flex flex-col lg:flex-row gap-4">
//               <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
//                 {/* Area Filter */}
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium text-foreground flex items-center gap-2">
//                     <MapPin className="w-4 h-4 text-primary" />
//                     Location
//                   </label>
//                   <Select
//   key={selectedArea}
//   value={selectedArea}
//   onValueChange={setSelectedArea}
// >
//                     <SelectTrigger className="bg-input border-border h-12">
//                       <SelectValue placeholder="All Areas" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">All Areas</SelectItem>
//                       {areas?.map((area) => (
//                         <SelectItem key={area._id} value={area._id}>
//                           {area.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* CC Filter */}
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium text-foreground flex items-center gap-2">
//                     <Gauge className="w-4 h-4 text-secondary" />
//                     Engine Size
//                   </label>
//                   <Select value={ccFilter} onValueChange={setCcFilter}>
//                     <SelectTrigger className="bg-input border-border h-12">
//                       <SelectValue placeholder="All CC" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">All CC</SelectItem>
//                       <SelectItem value="under125">Up to 125cc</SelectItem>
//                       <SelectItem value="125to150">125cc - 150cc</SelectItem>
//                       <SelectItem value="above150">Above 150cc</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* Status Filter */}
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium text-foreground flex items-center gap-2">
//                     <Filter className="w-4 h-4 text-accent" />
//                     Status
//                   </label>
//                   <Select value={statusFilter} onValueChange={setStatusFilter}>
//                     <SelectTrigger className="bg-input border-border h-12">
//                       <SelectValue placeholder="All Status" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">All Status</SelectItem>
//                       <SelectItem value="available">Available</SelectItem>
//                       <SelectItem value="booked">On Rent</SelectItem>
//                       <SelectItem value="maintenance">Maintenance</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               {/* View Toggle & Count */}
//               <div className="flex items-end gap-4">
//                 <div className="flex bg-muted rounded-lg p-1">
//                   <Button
//                     variant={viewMode === "grid" ? "default" : "ghost"}
//                     size="sm"
//                     onClick={() => setViewMode("grid")}
//                     className={viewMode === "grid" ? "gradient-sunset" : ""}
//                   >
//                     <Grid className="w-4 h-4" />
//                   </Button>
//                   <Button
//                     variant={viewMode === "list" ? "default" : "ghost"}
//                     size="sm"
//                     onClick={() => setViewMode("list")}
//                     className={viewMode === "list" ? "gradient-sunset" : ""}
//                   >
//                     <List className="w-4 h-4" />
//                   </Button>
//                 </div>
//                 <div className="h-12 px-4 bg-muted/50 rounded-lg flex items-center border border-border">
//                   <span className="text-muted-foreground whitespace-nowrap">
//                     {bikesLoading ? "Loading..." : `${filteredBikes.length} bikes`}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </motion.div>

//           {/* Bikes Display */}
//           {bikesLoading ? (
//             <div className={`grid ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"} gap-6`}>
//               {[...Array(8)].map((_, i) => (
//                 <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden">
//                   <Skeleton className="h-48 w-full" />
//                   <div className="p-5">
//                     <Skeleton className="h-6 w-3/4 mb-2" />
//                     <Skeleton className="h-4 w-1/2 mb-4" />
//                     <Skeleton className="h-10 w-full" />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : filteredBikes.length === 0 ? (
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               className="text-center py-16"
//             >
//               <motion.div
//                 animate={{ y: [0, -10, 0] }}
//                 transition={{ duration: 2, repeat: Infinity }}
//               >
//                 <Bike className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
//               </motion.div>
//               <h3 className="text-xl font-semibold text-foreground mb-2">No Bikes Found</h3>
//               <p className="text-muted-foreground mb-6">Try adjusting your filters</p>
//               <Button 
//                 variant="outline" 
//                 onClick={() => {
//                   setSelectedArea("all");
//                   setCcFilter("all");
//                   setStatusFilter("all");
//                 }}
//                 className="border-primary text-primary hover:bg-primary/10"
//               >
//                 Clear Filters
//               </Button>
//             </motion.div>
//           ) : (
//             <motion.div 
//               className={`grid ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"} gap-6`}
//               variants={containerVariants}
//               initial="hidden"
//               animate="visible"
//             >
//               <AnimatePresence mode="popLayout">
//                 {filteredBikes.map((bike) => (
//                   <motion.div
//                     key={bike._id}
//                     variants={cardVariants}
//                     layout
//                     onMouseEnter={() => setHoveredBike(bike._id)}
//                     onMouseLeave={() => setHoveredBike(null)}
//                     className={`group relative bg-card border border-border rounded-2xl overflow-hidden cursor-pointer ${
//                       viewMode === "list" ? "flex" : ""
//                     }`}
//                     whileHover={{ 
//                       y: -8,
//                       boxShadow: "0 20px 40px -15px hsl(var(--primary) / 0.3)",
//                       borderColor: "hsl(var(--primary) / 0.5)"
//                     }}
//                     onClick={() => bike.status === 'available' && handleBookNow(bike._id)}
//                   >
//                     {/* Image */}
//                     <div className={`relative ${viewMode === "list" ? "w-48 h-36" : "h-48"} bg-muted overflow-hidden`}>
//                       {bike.image_url ? (
//                         <motion.img
//                           src={bike.image_url}
//                           alt={bike.model}
//                           className="w-full h-full object-cover"
//                           whileHover={{ scale: 1.1 }}
//                           transition={{ duration: 0.4 }}
//                         />
//                       ) : (
//                         <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
//                           <Bike className="w-16 h-16 text-muted-foreground" />
//                         </div>
//                       )}
                      
//                       {/* Status Badge */}
//                       <div className="absolute top-3 right-3">
//                         <Badge
//                           className={`${
//                             bike.status === "available"
//                               ? "bg-green-500/90 text-white"
//                               : bike.status === "booked"
//                               ? "bg-red-500/90 text-white"
//                               : "bg-amber-500/90 text-white"
//                           }`}
//                         >
//                           {bike.status === "available" ? "Available" : 
//                            bike.status === "booked" ? "On Rent" : "Maintenance"}
//                         </Badge>
//                       </div>

//                       {/* Area Badge */}
//                       {getAreaName(bike.area_id) && (
//                         <div className="absolute bottom-3 left-3">
//                           <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm text-foreground">
//                             <MapPin className="w-3 h-3 mr-1" />
//                             {getAreaName(bike.area_id)}
//                           </Badge>
//                         </div>
//                       )}

//                       {/* Rating */}
                      
                       
//                     </div>

//                     {/* Info */}
//                     <div className={`p-5 ${viewMode === "list" ? "flex-1 flex flex-col justify-between" : ""}`}>
//                       <div>
//                         <div className="flex items-start justify-between mb-2">
//                           <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
//                             {bike.model}
//                           </h3>
//                           <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
//                             {bike.cc}cc
//                           </span>
//                         </div>

//                         <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
//                           <Shield className="w-3 h-3 text-green-500" />
//                           {bike.number_plate}
//                         </p>
//                       </div>

//                       {/* Pricing */}
//                       <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg">
//                         <div className="flex items-center gap-1 text-primary">
//                           <IndianRupee className="w-4 h-4" />
//                           <span className="font-bold text-lg">{bike.price_per_hour}</span>
//                           <span className="text-xs text-muted-foreground">/hr</span>
//                         </div>
//                         <div className="w-px h-6 bg-border" />
//                         <div className="flex items-center gap-1 text-secondary">
//                           <IndianRupee className="w-4 h-4" />
//                           <span className="font-bold text-lg">{bike.price_per_day}</span>
//                           <span className="text-xs text-muted-foreground">/day</span>
//                         </div>
//                       </div>

//                       <Button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleBookNow(bike._id);
//                         }}
//                         className="w-full gradient-sunset text-primary-foreground font-medium"
//                         disabled={bike.status !== "available"}
//                       >
//                         {bike.status === "available" ? (
//                           <>
//                             Book Now
//                             <ArrowRight className="w-4 h-4 ml-2" />
//                           </>
//                         ) : bike.status === "booked" ? (
//                           "Currently On Rent"
//                         ) : (
//                           "Under Maintenance"
//                         )}
//                       </Button>
//                     </div>
//                   </motion.div>
//                 ))}
//               </AnimatePresence>
//             </motion.div>
//           )}
//         </div>
//       </main>

//       <Footer />
//     </div>
//   );
// };


const BikeCard = ({
  bike,
  viewMode,
  urlStart,
  urlEnd,
  handleBookNow,
  getAreaName,
  setHoveredBike,
}) => {
  const { checkAvailability, checking } = useBikeAvailability();
  const [availabilityData, setAvailabilityData] = useState({
    isAvailable: true,
  });

  // Checks the backend for current rent status/conflicts whenever dates change
  useEffect(() => {
    const verifyStatus = async () => {
      // If we have dates, check the backend
      if (urlStart && urlEnd && bike.status === "available") {
        const res = await checkAvailability(
          bike._id,
          new Date(urlStart),
          new Date(urlEnd),
        );
        setAvailabilityData(res);
      }
      // If dates are cleared, RESET the card to default state
      else {
        setAvailabilityData({ isAvailable: true });
      }
    };

    verifyStatus();
  }, [bike._id, urlStart, urlEnd, checkAvailability, bike.status]);

  // Logic to see if the bike is currently occupied in the searched slot
  const isBookedInSlot =
    !availabilityData.isAvailable && availabilityData.bookedTo;

  // Helper to format the date/time from the DB
  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "short",
    });
  };

  return (
    <motion.div
      key={bike._id}
      onMouseEnter={() => setHoveredBike(bike._id)}
      onMouseLeave={() => setHoveredBike(null)}
      className={`group relative bg-card border border-border rounded-2xl overflow-hidden cursor-pointer transition-shadow ${
        viewMode === "list" ? "flex" : ""
      } hover:shadow-golden hover:border-primary/50`}
      whileHover={{ y: -8 }}
      onClick={() =>
        !isBookedInSlot &&
        bike.status === "available" &&
        handleBookNow(bike._id)
      }
    >
      {/* Image Section */}
      <div
        className={`relative ${viewMode === "list" ? "w-48 h-36" : "h-48"} bg-muted overflow-hidden`}
      >
        {bike.image_url ? (
          <motion.img
            src={bike.image_url}
            alt={bike.model}
            className="w-full h-full object-fill"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.4 }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <Bike className="w-16 h-16 text-muted-foreground" />
          </div>
        )}

        {/* STATUS BADGES - Showing Rent Timing here */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
          <Badge
            className={`${
              isBookedInSlot
                ? "bg-orange-500 text-white"
                : bike.status === "available"
                  ? "bg-green-500/90 text-white"
                  : bike.status === "booked"
                    ? "bg-red-500/90 text-white"
                    : "bg-amber-500/90 text-white"
            }`}
          >
            {isBookedInSlot
              ? "Slot Taken"
              : bike.status === "available"
                ? "Available"
                : bike.status === "booked"
                  ? "On Rent"
                  : "Maintenance"}
          </Badge>

          {/* THE EXACT RENT TIME DISPLAY */}
          {isBookedInSlot && (
            <Badge
              variant="outline"
              className="bg-card/95 backdrop-blur-md text-orange-600 border-orange-500 text-[10px] py-1 shadow-lg"
            >
              Booked until: {formatTime(availabilityData.bookedTo)}
            </Badge>
          )}
        </div>

        {getAreaName(bike.area_id) && (
          <div className="absolute bottom-3 left-3">
            <Badge
              variant="secondary"
              className="bg-card/90 backdrop-blur-sm text-foreground"
            >
              <MapPin className="w-3 h-3 mr-1" />
              {getAreaName(bike.area_id)}
            </Badge>
          </div>
        )}
      </div>

      {/* Info Section - Unchanged Design */}
      <div
        className={`p-5 ${viewMode === "list" ? "flex-1 flex flex-col justify-between" : ""}`}
      >
        <div>
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {bike.model}
            </h3>
            <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
              {bike.cc}cc
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
            <Shield className="w-3 h-3 text-green-500" />
            {bike.number_plate}
          </p>
        </div>

        {/* Pricing Layout - Exactly as requested */}
        <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-1 text-primary">
            <IndianRupee className="w-4 h-4" />
            <span className="font-bold text-lg">{bike.price_per_hour}</span>
            <span className="text-xs text-muted-foreground">/hr</span>
          </div>
          <div className="w-px h-6 bg-border" />
          <div className="flex items-center gap-1 text-secondary">
            <IndianRupee className="w-4 h-4" />
            <span className="font-bold text-lg">{bike.price_per_day}</span>
            <span className="text-xs text-muted-foreground">/day</span>
          </div>
        </div>

        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleBookNow(bike._id);
          }}
          className="w-full gradient-sunset text-primary-foreground font-medium"
          disabled={bike.status !== "available" || isBookedInSlot || checking}
        >
          {checking ? (
            "Checking..."
          ) : isBookedInSlot ? (
            "Currently Rented Out"
          ) : (
            <>
              Book Now <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

const ClusterCard = ({
  cluster,
  viewMode,
  urlStart,
  urlEnd,
  handleBookNow,
  getAreaName,
}) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const clusterImages = useMemo(() => {
    const imgs = [];
    cluster.bikes?.forEach((b) => {
      if (b.image_url && !imgs.includes(b.image_url)) imgs.push(b.image_url);
    });
    return imgs.length > 0 ? imgs : [""];
  }, [cluster.bikes]);

  const ccSize = cluster.bikes?.[0]?.cc || 125;

  // Auto-slide images every 3 seconds if there are multiple
  useEffect(() => {
    if (clusterImages.length <= 1) return;
    const intervalId = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % clusterImages.length);
    }, 3000);
    return () => clearInterval(intervalId);
  }, [clusterImages.length]);

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + clusterImages.length) % clusterImages.length);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % clusterImages.length);
  };

  return (
    <motion.div
      className={`group relative bg-gradient-to-br from-card via-card to-primary/5 border-2 border-primary/45 rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 shadow-golden hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] hover:border-primary/95 ${
        viewMode === "list" ? "flex" : ""
      }`}
      whileHover={{ y: -8 }}
      onClick={() => handleBookNow(cluster._id, true)}
    >
      {/* Premium Top Accent Bar */}
      {/* <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-primary to-orange-500 absolute top-0 left-0 z-20" /> */}

      {/* Image Gallery Container */}
      <div className={`relative ${viewMode === "list" ? "w-56 h-40" : "h-52"} bg-muted overflow-hidden pt-1.5 border-b border-primary/20`}>
        <AnimatePresence mode="wait">
          {clusterImages[currentImgIndex] ? (
            <motion.img
              key={currentImgIndex}
              src={clusterImages[currentImgIndex]}
              alt={cluster.name}
              className="w-full h-full object-fill absolute inset-0"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.35 }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <Bike className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
        </AnimatePresence>

        {/* Gallery Navigation Controls */}
        {clusterImages.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-card/85 hover:bg-primary text-foreground hover:text-primary-foreground border border-border rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 shadow-md"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-card/85 hover:bg-primary text-foreground hover:text-primary-foreground border border-border rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 shadow-md"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Gallery Dot Indicators */}
        {clusterImages.length > 1 && (
          <div className="absolute bottom-3 right-3 flex gap-1 z-10 bg-black/50 px-2 py-1 rounded-full backdrop-blur-md">
            {clusterImages.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentImgIndex ? "w-3 bg-primary" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}

        {/* Dynamic Glowing Badge */}
        <div className="absolute top-3 left-3 z-10 flex gap-1.5">
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-primary-foreground font-black tracking-wider shadow-golden px-2.5 py-1 text-[10px] rounded-lg border border-primary/30 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-200 animate-pulse" />
            FLEET POOL
          </Badge>
          <Badge className="bg-card/90 text-primary border border-primary/20 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold rounded-lg shadow-sm">
            {cluster.bikes?.length || 0} Models
          </Badge>
        </div>

        {/* Area / Location Overlay */}
        {getAreaName(cluster.area_id?._id || cluster.area_id) && (
          <div className="absolute bottom-3 left-3 z-10">
            <Badge
              variant="secondary"
              className="bg-card/90 backdrop-blur-md text-foreground border border-border/50 px-2.5 py-0.5 rounded-lg text-xs"
            >
              <MapPin className="w-3 h-3 mr-1 text-primary" />
              {getAreaName(cluster.area_id?._id || cluster.area_id)}
            </Badge>
          </div>
        )}
      </div>

      {/* Info & Booking Section */}
      <div className={`p-6 flex-1 flex flex-col justify-between pt-5`}>
        <div>
          {/* Title & Engine Size */}
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="font-display text-2xl text-gradient-sunset font-bold tracking-wide group-hover:scale-[1.01] transition-transform duration-300">
              {cluster.name}
            </h3>
            <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full font-bold shadow-sm">
              {ccSize}cc
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-secondary font-semibold uppercase tracking-wider mb-3.5">
            <Layers className="w-3.5 h-3.5 text-secondary" />
            <span>Multi-Vehicle Reservation</span>
          </div>

          {/* Dynamic list of Fleet Colors and Models
          <div className="mb-4 bg-muted/30 p-3 rounded-2xl border border-border/40">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-primary" /> Fleet Options Included:
            </span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {cluster.bikes?.slice(0, 3).map((b, idx) => (
                <span key={idx} className="text-[10px] bg-gradient-to-r from-primary/15 to-primary/5 text-primary border border-primary/25 px-2.5 py-0.5 rounded-lg font-bold shadow-sm">
                  ✨ {b.bike_colour || b.model}
                </span>
              ))}
              {cluster.bikes?.length > 3 && (
                <span className="text-[10px] bg-muted text-muted-foreground border border-border/50 px-2 py-0.5 rounded-lg font-bold">
                  +{cluster.bikes.length - 3} more
                </span>
              )}
            </div>
          </div> */}

          {/* Instruction Note */}
          <div className="bg-gradient-to-r from-primary/12 via-primary/5 to-transparent border-l-2 border-primary rounded-r-xl p-3 mb-5 text-[11px] text-muted-foreground flex items-start gap-2.5 leading-relaxed">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
            <span>Any available vehicle from this pool will be assigned by the admin to guarantee your booking.</span>
          </div>
        </div>

        {/* Pricing Layout */}
        <div className="flex items-center justify-between mb-5 p-4 bg-muted/65 rounded-2xl border border-border/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Hourly rate</span>
            <div className="flex items-center gap-0.5 text-primary mt-0.5">
              <IndianRupee className="w-4 h-4" />
              <span className="font-black text-xl">{cluster.price_per_hour}</span>
              <span className="text-xs text-muted-foreground font-normal">/hr</span>
            </div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Daily rate</span>
            <div className="flex items-center gap-0.5 text-secondary mt-0.5">
              <IndianRupee className="w-4 h-4" />
              <span className="font-black text-xl">{cluster.price_per_day}</span>
              <span className="text-xs text-muted-foreground font-normal">/day</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleBookNow(cluster._id, true);
          }}
          className="w-full gradient-sunset text-primary-foreground font-black tracking-wide rounded-2xl h-12 shadow-golden hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all duration-300 border border-primary/20 flex items-center justify-center gap-2"
        >
          Book Pool Category <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
        </Button>
      </div>
    </motion.div>
  );
};

const Catalog = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const urlAreaId = searchParams.get("area");
  const urlStart = searchParams.get("start");
  const urlEnd = searchParams.get("end");

    useSEO({
    title: "Bikes & Scooters Catalog | Rent a Bike in Mumbai - Pipip",
    description: "Choose from our complete catalog of well-maintained self-drive scooters and motorcycles in Mumbai. Activa, KTM, Jupiter, and Royal Enfield available at cheap hourly and daily rates."
  });

  const [selectedArea, setSelectedArea] = useState("all");
  const [ccFilter, setCcFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [initialized, setInitialized] = useState(false);
  const [hoveredBike, setHoveredBike] = useState(null);

  const { data: bikes, isLoading: bikesLoading } = useBikes();
  const { data: clusters, isLoading: clustersLoading } = useClusters();
  const { data: areas } = useActiveAreas();

  useEffect(() => {
    if (!initialized && areas && areas.length > 0) {
      if (urlAreaId && areas.some((a) => a._id === urlAreaId)) {
        setSelectedArea(urlAreaId);
      }
      setInitialized(true);
    }
  }, [urlAreaId, areas, initialized]);

  const getAreaName = (areaId) => {
    if (!areaId || !areas) return null;
    const area = areas.find((a) => a._id === areaId);
    return area ? area.name : null;
  };

  const clusteredBikeIds = useMemo(() => {
    const ids = new Set();
    clusters?.forEach((cluster) => {
      cluster.bikes?.forEach((bike) => {
        const id = bike._id || bike;
        if (id) ids.add(String(id));
      });
    });
    return ids;
  }, [clusters]);

  const filteredItems = useMemo(() => {
    const clusterItems = clusters?.map(c => ({ ...c, isCluster: true })) || [];
    const bikeItems = bikes?.filter(b => !clusteredBikeIds.has(String(b._id))).map(b => ({ ...b, isCluster: false })) || [];

    const combined = [...clusterItems, ...bikeItems];

    return combined.filter(item => {
      const areaId = item.isCluster ? item.area_id?._id || item.area_id : item.area_id;
      const areaMatch =
        selectedArea === "all" ||
        String(areaId) === String(selectedArea);

      const ccVal = item.isCluster ? item.bikes?.[0]?.cc || 125 : item.cc;
      const ccMatch =
        ccFilter === "all" ||
        (ccFilter === "under125" && ccVal <= 125) ||
        (ccFilter === "125to150" && ccVal > 125 && ccVal <= 150) ||
        (ccFilter === "above150" && ccVal > 150);

      const statusMatch =
        statusFilter === "all" || (item.isCluster ? "available" === statusFilter : item.status === statusFilter);

      return areaMatch && ccMatch && statusMatch;
    });
  }, [clusters, bikes, clusteredBikeIds, selectedArea, ccFilter, statusFilter]);

  const clusterItems = useMemo(() => {
    return filteredItems.filter((item) => item.isCluster);
  }, [filteredItems]);

  const bikeItems = useMemo(() => {
    return filteredItems.filter((item) => !item.isCluster);
  }, [filteredItems]);

  const clearTimeFilter = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("start");
    params.delete("end");
    // This updates the URL; React detects the change and re-renders
    navigate(`/catalog?${params.toString()}`);
  };
  const handleBookNow = (bikeId, isCluster = false) => {
    const params = new URLSearchParams();
    if (urlStart) params.set("start", urlStart);
    if (urlEnd) params.set("end", urlEnd);
    if (selectedArea !== "all") params.set("area", selectedArea);
    if (isCluster) params.set("type", "cluster");

    navigate(`/book/${bikeId}?${params.toString()}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 120, damping: 16 },
    },
  };
  return (
    <div className="min-h-screen bg-background pt-[60px]">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-4"
            >
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Full Catalog
              </span>
            </motion.div>
            <h1 className="font-display text-4xl md:text-5xl text-gradient-sunset mb-4">
              Bike Catalog
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Browse our complete collection of scooters and bikes available for
              rent
            </p>
          </motion.div>

          {/* Filters Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card/80 backdrop-blur-md border border-border rounded-2xl p-6 mb-10 shadow-golden"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Area Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Location
                  </label>
                  <Select
                    key={selectedArea}
                    value={selectedArea}
                    onValueChange={setSelectedArea}
                  >
                    <SelectTrigger className="bg-input border-border h-12">
                      <SelectValue placeholder="All Areas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Areas</SelectItem>
                      {areas?.map((area) => (
                        <SelectItem key={area._id} value={area._id}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* CC Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-secondary" />
                    Engine Size
                  </label>
                  <Select value={ccFilter} onValueChange={setCcFilter}>
                    <SelectTrigger className="bg-input border-border h-12">
                      <SelectValue placeholder="All CC" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All CC</SelectItem>
                      <SelectItem value="under125">Up to 125cc</SelectItem>
                      <SelectItem value="125to150">125cc - 150cc</SelectItem>
                      <SelectItem value="above150">Above 150cc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Filter className="w-4 h-4 text-accent" />
                    Status
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-input border-border h-12">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="booked">On Rent</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* View Toggle & Count */}
              <div className="flex items-end gap-4">
                <div className="flex bg-muted rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={viewMode === "grid" ? "gradient-sunset" : ""}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "gradient-sunset" : ""}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
                <div className="h-12 px-4 bg-muted/50 rounded-lg flex items-center border border-border">
                  <span className="text-muted-foreground whitespace-nowrap">
                    {bikesLoading || clustersLoading
                      ? "Loading..."
                      : `${filteredItems.length} categories`}
                  </span>
                </div>
              </div>

              <div className="flex items-end gap-4">
                {/* Add this block near your other filter dropdowns */}
                {/* This button only pops up when a time filter is active */}
                {(urlStart || urlEnd) && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearTimeFilter}
                      className="border-dashed border-primary text-primary hover:bg-primary/5 gap-2 h-10 px-4 rounded-xl"
                    >
                      <XCircle className="w-4 h-4" />
                      Clear Time Filter
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Bikes Display */}
          {bikesLoading || clustersLoading ? (
            <div
              className={`grid ${
                viewMode === "grid"
                  ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              } gap-6`}
            >
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-card border border-border rounded-2xl overflow-hidden"
                >
                  <Skeleton className="h-48 w-full" />
                  <div className="p-5">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <motion.div className="text-center py-16">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Bike className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
              </motion.div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Vehicles Found
              </h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedArea("all");
                  setCcFilter("all");
                  setStatusFilter("all");
                }}
                className="border-primary text-primary hover:bg-primary/10"
              >
                Clear Filters
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-16">
              {/* Premium Category Pools Section */}
              {clusterItems.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-border/60 pb-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold font-display text-foreground tracking-wide">
                        Premium Category Pools
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Book a category pool where the admin assigns an available vehicle at pickup (Honda Activa, Suzuki Access, etc.)
                      </p>
                    </div>
                  </div>

                  <motion.div
                    className={`grid ${
                      viewMode === "grid"
                        ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        : "grid-cols-1"
                    } gap-6`}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <AnimatePresence initial={false}>
                      {clusterItems.map((item) => (
                        <ClusterCard
                          key={item._id}
                          cluster={item}
                          viewMode={viewMode}
                          urlStart={urlStart}
                          urlEnd={urlEnd}
                          handleBookNow={handleBookNow}
                          getAreaName={getAreaName}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </div>
              )}

              {/* Individual Fleet Vehicles Section */}
              {bikeItems.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-border/60 pb-3">
                    <div className="p-2 bg-secondary/10 rounded-xl">
                      <Bike className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold font-display text-foreground tracking-wide">
                        Individual Fleet Vehicles
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Select and reserve a specific vehicle model and number plate from our available active fleet
                      </p>
                    </div>
                  </div>

                  <motion.div
                    className={`grid ${
                      viewMode === "grid"
                        ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        : "grid-cols-1"
                    } gap-6`}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <AnimatePresence initial={false}>
                      {bikeItems.map((item) => (
                        <BikeCard
                          key={item._id}
                          bike={item}
                          viewMode={viewMode}
                          urlStart={urlStart}
                          urlEnd={urlEnd}
                          handleBookNow={handleBookNow}
                          getAreaName={getAreaName}
                          setHoveredBike={setHoveredBike}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};


export default Catalog;
