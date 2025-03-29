// Submit code function - simplified without token
const submitCode = async () => {
  if (!code.trim()) {
    toast.error("Please write some code before submitting");
    return;
  }
  
  setIsSubmitting(true);
  setVerdict(null);
  
  try {
    const problemId = id; // Get problem ID from URL parameter
    const verdictUrl = `${url_3}/submit`;
    
    console.log("Submitting code to:", verdictUrl);
    console.log("Problem ID:", problemId);
    console.log("Language:", language);
    
    // Make submission request without authentication
    const response = await axios.post(
      verdictUrl,
      {
        language: language,
        code: code,
        problemId: problemId,
        problemTitle: problemTitle || 'Unknown Problem'
      }
    );
    
    console.log("Submission response:", response.data);
    
    if (response.data.success && response.data.result) {
      // Extract the verdict from the response
      const verdictData = response.data.result.verdict;
      console.log("Verdict data:", verdictData);
      
      // Set the verdict state
      setVerdict(verdictData);
      console.log("Setting verdict to:", verdictData);
      
      // Set hasSubmitted to true
      setHasSubmitted(true);
      
      // Set a flag to refresh submissions on the result page
      localStorage.setItem('refreshSubmissions', 'true');
      
      // Show success message
      toast.success("Submission processed successfully");
    } else {
      toast.error("Failed to process submission");
    }
  } catch (error) {
    console.error("Error submitting code:", error);
    toast.error(error.response?.data?.error || "Failed to submit code");
  } finally {
    setIsSubmitting(false);
  }
};

const handleFinal = async () => {
  try {
    setLoading(true);
    setVerdict(null);
    
    // First check if the server is reachable
    try {
      await axios.get(`${url_3}/health`);
    } catch (connectionError) {
      throw new Error("Cannot connect to the code execution server. Please check your connection and try again.");
    }
    
    // Make the submission request
    const verdictUrl = `${url_3}/verdict/${problem._id}`;
    console.log("Calling verdict endpoint:", verdictUrl);
    
    const response = await axios.post(
      verdictUrl,
      {
        language: language,
        code: code,
      }
    );
    
    console.log("Submission response:", response.data);
    
    if (response.data.success) {
      // Extract the verdict from the response
      const verdictData = response.data.result?.verdict || response.data.result;
      const submissionId = response.data.submissionId;
      
      console.log("Initial verdict data:", verdictData);
      
      // If verdict is "Processing", poll for updates
      if (verdictData && verdictData.status === "Processing") {
        toast.loading("Processing submission...", { id: "verdict-processing" });
        
        // Poll for verdict updates
        let attempts = 0;
        const maxAttempts = 10;
        const pollInterval = setInterval(async () => {
          try {
            attempts++;
            console.log(`Polling for verdict update (attempt ${attempts}/${maxAttempts})...`);
            
            // Get the latest submission status
            const statusResponse = await axios.get(`${url_3}/submission/${submissionId}`);
            const updatedVerdict = statusResponse.data.verdict;
            
            console.log("Updated verdict:", updatedVerdict);
            
            if (updatedVerdict && updatedVerdict.status !== "Processing") {
              // Clear the polling interval
              clearInterval(pollInterval);
              toast.dismiss("verdict-processing");
              
              // Update the verdict state
              setVerdict(updatedVerdict);
              
              // Set hasSubmitted to true
              setHasSubmitted(true);
              
              // Set a flag to refresh submissions on the result page
              localStorage.setItem('refreshSubmissions', 'true');
              
              // Show success message
              toast.success("Submission processed successfully");
              
              // Navigate to results page after a short delay
              setTimeout(() => {
                navigate('/result');
              }, 1000);
            }
            
            // Stop polling after max attempts
            if (attempts >= maxAttempts) {
              clearInterval(pollInterval);
              toast.dismiss("verdict-processing");
              toast.error("Submission is taking longer than expected. Please check the results page later.");
              
              // Set hasSubmitted to true anyway
              setHasSubmitted(true);
              
              // Navigate to results page
              navigate('/result');
            }
          } catch (error) {
            console.error("Error polling for verdict:", error);
            clearInterval(pollInterval);
            toast.dismiss("verdict-processing");
            toast.error("Error checking submission status");
          }
        }, 2000); // Poll every 2 seconds
      } else {
        // Verdict is already available
        setVerdict(verdictData);
        setHasSubmitted(true);
        localStorage.setItem('refreshSubmissions', 'true');
        toast.success("Submission processed successfully");
        
        // Navigate to results page after a short delay
        setTimeout(() => {
          navigate('/result');
        }, 1000);
      }
    } else {
      toast.error("Failed to process submission");
    }
  } catch (error) {
    console.error("Error submitting solution:", error);
    const errorVerdict = {
      status: "Error",
      message: error.message || "Network error. Please check your connection.",
      results: []
    };
    setVerdict(errorVerdict);
    toast.error(error.message || "Network error. Please check your connection.");
  } finally {
    setLoading(false);
  }
};


