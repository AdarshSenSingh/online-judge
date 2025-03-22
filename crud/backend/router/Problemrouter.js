import express from "express";
import { create, deleteProb, getAll, getOne ,update} from "../controllers/problemController.js";
const route= express.Router();

route.post("/create",create);
route.get("/getAll",getAll);
route.get("/getOne/:id",getOne);
route.put("/update/:id",update);
route.delete("/delete/:id",deleteProb);


export default route;