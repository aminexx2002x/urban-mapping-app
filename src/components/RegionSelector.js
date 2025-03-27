// ... existing code ...

// Replace the placeholder with your actual API endpoint
fetch('http://localhost:3001/api/administrative-regions')  // Update this URL to your actual API endpoint
  .then(async response => {
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response details:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    // Process the data
    console.log('Successfully fetched regions:', data);
  })
  .catch(error => {
    console.error('Failed to fetch administrative regions:', error);
    // Add user-friendly error handling here
    // You might want to set some state to show an error message to the user
  });

// ... existing code ...