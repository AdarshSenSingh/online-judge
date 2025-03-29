useEffect(() => {
  console.log("Backend URL being used:", url_3);

  fetchSubmissions();
  
  // Set up polling for submissions in processing state
  const pollingInterval = setInterval(() => {
    // Check if we have any submissions in processing state
    if (submissions.some(sub => 
        sub.verdict?.status === 'Processing' || 
        sub.status === 'pending')) {
      console.log("Polling for updates on processing submissions");
      fetchSubmissions();
    }
  }, 3000); // Poll every 3 seconds
  
  // Clear the refresh flag if it exists
  if (localStorage.getItem('refreshSubmissions') === 'true') {
    localStorage.removeItem('refreshSubmissions');
    fetchSubmissions();
  }
  
  return () => {
    clearInterval(pollingInterval);
  };
}, [submissions]); // Add submissions as a dependency to react to changes