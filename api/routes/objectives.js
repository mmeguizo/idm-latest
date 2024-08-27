const Objectives = require("../models/objective");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const Goals = require("../models/goals");
const Files = require("../models/fileupload");
const { logger } = require("../middleware/logger");
const objective = require("../models/objective");
const { log } = require("winston");

module.exports = (router) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  router.get("/getObjectiveForCalendar", (req, res) => {
    Objectives.aggregate([
      { $match: { deleted: false } },
      {
        $lookup: {
          as: "goals",
          from: "goals",
          foreignField: "_id",
          localField: "goal_Id",
        },
      },
      { $unwind: { path: "$goals", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          as: "users",
          from: "users",
          foreignField: "id",
          localField: "createdBy",
        },
      },
      { $unwind: { path: "$users", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id: 1,
          "goals.goals": 1,
          timetable: 1,
          "users.username": 1,
          "users.profile_pic": 1,
          "users.department": 1,
        },
      },
    ])
      .sort({ createdAt: -1 })
      .then((objectives) => {
        // Success
        res.status(200).json({
          success: true,
          data: objectives,
        });
      })
      .catch((err) => {
        // Error handling
        console.error("Error fetching objectives with goals and users:", err);
        res
          .status(500)
          .json({ error: "Internal server error Or Token Expired" });
      });
  });

  router.get(
    "/getAllByIdObjectivesWithGoalsAndUsers",

    (req, res) => {
      Objectives.aggregate([
        { $match: { deleted: false } },
        {
          $lookup: {
            as: "goals",
            from: "goals",
            foreignField: "_id",
            localField: "goal_Id",
          },
        },
        { $unwind: { path: "$goals", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            as: "users",
            from: "users",
            foreignField: "id",
            localField: "createdBy",
          },
        },
        { $unwind: { path: "$users", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            "goals.objectives": 0,
            "goals.objectiveBudget": 0,
          },
        },
      ])
        .sort({ createdAt: -1 })
        .then((objectives) => {
          // Success
          res.status(200).json({
            success: true,
            data: objectives,
          });
        })
        .catch((err) => {
          // Error handling
          console.error("Error fetching objectives with goals and users:", err);
          res
            .status(500)
            .json({ error: "Internal server error Or Token Expired" });
        });
    }
  );

  router.get("/getAllObjectivesBudget", async (req, res) => {
    try {
      let objectives = await Objectives.aggregate([
        {
          $match: {
            deleted: false,
          },
        },
        {
          $group: {
            _id: null,
            totalObjectiveBudget: {
              $sum: "$budget",
            },
          },
        },
      ]);

      if (objectives.length > 0) {
        res.json({
          success: true,
          data: objectives[0].totalObjectiveBudget,
        });
      } else {
        res.json({
          success: true,
          data: 0,
        });
      }
    } catch (err) {
      res.json({ success: false, message: err });
    }
  });

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

  router.post("/addObjectives", async (req, res) => {
    const objectivesData = req.body;
    const { goalId, budget: objectiveBudget } = req.body;
    let goalBudget = 0;
    let totalSubGoalBudget = 0;
    let goalObjectiveNumber = [];

    try {
      let goalData = await Goals.findOne({ id: goalId }).select({
        budget: 1,
        objectives: 1,
        objectiveBudget: 1,
      });

      totalSubGoalBudget = goalData.objectiveBudget
        .map((e) => e.budget)
        .reduce((a, b) => a + b, 0);

      goalBudget = goalData.budget;

      if (!objectivesData) {
        return res.status(400).json({ message: "Invalid data" });
      }

      if (objectiveBudget > goalBudget - totalSubGoalBudget) {
        return res.status(400).json({ message: "Budget exceeds limit" });
      }

      console.log({
        objectivesData: objectivesData,
      });

      const ObjectivesDataRequest = {
        id: uuidv4(),
        ...objectivesData,
        frequency_monitorings: objectivesData.frequency_monitoring,
        timetables: objectivesData.timetable,
      };

      const newObjective = new Objectives(ObjectivesDataRequest);
      await newObjective.save();
      console.log({ ObjectivesDataRequest });

      res.status(201).json({ success: true, data: newObjective });
    } catch (error) {
      logger.error(error);

      console.log(error);

      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  // router.post("/addObjectives", async (req, res) => {
  //   const objectivesData = req.body;
  //   const { goalId, budget: objectiveBudget } = req.body;
  //   let goalBudget = 0;
  //   let totalSubGoalBudget = 0;
  //   let goalObjectiveNumber = [];

  //   let goalData = await Goals.findOne({ id: goalId }).select({
  //     budget: 1,
  //     objectives: 1,
  //     objectiveBudget: 1,
  //   });

  //   totalSubGoalBudget = goalData.objectiveBudget
  //     .map((e) => e.budget)
  //     .reduce((a, b) => a + b, 0);

  //   goalBudget = goalData.budget;

  //   if (!objectivesData) {
  //     return res.json({
  //       success: false,
  //       message: "You must provide an Objectives and Action Plan Information",
  //     });
  //   }

  //   if (objectiveBudget > goalBudget - totalSubGoalBudget) {
  //     return res.json({
  //       success: false,
  //       message: `Objective Budget must not exceed ${formatCurrency(
  //         goalBudget - totalSubGoalBudget
  //       )} of the remaining Goal Budget `,
  //     });
  //   }

  //   const ObjectivesDataRequest = {
  //     id: uuidv4(),
  //     ...objectivesData,
  //   };

  //   try {
  //     //create new Objectives
  //     let newObjectives = await Objectives.create(ObjectivesDataRequest);
  //     res.json({
  //       success: true,
  //       message: "Objectives Added Successfully",
  //       data: newObjectives,
  //     });
  //     //update the goal model with budget and objectives id

  //     try {
  //       // Update the goal model with budget and objectives id
  //       await Goals.updateOne(
  //         { id: req.body.goalId },
  //         {
  //           $push: {
  //             objectives: newObjectives.id,
  //             objectiveBudget: {
  //               id: newObjectives.id,
  //               budget: ObjectivesDataRequest.budget,
  //             },
  //           },
  //         }
  //       );
  //     } catch (updateError) {
  //       console.error("Error updating goal with new objectives:", updateError);
  //       // Optional: Send an additional response or log the error.
  //     }

  //     /*
  //         await Goals.updateOne(
  //       { id: req.body.goalId },
  //       {
  //         $push: {
  //           objectives: newObjectives.id,
  //           objectiveBudget: {
  //             id: newObjectives.id,
  //             budget: objectivesData.budget,
  //           },
  //         },
  //       }
  //     );
  //     */
  //   } catch (error) {
  //     res.json({
  //       success: false,
  //       message: "Could not add  Objectives and Action Plan Error : " + error,
  //     });
  //   }
  // });

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

      if (updatedObjective) {
        await Goals.find({ objectives: { $in: [data.id] } })
          .then(async (goals) => {
            await Goals.updateMany(
              { objectives: { $in: [data.id] } }, // Find goals referencing the objective
              {
                $pull: {
                  objectives: data.id, // Remove from objectives array
                  objectiveBudget: { id: data.id }, // Remove from objectiveBudget array
                },
              }
            );
          })
          .catch((err) => {
            console.error("Error finding goals:", err);
          });
      } else {
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
    let { id, goalId, budget: objectiveBudget, ...ObjectivesData } = req.body;

    let goal = await Goals.findOne({
      id: goalId,
      deleted: false,
    }).select({
      id: 1,
      budget: 1,
      objectives: 1,
    });

    let { budget: goalBudget, objectives: goalObjectives } = goal;

    Objectives.findOneAndUpdate(
      { id: id },
      req.body,
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

  //**********************USer Routes ********************** */

  router.get("/getObjectiveForCalendar/:id", (req, res) => {
    Objectives.aggregate([
      { $match: { deleted: false, userId: req.params.id } },
      {
        $lookup: {
          as: "goals",
          from: "goals",
          foreignField: "_id",
          localField: "goal_Id",
        },
      },
      { $unwind: { path: "$goals", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          as: "users",
          from: "users",
          foreignField: "id",
          localField: "createdBy",
        },
      },
      { $unwind: { path: "$users", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          "goals.objectives": 0,
          "goals.objectiveBudget": 0,
        },
      },
    ])
      .sort({ createdAt: -1 })
      .then((objectives) => {
        // Success
        res.status(200).json({
          success: true,
          data: objectives,
        });
      })
      .catch((err) => {
        // Error handling
        console.error("Error fetching objectives with goals and users:", err);
        res
          .status(500)
          .json({ error: "Internal server error Or Token Expired" });
      });
  });

  router.get(
    "/getAllObjectivesForDashboard/:id",

    async (req, res) => {
      let data = [];
      try {
        let objectivesCount = await Objectives.countDocuments({
          createdBy: req.params.id,
        });
        let objectiveCompleted = await Objectives.countDocuments({
          complete: true,
          deleted: false,
          createdBy: req.params.id,
        });
        let objectiveUncompleted = await Objectives.countDocuments({
          complete: false,
          deleted: false,
          createdBy: req.params.id,
        });
        let objectivesData = await Objectives.find({
          deleted: false,
          createdBy: req.params.id,
        }).select({
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
    }
  );

  router.get("/getAllByIdObjectives/:id/:userId", (req, res) => {
    console.log({ getAllByIdObjectives: [req.params.id, req.params.userId] });

    Objectives.find(
      { deleted: false, goalId: req.params.id, createdBy: req.params.userId },
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

  router.get(
    "/getAllByIdObjectivesWithGoalsAndUsers/:id",

    (req, res) => {
      Objectives.aggregate([
        { $match: { deleted: false, createdBy: req.params.id } },
        {
          $lookup: {
            as: "goals",
            from: "goals",
            foreignField: "_id",
            localField: "goal_Id",
          },
        },
        { $unwind: { path: "$goals", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            as: "users",
            from: "users",
            foreignField: "id",
            localField: "createdBy",
          },
        },
        { $unwind: { path: "$users", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            "goals.objectives": 0,
            "goals.objectiveBudget": 0,
          },
        },
      ])
        .sort({ createdAt: -1 })
        .then((objectives) => {
          // Success
          res.status(200).json({
            success: true,
            data: objectives,
          });
        })
        .catch((err) => {
          // Error handling
          console.error("Error fetching objectives with goals and users:", err);
          res
            .status(500)
            .json({ error: "Internal server error Or Token Expired" });
        });
    }
  );

  router.get("/getAllObjectives/:id", (req, res) => {
    Objectives.find(
      { deleted: false, createdBy: req.params.id },
      (err, Objectives) => {
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
    ).sort({ _id: -1 });
  });

  router.get(
    "/getAllObjectivesForDashboard/:id",

    async (req, res) => {
      let data = [];
      try {
        let objectivesCount = await Objectives.countDocuments({
          createdBy: req.params.id,
        });
        let objectiveCompleted = await Objectives.countDocuments({
          complete: true,
          deleted: false,
          createdBy: req.params.id,
        });
        let objectiveUncompleted = await Objectives.countDocuments({
          complete: false,
          deleted: false,
          createdBy: req.params.id,
        });
        let objectivesData = await Objectives.find({
          deleted: false,
          createdBy: req.params.id,
        }).select({
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
    }
  );

  router.get(
    "/getAllObjectivesForDashboardPie/:id",

    async (req, res) => {
      let data = [];
      try {
        let objectivesCount = await Objectives.countDocuments({
          goalId: req.params.id,
        });
        let objectiveCompleted = await Objectives.countDocuments({
          complete: true,
          deleted: false,
          goalId: req.params.id,
        });
        let objectiveUncompleted = await Objectives.countDocuments({
          complete: false,
          deleted: false,
          goalId: req.params.id,
        });
        let objectivesData = await Objectives.find({
          deleted: false,
          goalId: req.params.id,
        }).select({
          _id: 0,
          id: 1,
          functional_objective: 1,
          budget: 1,
          complete: 1,
          date_added: 1,
        });

        let completionPercentage =
          objectivesCount > 0
            ? Math.round((objectiveCompleted / objectivesData.length) * 100)
            : 0;

        data.push({
          objectivesCount: objectivesCount,
          objectiveCompleted: objectiveCompleted,
          objectiveUncompleted: objectiveUncompleted,
          objectivesData: objectivesData,
          completionPercentage: completionPercentage,
        });
        res.json({ success: true, data: data });
      } catch (error) {
        res.json({ success: false, message: error });
      }
    }
  );

  router.get("/getAllObjectivesBudget/:id", async (req, res) => {
    try {
      let objectives = await Objectives.aggregate([
        {
          $match: {
            deleted: false,
            createdBy: req.params.id,
          },
        },
        {
          $group: {
            _id: null,
            totalObjectiveBudget: {
              $sum: "$budget",
            },
          },
        },
      ]);

      if (objectives.length > 0) {
        res.json({
          success: true,
          data: objectives[0].totalObjectiveBudget,
        });
      } else {
        res.json({
          success: true,
          data: 0,
        });
      }
    } catch (err) {
      res.json({ success: false, message: err });
    }
  });

  return router;
};
