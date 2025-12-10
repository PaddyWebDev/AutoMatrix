// useEffect(() => {
//   async function getLocation() {
//     const location = await getUserLocation();
//     setUserLocation(
//       {
//         lat: location?.lat!,
//         lng: location?.lng!
//       }
//     )
//   }
//   getLocation();
// }, [userLocation])
// console.log(userLocation);

// const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
//   const Radius = 6371; // Radius of the Earth in km
//   const dLat = (lat2 - lat1) * (Math.PI / 180);
//   const dLng = (lng2 - lng1) * (Math.PI / 180);
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
//     Math.sin(dLng / 2) * Math.sin(dLng / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return Radius * c;
// };

// const nearestCenters = useMemo(() => {
//   if (!userLocation || !serviceCenters.length) return [];

//   const centersWithDistance = serviceCenters.map((center: ServiceCenter) => ({
//     ...center,
//     distance: center.latitude && center.longitude
//       ? calculateDistance(userLocation.lat, userLocation.lng, center.latitude, center.longitude)
//       : Infinity,
//   }));

//   return centersWithDistance
//     .filter((center: any) => center.distance !== Infinity)
//     .sort((a: { distance: number; }, b: { distance: number; }) => a.distance - b.distance)
//     .slice(0, 5);
// }, [userLocation, serviceCenters]);
