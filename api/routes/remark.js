require("dotenv").config();
const Remarks = require("../models/remarks");

const chatHistories = new Map();
module.exports = (router) => {
  router.get("/remarks/:objectiveId", async (req, res) => {
    try {
      console.log({ id: req.params.objectiveId, remarks: "remarks" });

      const remarks = await Remarks.find({
        objectiveId: req.params.objectiveId,
      });
      res.status(200).json(remarks);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post("/remarks", async (req, res) => {
    try {
      console.log(req.body);

      const newRemark = new Remarks(req.body);
      const savedRemark = await newRemark.save();
      res.status(201).json(savedRemark);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put("/remarks/:id", async (req, res) => {
    try {
      const updatedRemark = await Remarks.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      res.status(200).json(updatedRemark);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete("/remarks/:id", async (req, res) => {
    try {
      await Remarks.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Remark deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
