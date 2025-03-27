// ... existing code ...

// Around line 149
const fetchBoundariesFromDB = async () => {
  try {
    // Change the URL from localhost:3000 to localhost:5001
    const response = await fetch('http://localhost:5001/api/wilaya-boundaries');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // ... rest of the function
  } catch (error) {
    console.error('Error fetching boundaries:', error);
  }
};

// ... existing code ...