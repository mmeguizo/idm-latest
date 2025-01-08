require("dotenv").config();
const Remarks = require("../models/remarks");

const chatHistories = new Map();
module.exports = (router) => {
  router.get("/remarks/:objectiveId", async (req, res) => {
    try {
      const remarks = await Remarks.aggregate([
        {
          $match: {
            objectiveId: req.params.objectiveId,
            deleted: false,
          },
        },
        {
          $lookup: {
            as: "users",
            from: "users",
            foreignField: "id",
            localField: "userId",
          },
        },
        {
          $unwind: {
            path: "$users",
          },
        },
        {
          $project: {
            remarks: 1,
            "users.firstname": 1,
            "users.lastname": 1,
            createdAt: 1,
            userId: 1,
            objectiveId: 1,
            _id: 1,
          },
        },
      ]).sort({ createdAt: -1 });
      res.status(200).json(remarks);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post("/remarks", async (req, res) => {
    try {
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
