const Logs = require("../models/logs");

module.exports = (router) => {
  router.get("/getAllLogs", async (req, res) => {
    let data = [];
    try {
      let logs = await Logs.find().sort({ _id: -1 }).limit(1000);
      data.push(logs);
      await res.json({
        success: true,
        data: data,
      });
    } catch (error) {
      res.json({ success: false, message: error });
    }
  });

  return router;
};

/*
    try {
      let page = parseInt(req.params.page);
      let limit = parseInt(req.params.limit);
      let skip = (page - 1) * limit;
      let logs = await Logs.find().sort({ _id: -1 }).skip(skip).limit(limit);
      let totalCount = await Logs.countDocuments();
      data.push({ logs, totalCount });
      await res.json({
        success: true,
        data: data,
      });
    } catch (error) {
      res.json({ success: false, message: error });
    }
*/
