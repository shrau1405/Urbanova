// Import Firestore database instance from local firebase.js file
import { db } from './firebase.js';

// Import Firestore methods from Firebase CDN
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Get reference to the table body where shop details will be inserted
const floorList = document.getElementById("floorList");

// Helper function to define custom floor ordering for sorting
function getFloorOrderValue(floorName) {
  const order = {
    "Ground": 0,     // Ground floor treated as 0
    "0": 0,          // Alternate way to write ground
    "1st": 1,
    "First": 1,      // Allow both numeric and word formats
    "2nd": 2,
    "Second": 2,
    "3rd": 3,
    "Third": 3,
  };
  return order[floorName.trim()] ?? 99; // Return 99 for unknown/unlisted floors
}

// Asynchronous function to fetch and display floor-wise shop details
async function fetchFloorWiseDetails() {
  // Fetch all documents from the "shops" collection in Firestore
  const snapshot = await getDocs(collection(db, "shops"));

  // Extract shop data from each document
  const shops = snapshot.docs.map(doc => doc.data());

  // Group shops by their floor
  const floorMap = {};
  shops.forEach(shop => {
    const floor = shop.floor || "Unknown"; // Use "Unknown" if floor is missing
    if (!floorMap[floor]) floorMap[floor] = []; // Initialize array for that floor
    floorMap[floor].push(shop.shopName); // Add shop name to the appropriate floor array
  });

  // Sort floors using custom order defined earlier
  const sortedFloors = Object.entries(floorMap).sort(
    ([a], [b]) => getFloorOrderValue(a) - getFloorOrderValue(b)
  );

  // Clear existing table rows
  floorList.innerHTML = "";

  // Populate the table with sorted floor data
  sortedFloors.forEach(([floor, shopNames]) => {
    const row = document.createElement("tr"); // Create a new table row
    row.innerHTML = `
      <td>${floor}</td>
      <td>${shopNames.join(", ")}</td>  <!-- Join shop names with commas -->
    `;
    floorList.appendChild(row); // Add row to the table body
  });
}

// Call the fetch function once the DOM is fully loaded
window.addEventListener("DOMContentLoaded", fetchFloorWiseDetails);
