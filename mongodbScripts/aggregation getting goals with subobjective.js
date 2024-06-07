db.getCollection("goals").aggregate(
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
      ]
)
