import React from 'react';
import ReactDOM from 'react-dom/client';
import Router from './Router';
import AnimatedCursor from "react-animated-cursor";
import './theme/normalize.css';
import './theme/global.css';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { BrowserRouter } from 'react-router-dom';
import { projectFirestore } from './firebase/config';
import { collection, getDocs, updateDoc, query, where } from 'firebase/firestore';


// const updateBeijingSection = async () => {
//   try {
//     // Reference the Firestore collection
//     const collectionRef = collection(projectFirestore, "images");

//     // Create a query to find documents where the section is "<Beijing>"
//     const q = query(collectionRef, where("section", "==", "<Ontario>"));

//     // Get the documents matching the query
//     const snapshot = await getDocs(q);

//     // Iterate over each document and update the section field
//     snapshot.forEach(async (doc) => {
//       const docRef = doc.ref; // Get reference to the document

//       // Update the section field to "beijing"
//       await updateDoc(docRef, {
//         section: "ontario"
//       });
//     });

//     console.log("Section field updated successfully for all '<Beijing>' entries.");
//   } catch (error) {
//     console.error("Error updating section field: ", error);
//   }
// };
// updateBeijingSection();


ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
    <BrowserRouter>
      <AnimatedCursor
        color={"75, 75, 75"}
        trailingSpeed={3}
        outerScale={5.5}
        innerScale={2}
        outerSize={8}
        innerSize={8}
        outerAlpha={0.4}
      />
      <Router />
    <Analytics mode={'production'} />
      <SpeedInsights />
    </BrowserRouter>
  // </React.StrictMode>,
);
