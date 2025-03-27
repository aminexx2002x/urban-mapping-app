// ... existing code ...

// Around line 83
const fetchAdminRegions = async () => {
  try {
    const response = await fetch('http://localhost:5001/api/administrative-regions');
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response details:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    setAdminRegions(data);
  } catch (error) {
    console.error('Failed to fetch administrative regions:', error);
    // Add user-friendly error handling
    setError('Unable to load administrative regions. Please try again later.');
  }
};

// ... existing code ...