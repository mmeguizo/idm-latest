const Objectives = require("../models/objective");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const Goals = require("../models/goals");
const Files = require("../models/fileupload");
module.exports = (router) => {
  router.get("/getAllObjectivesForDashboard", async (req, res) => {
    let data = [];
    try {
      let objectivesCount = await Objectives.countDocuments();
      let objectiveCompleted = await Objectives.countDocuments({
        complete: true,
        deleted: false,
      });
      let objectiveUncompleted = await Objectives.countDocuments({
        complete: false,
        deleted: false,
      });
      let objectivesData = await Objectives.find({ deleted: false }).select({
        _id: 0,
        id: 1,
        complete: 1,
        date_added: 1,
      });
      data.push({
        objectivesCount: objectivesCount,
        objectiveCompleted: objectiveCompleted,
        objectiveUncompleted: objectiveUncompleted,
        objectivesData: objectivesData,
      });
      res.json({ success: true, data: data });
    } catch (error) {
      res.json({ success: false, message: error });
    }
  });

  router.get("/getAllObjectives", (req, res) => {
    Objectives.find({ deleted: false }, (err, Objectives) => {
      if (err) {
        return res.status(500).json({ success: false, message: err });
      }

      if (!Objectives || Objectives.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No Objectives found.",
          Objectives: [],
        });
      }
      return res.status(200).json({ success: true, Objectives });
    }).sort({ _id: -1 });
  });

  router.put("/updateobjectivecompletion", (req, res) => {
    let data = req.body;
    Objectives.findOne(
      {
        id: data.id,
      },
      (err, ObjectivesResults) => {
        if (err) throw err;
        Objectives.findOneAndUpdate(
          { id: data.id },
          { complete: !ObjectivesResults.complete },
          { upsert: true, select: "-__v" },
          (err, response) => {
            if (err) return res.json({ success: false, message: err.message });
            if (response) {
              res.json({
                success: true,
                message: " Successfully Changed",
                data: response,
              });
            } else {
              res.json({
                success: false,
                message: "Error Occured",
              });
            }
          }
        );
      }
    );
  });

  router.get("/getAllByIdObjectives/:id", (req, res) => {
    Objectives.find(
      { deleted: false, goalId: req.params.id },
      (err, Objectives) => {
        if (err) {
          return res.status(500).json({ success: false, message: err });
        }

        if (!Objectives || Objectives.length === 0) {
          return res.json({
            success: false,
            message: "No Objectives found.",
            Objectives: [],
          });
        }
        return res.status(200).json({ success: true, Objectives });
      }
    ).sort({ _id: -1 });
  });

  router.post("/findObjectivesById", (req, res) => {
    Objectives.findOne(
      { id: req.body.id },
      "-deleted -__v",
      function (err, Objectives) {
        if (err) {
          res.json({ success: false, message: "Objectives not found" });
        } else {
          if (!Objectives) {
            res.json({ success: false, message: "No Objectives found." });
          } else {
            res.json({ success: true, Objectives: Objectives });
          }
        }
      }
    );
  });

  router.post("/addObjectives", (req, res) => {
    const objectivesData = req.body;

    if (!objectivesData) {
      return res.json({
        success: false,
        message: "You must provide an Objectives and Action Plan Information",
      });
    }

    const ObjectivesDataRequest = {
      id: uuidv4(),
      ...objectivesData,
    };
    Objectives.create(ObjectivesDataRequest, function (err, data) {
      if (err) {
        if (err.code === 11000) {
          res.json({
            success: false,
            message:
              " Objectives and Action Plan Objectives Name already exists ",
            err: err.message,
          });
        } else if (err.errors) {
          const errors = Object.keys(err.errors);
          res.json({ success: false, message: err.errors[errors[0]].message });
        } else {
          res.json({
            success: false,
            message:
              "Could not add  Objectives and Action Plan Error : " +
              err.message,
          });
        }
      } else {
        Goals.updateOne(
          { id: req.body.goalId },
          { $push: { objectives: data.id } },
          function (err, datas) {
            if (err) {
              res.json({ success: false, message: "Could not add Objectives" });
            } else {
              res.json({
                success: true,
                message:
                  "This  Objectives and Action Plan Objectives is successfully Added ",
                data: { Objectives: data, Goals: datas },
              });
            }
          }
        );
      }
    });
  });

  router.put("/deleteObjectives", (req, res) => {
    let data = req.body;

    Objectives.deleteOne(
      {
        id: data.id,
      },
      (err, results) => {
        if (err) {
          res.json({
            success: false,
            message: "Could not Delete Objectives" + err,
          });
        } else {
          res.json({
            success: true,
            message: " Successfully Deleted the Objectives",
            data: results,
          });
        }
      }
    );
  });

  router.put("/setInactiveObjectives", async (req, res) => {
    const data = req.body;

    try {
      // Find the objective
      const objective = await Objectives.findOne({ id: data.id });
      if (!objective) {
        return res.json({ success: false, message: "Objective not found" });
      }

      // Update the objective
      const updatedObjective = await Objectives.findOneAndUpdate(
        { id: data.id },
        { deleted: true, status: "inactive" },
        { new: true, upsert: true, select: "-__v" } // Use { new: true } to return the updated document
      );

      if (!updatedObjective) {
        return res.json({
          success: false,
          message: "Could not update objective",
        });
      }

      // Update the files
      const updateFilesResult = await Files.updateMany(
        { for: "files", status: true, objective_id: data.id },
        { $set: { status: false } }
      );

      if (updateFilesResult.acknowledged) {
        return res.json({
          success: true,
          message: "Successfully deleted objectives including its files...",
          data: updatedObjective,
        });
      } else {
        return res.json({
          success: false,
          message: "Nothing were updated",
        });
      }
    } catch (err) {
      return res.json({ success: false, message: err.message });
    }
  });

  router.put("/changeObjectivesStatus", (req, res) => {
    let data = req.body;
    Objectives.findOne(
      {
        id: data.id,
      },
      (err, Objectives) => {
        if (err) throw err;
        Objectives.findOneAndUpdate(
          { id: data.id },
          { status: Objectives.status === "active" ? "inactive" : "active" },
          { upsert: true, select: "-__v" },
          (err, response) => {
            if (err) return res.json({ success: false, message: err.message });
            if (response) {
              res.json({
                success: false,
                message: response,
              });
            } else {
              res.json({
                success: true,
                message: " Successfully Objectives set Status",
                data: response,
              });
            }
          }
        );
      }
    );
  });

  router.put("/updateObjectives", async (req, res) => {
    let { id, ...ObjectivesData } = req.body;

    Objectives.findOneAndUpdate(
      { id: id },
      ObjectivesData,
      { new: true },
      (err, response) => {
        if (err) return res.json({ success: false, message: err.message });
        if (response) {
          res.json({
            success: true,
            message: "Objectives Information has been updated!",
            data: response,
          });
        } else {
          res.json({
            success: true,
            message: "No Objectives has been modified!",
            data: response,
          });
        }
      }
    );
  });

  return router;
};
