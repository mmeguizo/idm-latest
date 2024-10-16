const { first } = require("rxjs");
const Goals = require("../models/goals");
const Users = require("../models/user");

module.exports = (router) => {
  router.get("/getAllObjectivesUnderAVicePresident/:id", async (req, res) => {
    const VPId = req.params.id;
    const usersUnderThisVicePresident = await Users.find({
      vice_president_id: VPId,
    }).select({ id: true, firstname: true, lastname: true });

    // Extract the array of user ids
    const userIds = usersUnderThisVicePresident.map((user) => user.id);
    userIds.push(VPId);

    Goals.aggregate(
      [
        {
          $match: {
            deleted: false,
            createdBy: {
              $in: userIds,
            },
          },
        },
        {
          $lookup: {
            from: "objectives",
            let: { objectiveIds: { $ifNull: ["$objectives", []] } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ["$id", { $ifNull: ["$$objectiveIds", []] }] },
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
            department: 1,
            campus: 1,
            createdBy: 1,
            deleted: 1,
            date_added: 1,
            createdAt: 1,
            goallistsId: 1,
            __v: 1,
            updatedAt: 1,
            complete: 1,
            "users.id": 1,
            "users.username": 1,
            objectivesDetails: {
              $map: {
                input: { $ifNull: ["$objectivesDetails", []] },
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
                  remarks: "$$od.remarks",
                  month_0: "$$od.month_0",
                  month_1: "$$od.month_1",
                  month_2: "$$od.month_2",
                  month_3: "$$od.month_3",
                  month_4: "$$od.month_4",
                  month_5: "$$od.month_5",
                  month_6: "$$od.month_6",
                  month_7: "$$od.month_7",
                  month_8: "$$od.month_8",
                  month_9: "$$od.month_9",
                  month_10: "$$od.month_10",
                  month_11: "$$od.month_11",
                  file_month_0: "$$od.file_month_0",
                  file_month_1: "$$od.file_month_1",
                  file_month_2: "$$od.file_month_2",
                  file_month_3: "$$od.file_month_3",
                  file_month_4: "$$od.file_month_4",
                  file_month_5: "$$od.file_month_5",
                  file_month_6: "$$od.file_month_6",
                  file_month_7: "$$od.file_month_7",
                  file_month_8: "$$od.file_month_8",
                  file_month_9: "$$od.file_month_9",
                  file_month_10: "$$od.file_month_10",
                  file_month_11: "$$od.file_month_11",
                  goal_month_0: "$$od.goal_month_0",
                  goal_month_1: "$$od.goal_month_1",
                  goal_month_2: "$$od.goal_month_2",
                  goal_month_3: "$$od.goal_month_3",
                  goal_month_4: "$$od.goal_month_4",
                  goal_month_5: "$$od.goal_month_5",
                  goal_month_6: "$$od.goal_month_6",
                  goal_month_7: "$$od.goal_month_7",
                  goal_month_8: "$$od.goal_month_8",
                  goal_month_9: "$$od.goal_month_9",
                  goal_month_10: "$$od.goal_month_10",
                  goal_month_11: "$$od.goal_month_11",
                  quarter_1: "$$od.quarter_1",
                  quarter_2: "$$od.quarter_2",
                  quarter_3: "$$od.quarter_3",
                  quarter_0: "$$od.quarter_0",
                  file_quarter_1: "$$od.file_quarter_1",
                  file_quarter_2: "$$od.file_quarter_2",
                  file_quarter_3: "$$od.file_quarter_3",
                  file_quarter_0: "$$od.file_quarter_0",
                  goal_quarter_1: "$$od.goal_quarter_1",
                  goal_quarter_2: "$$od.goal_quarter_2",
                  goal_quarter_3: "$$od.goal_quarter_3",
                  goal_quarter_0: "$$od.goal_quarter_0",
                  semi_annual_0: "$$od.semi_annual_0",
                  semi_annual_1: "$$od.semi_annual_1",
                  semi_annual_2: "$$od.semi_annual_2",
                  file_semi_annual_0: "$$od.file_semi_annual_0",
                  file_semi_annual_1: "$$od.file_semi_annual_1",
                  file_semi_annual_2: "$$od.file_semi_annual_2",
                  goal_semi_annual_0: "$$od.goal_semi_annual_0",
                  goal_semi_annual_1: "$$od.goal_semi_annual_1",
                  goal_semi_annual_2: "$$od.goal_semi_annual_2",
                  frequency_monitoring: "$$od.frequency_monitoring",
                  timetable: "$$od.timetable",
                  complete: "$$od.complete",
                  data_source: "$$od.data_source",
                  budget: "$$od.budget",
                  date_added: "$$od.date_added",
                  createdBy: "$$od.createdBy",
                  updateby: "$$od.updateby",
                  updateDate: "$$od.updateDate",
                  createdAt: "$$od.createdAt",
                  deleted: "$$od.deleted",
                },
              },
            },
          },
        },
      ],
      { allowDiskUse: true },
      async (err, Goals) => {
        if (err) {
          res.json({ success: false, message: err });
        } else {
          if (!Goals || Goals.length === 0) {
            res.json({
              success: false,
              message: "No Goals found.",
              Goals: [],
            });
          } else {
            let returnedData = await Promise.all(
              await CalculateBudgetAndCompletion(Goals)
            );
            res.json({ success: true, goals: returnedData });
          }
        }
      }
    ).sort({ _id: -1 });
  });

  async function CalculateBudgetAndCompletion(data) {
    return await Promise.all(
      data.map(async (goal) => {
        // Calculate percentage and remaining
        let totalObjectiveBudget = 0;
        goal.remainingBudget = goal.budget;

        // Calculate completed goals percentage
        let totalCompletion = 0;
        let totalObjectives = 0;

        if (goal.objectivesDetails !== null) {
          for (let e of goal.objectivesDetails) {
            // Calculate percentage and remaining
            goal.remainingBudget -= e.budget;
            totalObjectiveBudget += e.budget;

            // Calculate completed goals percentage
            let objectiveCompletion = 0;
            let count = 0;
            let goalSum = 0;

            if (e.frequency_monitoring === "yearly") {
              for (let i = 0; i < 12; i++) {
                const key = `month_${i}`;
                if (e[key] !== undefined) {
                  goalSum += e[key];
                  count++;
                }
              }
            } else if (e.frequency_monitoring === "quarterly") {
              for (let i = 0; i < 4; i++) {
                const key = `quarter_${i}`;
                if (e[key] !== undefined) {
                  goalSum += e[key];
                  count++;
                }
              }
            } else if (e.frequency_monitoring === "semi_annual") {
              for (let i = 0; i < 2; i++) {
                const key = `semi_annual_${i}`;
                if (e[key] !== undefined) {
                  goalSum += e[key];
                  count++;
                }
              }
            }

            if (count > 0) {
              objectiveCompletion = (goalSum / e.target) * 100;
              totalCompletion += objectiveCompletion;
              totalObjectives++;
            }

            // Add complete key to each objective
            e.complete = goalSum === e.target;
          }

          // Calculate percentage and remaining
          goal.budgetMinusAllObjectiveBudget = totalObjectiveBudget;
          goal.remainingPercentage = (
            (goal.budgetMinusAllObjectiveBudget / goal.budget) *
            100
          ).toFixed(2);

          goal.searchDate = await formatIsoDate(goal.createdAt);

          // Add completion percentage to the root of the goal
          if (totalObjectives > 0) {
            goal.completion_percentage = Math.round(
              totalCompletion / totalObjectives
            );
          } else {
            goal.completion_percentage = 0;
          }

          // Add complete key based on completion percentage
          goal.complete = goal.completion_percentage === 100;
        }
        return goal;
      })
    );
  }

  async function formatIsoDate(isoDateString) {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed, so add 1
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  //needed
  return router;
};
