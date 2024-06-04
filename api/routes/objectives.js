const Objectives = require("../models/objective");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const Goals = require("../models/goals");
const ObjectId = mongoose.Types.ObjectId;

module.exports = (router) => {
  router.get("/getAllObjectives", (req, res) => {
    // Search database for all blog posts
    Objectives.find({ deleted: false }, (err, Objectives) => {
      // Check if error was found or not

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
    }).sort({ _id: -1 }); // Sort blogs from newest to oldest
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
                message: " Successfully Objectives set",
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
    // Search database for all blog posts
    Objectives.find(
      { deleted: false, goalId: req.params.id },
      (err, Objectives) => {
        // Check if error was found or not
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
      }
    ).sort({ _id: -1 }); // Sort blogs from newest to oldest
  });

  router.post("/findObjectivesById", (req, res) => {
    Objectives.findOne(
      { id: req.body.id },
      "-deleted -__v",
      function (err, Objectives) {
        if (err) {
          res.json({ success: false, message: "Objectives not found" });
        } else {
          // Check if blogs were found in database
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

  router.put("/setInactiveObjectives", (req, res) => {
    let data = req.body;

    Objectives.findOne(
      {
        id: data.id,
      },
      (err) => {
        if (err) throw err;
        Objectives.findOneAndUpdate(
          { id: data.id },
          { deleted: true, status: "inactive" },
          { upsert: true, select: "-__v" },
          (err, response) => {
            if (err) return res.json({ success: false, message: err.message });
            if (response) {
              res.json({
                success: true,
                message: " Successfully Delete Objectives",
                data: response,
              });
            } else {
              res.json({
                success: false,
                message: "Could Delete Objectives" + err,
              });
            }
          }
        );
      }
    );
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
