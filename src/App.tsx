// import { useSDK } from "@metamask/sdk-react";
// import React, { useState } from "react";

// const App: React.FC = () => {
//   const [account, setAccount] = useState<string>();
//   const { sdk, connected, connecting, provider, chainId } = useSDK();

//   const connect = async () => {
//     try {
//       const accounts = await sdk?.connect();
//       setAccount(accounts?.[0]);
//     } catch (err) {
//       console.warn("failed to connect..", err);
//     }
//   };

//   return (
//     <div className="App">
//       <button style={{ padding: 10, margin: 10 }} onClick={connect}>
//         Connect
//       </button>
//       {connected && (
//         <div>
//           <>
//             {chainId && `Connected chain: ${chainId}`}
//             <p></p>
//             {account && `Connected account: ${account}`}
//           </>
//         </div>
//       )}
//     </div>
//   );
// };

// export default App;

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './home'; // assuming Home is already created
import Receiver from './receiver'; // import the new Receiver component

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/receiver" element={<Receiver />} />
      </Routes>
    </Router>
  );
};

export default App;
