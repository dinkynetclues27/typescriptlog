import React, { useState, useEffect, FC } from 'react';
import VendorSelect from './VendorSelection';
import axios from 'axios'
import SuccessFail from './SuccessFail';
import LogDisplay from './LogDisplay';

interface Startprop {
    vendor_name : string;
    created_at : string
}
const Start:React.FC = () =>{
    const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
    const [success, setSuccess] = useState<Startprop[]>([]);
    const [fail, setFail] = useState<Startprop[]>([]);
    const [showLogs, setShowLogs] = useState<boolean>(false);
    const [showsuccess, setshowsuccess] = useState<boolean>(false);
    const [showFail, setShowFail] = useState<boolean>(false);
  
    
  const fetchSuccess = async () => {
    try {
      const response = await axios.get<Startprop[]>("http://localhost:4000/filesuccess");
      setSuccess(response.data);
      setshowsuccess(true);
      setShowFail(false);
      setShowLogs(false);
    } catch (error) {
      console.error('Error fetching success data:', error);
    }
  };

  const fetchFail = async () => {
    try {
      const response = await axios.get<Startprop[]>("http://localhost:4000/filefail");
      setFail(response.data);
      setshowsuccess(false);
      setShowFail(true);
      setShowLogs(false);
    } catch (error) {
      console.error('Error fetching fail data:', error);
    }
  };

  const onCurrentClick = () => {
    setShowLogs(true);
    setshowsuccess(false);
    setShowFail(false);
  };

  const handleSelect = (vendor:string) => {
    if (vendor && !selectedVendors.includes(vendor)) {
      setSelectedVendors([...selectedVendors, vendor]);
      axios.post("http://localhost:4000/insertpro", { vendor })
        .then(() => {
          console.log(`Products processing started for vendor: ${vendor}`);
        })
        .catch((error) => {
          console.error('Error inserting products:', error);
        });
    }
  };

  const getColor = (type:string):string => {
    switch (type) {
      case 'insert':
        return 'green';
      case 'update':
        return '#ADD8E6';
      case 'skip':
        return 'pink';
      default:
        return 'black';
    }
  };

    return(
    <div className="container start-container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <VendorSelect onVendorSelect={handleSelect} />
            <div className="text-center">
              <button className="btnn" style={{ border: '1px solid #37f713' }} onClick={fetchSuccess}>Success</button>
              <button className="btnn" style={{ border: '1px solid #37f713' }} onClick={fetchFail}>Fail</button>
              <button className="btnn" style={{ border: '1px solid #37f713' }} onClick={onCurrentClick} >Current</button>
            </div>
          </div>
          {showsuccess && <SuccessFail data={success} type="success" />}
          {showFail && <SuccessFail data={fail} type="fail" />}
          {showLogs && selectedVendors.map((vendor, index) => (
            <LogDisplay key={index} vendor={vendor} getColor={getColor} />
          ))}
        </div>
      </div>
    </div>
    )
}

export default Start;

// import React, { useState } from 'react';
// import axios from 'axios';
// import VendorSelection from './VendorSelection';
// import LogDisplay from './LogDisplay';
// import SuccessFail from './SuccessFail';

// interface Product {
//   vendor_name: string;
//   created_at: string;
// }

// const Start: React.FC = () => {
//   const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
//   const [success, setSuccess] = useState<Product[]>([]);
//   const [fail, setFail] = useState<Product[]>([]);
//   const [showLogs, setShowLogs] = useState<boolean>(false);
//   const [showSuccess, setShowSuccess] = useState<boolean>(false);
//   const [showFail, setShowFail] = useState<boolean>(false);

//   const fetchSuccess = async () => {
//     try {
//       const response = await axios.get<Product[]>("http://localhost:4000/filesuccess");
//       setSuccess(response.data);
//       setShowSuccess(true);
//       setShowFail(false);
//       setShowLogs(false);
//     } catch (error) {
//       console.error('Error fetching success data:', error);
//     }
//   };

//   const fetchFail = async () => {
//     try {
//       const response = await axios.get<Product[]>("http://localhost:4000/filefail");
//       setFail(response.data);
//       setShowSuccess(false);
//       setShowFail(true);
//       setShowLogs(false);
//     } catch (error) {
//       console.error('Error fetching fail data:', error);
//     }
//   };

//   const onCurrentClick = () => {
//     setShowLogs(true);
//     setShowSuccess(false);
//     setShowFail(false);
//   };

//   const handleSelect = (vendor: string) => {
//     if (vendor && !selectedVendors.includes(vendor)) {
//       setSelectedVendors([...selectedVendors, vendor]);
//       axios.post("http://localhost:4000/insertpro", { vendor })
//         .then(() => {
//           console.log(`Products processing started for vendor: ${vendor}`);
//         })
//         .catch((error) => {
//           console.error('Error inserting products:', error);
//         });
//     }
//   };

//   const getColor = (type: string): string => {
//     switch (type) {
//       case 'insert':
//         return 'green';
//       case 'update':
//         return '#ADD8E6';
//       case 'skip':
//         return 'pink';
//       default:
//         return 'black';
//     }
//   };

//   return (
//     <div className="container start-container">
//       <div className="row justify-content-center">
//         <div className="col-md-6">
//           <div className="card">
//             <VendorSelection onVendorSelect={handleSelect} />
//             <div className="text-center">
//               <button className="btnn" style={{ border: '1px solid #37f713' }} onClick={fetchSuccess}>Success</button>
//               <button className="btnn" style={{ border: '1px solid #37f713' }} onClick={fetchFail}>Fail</button>
//               <button className="btnn" style={{ border: '1px solid #37f713' }} onClick={onCurrentClick} >Current</button>
//             </div>
//           </div>
//           {showSuccess && <SuccessFail data={success} type="success" />}
//           {showFail && <SuccessFail data={fail} type="fail" />}
//           {showLogs && selectedVendors.map((vendor, index) => (
//             <LogDisplay key={index} vendor={vendor} getColor={getColor} />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Start;
