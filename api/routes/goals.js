const Goals = require("../models/goals");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Objectives = require("../models/objective");

module.exports = (router) => {
  router.get("/getGoalsForDashboard", async (req, res) => {
    let data = [];
    try {
      let goalCount = await Goals.countDocuments();
      let goalDeletedCount = await Goals.countDocuments({ deleted: true });
      data.push({
        goalCount: goalCount,
        goalDeletedCount: goalDeletedCount,
      });
      res.json({ success: true, data: data });
    } catch (error) {
      res.json({ success: false, message: error });
    }
  });

  router.get("/getAllObjectivesWithObjectives", (req, res) => {
    Goals.aggregate(
      [
        {
          $match: {
            deleted: false,
          },
        },
        {
          $lookup: {
            from: "objectives",
            let: { objectiveIds: "$objectives" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ["$id", "$$objectiveIds"] },
                      { $eq: ["$deleted", false] },
                    ],
                  },
                },
              },
            ],
            as: "objectivesDetails",
          },
        },
        {
          $lookup: {
            as: "users",
            from: "users",
            foreignField: "id",
            localField: "createdBy",
          },
        },
        { $unwind: { path: "$users" } },
        {
          $addFields: {
            objectivesDetails: {
              $cond: {
                if: { $eq: ["$objectivesDetails", []] },
                then: null,
                else: "$objectivesDetails",
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            id: 1,
            goals: 1,
            budget: 1,
            createdBy: 1,
            deleted: 1,
            date_added: 1,
            createdAt: 1,
            __v: 1,
            updatedAt: 1,
            complete: 1,
            "users.id": 1,
            "users.username": 1,
            objectivesDetails: {
              $cond: {
                if: { $eq: ["$objectivesDetails", null] },
                then: null,
                else: {
                  $map: {
                    input: "$objectivesDetails",
                    as: "od",
                    in: {
                      id: "$$od.id",
                      functional_objective: "$$od.functional_objective",
                      performance_indicator: "$$od.performance_indicator",
                      target: "$$od.target",
                      formula: "$$od.formula",
                      programs: "$$od.programs",
                      responsible_persons: "$$od.responsible_persons",
                      clients: "$$od.clients",
                      timetable: "$$od.timetable",
                      frequency_monitoring: "$$od.frequency_monitoring",
                      data_source: "$$od.data_source",
                      budget: "$$od.budget",
                      createdBy: "$$od.createdBy",
                      deleted: "$$od.deleted",
                      date_added: "$$od.date_added",
                      createdAt: "$$od.createdAt",
                      __v: "$$od.__v",
                      complete: "$$od.complete",
                    },
                  },
                },
              },
            },
          },
        },
      ],

      { allowDiskUse: true },
      async (err, Goals) => {
        // Check if error was found or not
        if (err) {
          res.json({ success: false, message: err }); // Return error message
        } else {
          // Check if blogs were found in database
          if (!Goals || Goals.length === 0) {
            res.json({
              success: false,
              message: "No Goals found.",
              Goals: [],
            }); // Return error of no blogs found
          } else {
            /*
            let newGoals = Goals.map((goal) => {
              let subBudget = 0;
              goal.subBudget = subBudget;
              if (goal.objectivesDetails !== null) {
                returnData = goal.objectivesDetails.map((e) => {
                  subBudget = subBudget + e.budget;
                });
              }
            });
            */

            let returnedData = await Promise.all(
              await CalculateBudgetAndCompletion(Goals)
            );

            res.json({ success: true, goals: returnedData }); // Return success and blogs array
          }
        }
      }
    ).sort({ _id: -1 });

    // ).sort({ _id: -1 }); // Sort blogs from newest to oldest
  });

  async function CalculateBudgetAndCompletion(data) {
    return await data.map(async (goal) => {
      //calculate percentage and remaining
      let totalObjectiveBudget = 0;
      goal.remainingBudget = goal.budget;

      //calculate completed goals percentage
      let completionCounterArray = [];

      if (goal.objectivesDetails !== null) {
        for (let e of goal.objectivesDetails) {
          //calculate percentage and remaining
          goal.remainingBudget -= e.budget;
          totalObjectiveBudget += e.budget;
          completionCounterArray.push(e.complete);
          //calculate completed goals percentage
        }

        //calculate percentage and remaining
        goal.budgetMinusAllObjectiveBudget = totalObjectiveBudget;
        goal.remainingPercentage = (
          (goal.budgetMinusAllObjectiveBudget / goal.budget) *
          100
        ).toFixed(2);

        //calculate completed goals percentage
        let numberOfTrueValues = completionCounterArray.filter(
          (value) => value === true
        ).length; // Count the number of true values in the array
        let totalValues = completionCounterArray.length; // Count the total number of values in the array
        let percentage = Math.round((numberOfTrueValues / totalValues) * 100); // Calculate the percentage
        goal.CompletePercentage = percentage; // Assign the percentage to the goal object
      }
      return goal;
    });
  }

  router.get("/getAllGoals", (req, res) => {
    Goals.aggregate(
      [
        { $match: { deleted: false } }, // Filter by delete:false status
        {
          $lookup: {
            as: "users",
            from: "users",
            foreignField: "id",
            localField: "createdBy",
          },
        },
        { $unwind: { path: "$users" } },
        {
          $project: {
            budget: 1,
            createdAt: 1,
            createdBy: 1,
            date_added: 1,
            goals: 1,
            id: 1,
            _id: 1,
            objectives: 1,
            updateDate: 1,
            "users.id": 1,
            "users.username": 1,
          },
        },
      ],
      { maxTimeMS: 60000, allowDiskUse: true },
      (err, Goals) => {
        // Check if error was found or not
        if (err) {
          res.json({ success: false, message: err }); // Return error message
        } else {
          // Check if blogs were found in database
          if (!Goals || Goals.length === 0) {
            res.json({
              success: false,
              message: "No Goals found.",
              Goals: [],
            }); // Return error of no blogs found
          } else {
            res.json({ success: true, goals: Goals }); // Return success and blogs array
          }
        }
      }
    ).sort({ _id: -1 });

    // ).sort({ _id: -1 }); // Sort blogs from newest to oldest
  });

  router.post("/findGoalsById", (req, res) => {
    Goals.findOne({ id: req.body.id }, "-deleted -__v", function (err, Goals) {
      if (err) {
        res.json({ success: false, message: "Goals not found" });
      } else {
        // Check if blogs were found in database
        if (!Goals) {
          res.json({ success: false, message: "No Goals found." });
        } else {
          res.json({ success: true, Goals: Goals });
        }
      }
    });
  });

  router.post("/addGoals", (req, res) => {
    let { goals, budget, createdBy } = req.body;

    if (!goals && budget) {
      return res.json({
        success: false,
        message: "You must provide an Goals and Action Plan Information",
      });
    }

    let goalsDataRequest = {
      id: uuidv4(),
      goals,
      budget,
      createdBy,
    };
    Goals.create(goalsDataRequest)
      .then((data) =>
        res.json({
          success: true,
          message: "This  Goals and Action Plan Goals is successfully Added ",
          data: { goals: data },
        })
      )
      .catch((err) => {
        if (err.code === 11000) {
          res.json({
            success: false,
            message: " Goals and Action Plan Goals Name already exists ",
            err: err.message,
          });
        } else if (err.errors) {
          const errors = Object.keys(err.errors);
          res.json({ success: false, message: err.errors[errors[0]].message });
        } else {
          res.json({
            success: false,
            message:
              "Could not add  Goals and Action Plan Error : " + err.message,
          });
        }
      });
  });

  router.put("/deleteGoals", (req, res) => {
    let data = req.body;
    let ObjectivesArray = [];

    Goals.find({ _id: ObjectId(data._id) }, (err, GoalsFindRes) => {
      ObjectivesArray = GoalsFindRes.map((e) => e.objectives);
      if (err) {
        return res.json({ success: false, message: err.message });
      }
      if (!GoalsFindRes || GoalsFindRes.length === 0) {
        return res.json({
          success: false,
          message: "No Goals found.",
          GoalsFindRes: [],
        }); // Return error of no blogs found
      } else {
        Goals.updateOne(
          { _id: ObjectId(data._id) },
          { deleted: true },
          (err, response) => {
            if (err) {
              return res.json({ success: false, message: err.message });
            }

            if (response.modifiedCount > 0) {
              Objectives.updateMany(
                {
                  id: {
                    // use the [0] instead of objectivesarray
                    $in: ObjectivesArray[0],
                  },
                },
                { $set: { deleted: true } },
                (err, response) => {
                  if (err) {
                    return res.json({ success: false, message: err.message });
                  }
                  if (response.acknowledged) {
                    res.json({
                      success: true,
                      message: "Successfully Delete Goals",
                      data: response,
                    });
                  }
                }
              );
            } else {
              res.json({
                success: false,
                message: "Could Delete Goals" + err,
              });
            }
          }
        );
      }
    });
  });

  router.put("/setInactiveGoals", (req, res) => {
    let data = req.body;

    Goals.findOne(
      {
        id: data.id,
      },
      (err) => {
        if (err) throw err;
        Goals.findOneAndUpdate(
          { id: data.id },
          { deleted: true },
          { upsert: true, select: "-__v" },
          (err, response) => {
            if (err) return res.json({ success: false, message: err.message });
            if (response) {
              res.json({
                success: true,
                message: " Successfully Delete Goals",
                data: response,
              });
            } else {
              res.json({
                success: false,
                message: "Could Delete Goals" + err,
              });
            }
          }
        );
      }
    );
  });

  router.put("/updateGoals", async (req, res) => {
    let data = req.body;
    data.updateDate = new Date().toISOString();
    Goals.findOneAndUpdate(
      { id: data.id },
      data,
      { new: true },
      (err, response) => {
        if (err) return res.json({ success: false, message: err.message });
        if (response) {
          res.json({
            success: true,
            message: "Goals Information has been updated!",
            data: response,
          });
        } else {
          res.json({
            success: true,
            message: "No Goals has been modified!",
            data: response,
          });
        }
      }
    );
  });

  return router;
};
