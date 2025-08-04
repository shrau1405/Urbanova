// Import Firestore database reference from firebase.js
import { db } from './firebase.js';

// Import Firestore functions from CDN
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Get DOM elements for offer table and filter dropdowns
const offerList = document.getElementById("offerList"); // Table body where offers will be displayed
const categoryFilter = document.getElementById("categoryFilter"); // Category filter dropdown
const floorFilter = document.getElementById("floorFilter"); // Floor filter dropdown

// Array to store all offer documents fetched from Firestore
let allOffers = [];

// Load offers from Firestore and initialize page
async function loadOffers() {
  const snapshot = await getDocs(collection(db, "offers")); // Get all docs from 'offers' collection
  allOffers = snapshot.docs.map(doc => doc.data()); // Convert each doc into JS object
  populateFilters(); // Populate dropdowns with unique categories/floors
  renderTable();     // Render the offers in the table
}

// Populate category and floor dropdowns with unique values
function populateFilters() {
  // Get unique categories and floors using Set
  const categories = [...new Set(allOffers.map(o => o.category))];
  const floors = [...new Set(allOffers.map(o => o.floor))];

  // Add default "All" option
  categoryFilter.innerHTML = `<option value="">All</option>`;
  floorFilter.innerHTML = `<option value="">All</option>`;

  // Add each category as an option
  categories.forEach(cat => {
    categoryFilter.innerHTML += `<option value="${cat}">${cat}</option>`;
  });

  // Define custom floor order for better sorting
  const floorOrder = ["Ground", "1st", "2nd", "3rd"];

  // Sort floors using custom order
  floors.sort((a, b) => floorOrder.indexOf(a) - floorOrder.indexOf(b));

  // Add each floor as an option
  floors.forEach(floor => {
    floorFilter.innerHTML += `<option value="${floor}">${floor}</option>`;
  });
}

// Render the offer table based on selected filters
function renderTable() {
  const selectedCategory = categoryFilter.value; // Current selected category
  const selectedFloor = floorFilter.value;       // Current selected floor

  // Filter offers based on selected category and floor
  const filtered = allOffers.filter(o => {
    const catMatch = !selectedCategory || o.category === selectedCategory; // Match or allow all
    const floorMatch = !selectedFloor || o.floor === selectedFloor;       // Match or allow all
    return catMatch && floorMatch; // Include only if both match
  });

  // Show fallback message if no offers found
  offerList.innerHTML = filtered.length === 0
    ? `<tr><td colspan="8" style="padding: 20px; text-align: center;">No offers available.</td></tr>`

    // Otherwise, generate HTML rows for each offer
    : filtered.map(o => `
      <tr>
        <td>${o.shopName}</td>
        <td>${o.category}</td>
        <td>${o.floor}</td>
        <td>${o.offerTitle}</td>
        <td>${o.description}</td>
        <td>${o.startDate}</td>
        <td>${o.endDate}</td>
        <td>${o.discount}</td>
      </tr>
    `).join(""); // Combine all rows into a single string
}

// When filters change, re-render the table with updated data
categoryFilter.addEventListener("change", renderTable);
floorFilter.addEventListener("change", renderTable);

// Load all offers and initialize dropdowns/table when page loads
window.onload = loadOffers;
