// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { io } from 'socket.io-client';

// const Start = () => {
//   const [vendors, setVendors] = useState([]);
//   const [log, setLog] = useState([]);

//   useEffect(() => {
//     const fetchVendors = async () => {
//       try {
//         const response = await axios.get("http://localhost:4000/getvendor");
//         setVendors(response.data);
//       } catch (error) {
//         console.error("Error fetching vendors:", error);
//       }
//     };

//     fetchVendors();

//     const socket = io("http://localhost:4000");

//     socket.on('productInserted', (data) => {
//       setLog((prevLog) => [...prevLog, data]);
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   const handleVendorChange = (event) => {
//     setSelectedVendor(event.target.value);
//   };

//   const handleSelectClick = async () => {
//     if (selectedVendor) {
//       try {
//         const response = await axios.post("http://localhost:4000/uploadcsv", { vendor: selectedVendor });
//         console.log('CSV uploaded:', response.data);
//       } catch (error) {
//         console.error("Error uploading CSV:", error);
//       }
//     }
//   };

//   return (
//     <div className="container start-container">
//       <div className="row justify-content-center">
//         <div className="col-md-6">
//           <div className="card">
//             <div className="form-group">
//               <label htmlFor="numque">Select Vendor:</label>
//               <div className="select-wrapper">
//                 <select id="numque" className="form-control" onChange={handleVendorChange}>
//                   <option value="">--Select Vendor--</option>
//                   {vendors.map((vendor, index) => (
//                     <option key={index} value={vendor}>{vendor}</option>
//                   ))}
//                 </select>
//                 <span className="select-icon">&#9662;</span>
//               </div>
//             </div>
//             <div className="text-center">
//               <button className="btnn" style={{ border: '1px solid #37f713' }} onClick={handleSelectClick}>Select</button>
//             </div>
//           </div>
//         </div>
//         <div className="col-md-6">
//           <div className="card">
//             <div className="form-group">
//               <label htmlFor="log">Live Log:</label>
//               <div className="log-wrapper">
//                 <ul id="log" className="log-list">
//                   {log.map((entry, index) => (
//                     <li key={index}>{`Product ID: ${entry.product_id}, Name: ${entry.product_name}, Quantity: ${entry.quantity}, Price: ${entry.price}`}</li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Start;


