import Problem from "../models/ProblemSchema.js"
 export const  create= async (req,res)=>{
     try {
        const userData= new Problem(req.body);
        if(!userData){
            return res.status(400).json({msg:"Problem data is not found"});
        }
        const saveData= await userData.save();
        res.status(200).send({msg:"Problem data saved sucessfully"});

     } catch (error) {
        res.status(500).send({msg:"Error in Controller",error});
     }
 };

 // to fectch the data;
 export const getAll = async (req, res) => {
    try {
        console.log("Fetching all problems");
        const problemData = await Problem.find();
        console.log(`Found ${problemData ? problemData.length : 0} problems`);

        if (!problemData || problemData.length === 0) {
            return res.status(404).send({ msg: "No problems found in database" });
        }

        res.status(200).json(problemData);
    } catch (error) {
        console.error("Error in getAll:", error);
        return res.status(500).json({ msg: 'Error in fetching the data in crud', error: error.message });
    }
};

 // to fetch single problem
 export const getOne = async(req, res) => {
    try {
        // Set CORS headers specifically for this endpoint
        const origin = req.headers.origin;
        res.header('Access-Control-Allow-Origin', origin || '*');
        res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.header('Access-Control-Allow-Credentials', 'true');

        // Handle preflight OPTIONS request
        if (req.method === 'OPTIONS') {
            return res.status(204).end();
        }

        const id = req.params.id;
        console.log(`Fetching problem with ID: ${id}`);

        const ProblemExits = await Problem.findById(id);
        if(!ProblemExits) {
            console.log(`Problem with ID ${id} not found`);
            return res.status(404).json({msg: "Problem with given id is not found"});
        }

        console.log(`Successfully found problem: ${ProblemExits.title}`);
        return res.status(200).json(ProblemExits);
    } catch (error) {
        console.error(`Error fetching problem: ${error.message}`);
        return res.status(500).json({
            msg: 'Error in fetching the single data in crud',
            error: error.message
        });
    }
 };

 // to update the data;
 export const update= async(req,res)=>{
   try {
      const id= req.params.id;
      const ProblemFind=await Problem.findById(id);
      if(!ProblemFind) return res.status(404).send({msg:"Problem with given id is not found"});
      const UpdateData= await Problem.findByIdAndUpdate(id,req.body,{new:true});
      res.status(200).send(UpdateData);
   } catch (error) {
    return res.status(500).json({ msg: 'Error in updating in crud' });
   }
 }

 // delete the Problem;

 export const deleteProb= async(req,res)=>{
     try {
        const id= req.params.id;
        const isExit= Problem.findById(id);
        if(!isExit) return res.status(404).send({msg:"Problem is not found with this id"});
        await Problem.findByIdAndDelete(id);
        res.status(200).send({msg:"Problem deleted sucessfully"});
     } catch (error) {
        return res.status(500).json({ msg: 'Error in deleting in crud' });
     }
 }
