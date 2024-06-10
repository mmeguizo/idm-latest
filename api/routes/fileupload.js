const File = require("../models/fileupload"); // Import User Model Schema
const { v4: uuidv4 } = require("uuid");
const hash = require("../config/password-hasher");
const mongoose = require("mongoose");
let bcrypt = require("bcryptjs");
const formidable = require("formidable");
const path = require("path");
const ObjectId = mongoose.Types.ObjectId;
let fs = require("fs");
const { fail } = require("assert");
let md5 = require("md5");
module.exports = (router) => {
  router.post("/addMultipleFiles/:user_id/:objective_id", async (req, res) => {
    let ReturnData = [];
    let useFor = "files";
    let form = new formidable.IncomingForm({ multiples: true });
    form.maxFileSize = 2500 * 1024 * 1024; // Adjust max file size as needed
    form.uploadDir = path.join(__dirname, "..", "images/files");

    const uploadedFiles = []; // Array to store uploaded file details

    form.on("file", async (field, file) => {
      // console.log({ FILEEEEE: file, field, form });

      const newFileName = [
        useFor,
        Math.random(),
        Math.random(),
        Math.random(),
      ].join("");
      const ext = file.originalFilename.split(".").pop();
      const finalFileName = `${md5(newFileName)}${ext ? `.${ext}` : ""}`;

      try {
        const filePath = file.filepath; // Assuming `filepath` property exists
        const readStream = fs.createReadStream(filePath);

        await new Promise((resolve, reject) => {
          const fileStream = fs.createWriteStream(
            path.join(form.uploadDir, finalFileName)
          );
          fileStream.on("error", (err) => reject(err));
          fileStream.on("finish", () => resolve());
          readStream.pipe(fileStream); // Pipe the read stream to the write stream
        });

        uploadedFiles.push(
          new File({
            id: uuidv4(),
            user_id: req.params.user_id,
            objective_id: req.params.objective_id,
            source: finalFileName,
            for: "files",
            filetype: file.mimetype.split("/")[0],
          })
        );

        let savePromises = uploadedFiles.map((file) => {
          return new Promise((resolve, reject) => {
            file.save((err, data) => {
              if (err) {
                reject(err);
              } else {
                resolve(data);
              }
            });
          });
        });

        Promise.all(savePromises)
          .then((data) => {
            console.log("Files Saving success....:", data);
          })
          .catch((err) => {
            // res.json({
            //   success: false,
            //   message: "Error, could not save files : " + err,
            // });
            console.error("Error uploading file:", err);
          });
      } catch (err) {
        console.error("Error uploading file:", err);
        // Handle upload errors appropriately (e.g., send error response to client)
      }
    });

    form.on("progress", (bytesReceived, bytesExpected) => {
      // Handle upload progress if needed
    });

    form.on("error", (err) => {
      console.error("An error occurred:", err);
      // res.status(500).json({ message: "Error uploading files" }); // Handle errors gracefully
    });

    form.on("end", async () => {
      console.log("Finished uploading files");
    });

    form.parse(req);

    res.json({
      success: true,
      message: "Files uploaded successfully!",
    });
  });

  router.post("/addFile/:user_id", async (req, res) => {
    let useFor = "files";
    let formidable = require("formidable");
    let fs = require("fs");
    let path = require("path");
    let md5 = require("md5");

    var form = new formidable.IncomingForm();

    form.maxFileSize = 2500 * 1024 * 1024;
    form.multiples = true;

    form.uploadDir = path.join(__dirname, "..", "images/files");

    form.on("file", function (field, file) {
      let newFileName = [useFor, Math.random(), Math.random(), Math.random()];

      newFileName = `${md5(newFileName.join(""))}.${file.originalFilename
        .split(".")
        .pop()}`;

      fs.rename(file.filepath, path.join(form.uploadDir, newFileName), () => {
        let uploadData = new File({
          id: uuidv4(),
          user_id: req.params.user_id,
          source: newFileName,
          for: "files",
          filetype: file.mimetype.substring(0, file.mimetype.indexOf("/")),
        });
        uploadData.save((err, data) => {
          console.log(err);
          console.log(data);
        });
      });
    });

    form.on("progress", (bytesReceived, bytesExpected) => {});

    process.on("uncaughtException", function (err) {
      //this does nothing
      console.log(err);
      throw err;
    });

    form.on("error", function (err) {
      console.log("An error has occured: \n" + err);
      res.eventEmitter("error");
    });

    form.on("end", function () {
      console.log("finished uploading");
    });

    form.parse(req, async (err, fields, files) => {
      let returnMe = [];

      returnMe.push([fields, files]);

      if (err) {
        next(err);
        return;
      }
      return await res.json({
        success: true,
        message: "Files uploaded successfully ",
        data: returnMe,
      });
    });
  });

  router.post("/addAvatar", (req, res) => {
    let useFor = req.body.useFor;
    let username = "tester";
    let formidable = require("formidable");
    let fs = require("fs");
    let path = require("path");
    let md5 = require("md5");

    var form = new formidable.IncomingForm();
    form.uploadDir = `${__dirname}/../images/`;
    form.on("file", async (field, file) => {
      let newFileName = [username, Math.random(), Math.random(), Math.random()];

      newFileName = `${md5(newFileName.join(""))}.${file.originalFilename
        .split(".")
        .pop()}`;

      if (fs.existsSync(file.filepath)) {
        fs.rename(
          file.filepath,
          path.join(form.uploadDir, newFileName),
          (err) => {
            if (err) {
              return res.json({
                success: false,
                message: err.name + " " + err.message,
              });
            } else {
              let uploadData = new File({
                id: uuidv4(),
                source: newFileName,
                user_id: req.decoded.id,
                for: "avatar",
                filetype: file.mimetype.substring(
                  0,
                  file.mimetype.indexOf("/")
                ),
              });

              uploadData.save((err, data) => {
                if (err) {
                  res.json({
                    success: false,
                    message: "Error, could not save avatar : " + err,
                  });
                } else {
                  res.json({
                    success: true,
                    message: "Avatar uploaded successfully ",
                    data: data,
                  });
                }
              });
            }
          }
        );
      } else {
        return res.json({
          success: false,
          message: "Something went wrong please re-upload your image.",
        });
      }
    });

    form.on("error", function (err) {
      console.log("An error has occured: \n" + err);
    });
    form.on("end", function () {
      // console.log('hey');
    });
    form.parse(req);
  });

  router.put("/deleteFile", (req, res) => {
    let file = req.body.link.source;
    let id = req.body.link.id;

    // res.json({ success: true, message: "The file has been remove." });
    let fs = require("fs");
    fs.unlink(
      `${path.join(__dirname, "..", "images/files")}/${file}`,
      (err) => {
        if (err) {
          return res.json({
            success: false,
            message: "The server cant find the file.",
          });
        } else {
          File.deleteOne({ id: id }, (err, results) => {
            if (err) {
              return res.json({ success: false, message: err.message });
            } else {
              return res.json({
                success: true,
                message: "The file has been remove.",
              });
            }
          });
        }
      }
    );
  });

  router.put("/deleteFileObjective", (req, res) => {
    let file = req.body.source;
    let id = req.body.id;
    let fs = require("fs");

    File.findOne(
      {
        id: id,
      },
      (err) => {
        if (err) throw err;
        File.findOneAndUpdate(
          { id: id },
          { status: false },
          { upsert: true, select: "-__v" },
          (err, response) => {
            if (err) return res.json({ success: false, message: err.message });
            if (response) {
              res.json({
                success: true,
                message: "File Deleted",
                data: response,
              });
            } else {
              res.json({
                success: false,
                message: "Error Occured",
              });
            }
          }
        ).sort({ date_added: 1 });
      }
    );
    // fs.unlink(
    //   `${path.join(__dirname, "..", "images/files")}/${file}`,
    //   (err) => {
    //     if (err) {
    //       return res.json({
    //         success: false,
    //         message: "The server cant find the file.",
    //       });
    //     }
    //     // File.deleteOne({ id: id }, (err, results) => {
    //     //   if (err) {
    //     //     return res.json({ success: false, message: err.message });
    //     //   } else {
    //     //     return res.json({
    //     //       success: true,
    //     //       message: "The file has been remove.",
    //     //     });
    //     //   }
    //     // });
    //   }
    // );
  });

  router.get("/getAllFiles/:user_id", (req, res) => {
    let query = req.params;

    File.find(query, (err, files) => {
      if (err) {
        return res.json({ success: false, message: err.message });
      } else {
        return res.json({ success: true, message: "Files", data: files });
      }
    });
  });

  router.get("/getAllFilesFromObjective/:user_id/:objective_id", (req, res) => {
    const { user_id, objective_id } = req.params;
    File.find(
      {
        user_id: user_id,
        objective_id: objective_id,
        for: "files",
        status: true,
      },
      {
        __v: 0.0,
      },
      (err, files) => {
        if (err) {
          return res.json({ success: false, message: err.message });
        } else {
          return res.json({ success: true, message: "Files", data: files });
        }
      }
    ).sort({
      date_added: -1,
    });

    // File.find(query, (err, files) => {
    //   if (err) {
    //     return res.json({ success: false, message: err.message });
    //   } else {
    //     return res.json({ success: true, message: "Files", data: files });
    //   }
    // });
  });
  router.get(
    "/getAllFilesHistoryFromObjectiveLoad/:user_id/:objective_id",
    (req, res) => {
      console.log("getAllFilesHistoryFromObjectiveLoad", req.params);

      const { user_id, objective_id } = req.params;
      File.find(
        {
          user_id: user_id,
          objective_id: objective_id,
          for: "files",
        },
        {
          __v: 0.0,
        },
        (err, files) => {
          console.log("getAllFilesHistoryFromObjectiveLoad", files);

          if (err) {
            return res.json({ success: false, message: err.message });
          } else {
            return res.json({ success: true, message: "Files", data: files });
          }
        }
      ).sort({
        createdAt: -1,
      });

      // File.find(query, (err, files) => {
      //   if (err) {
      //     return res.json({ success: false, message: err.message });
      //   } else {
      //     return res.json({ success: true, message: "Files", data: files });
      //   }
      // });
    }
  );

  return router;
};

// router.post("/addMultipleFile/:user_id", async (req, res) => {
//   let useFor = "files";
//   let formidable = require("formidable");
//   let fs = require("fs");
//   let path = require("path");
//   let md5 = require("md5");

//   let returnMe = [];

//   let form = new formidable.IncomingForm();

//   form.maxFileSize = 2500 * 1024 * 1024;
//   form.multiples = true;

//   form.uploadDir = path.join(__dirname, "..", "images/files");

//   form.onPart = async function (part) {
//     if (!part.filename) {
//       return;
//     }

//     let newFileName = [useFor, Math.random(), Math.random(), Math.random()];

//     newFileName = `${md5(newFileName.join(""))}.${part.filename
//       .split(".")
//       .pop()}`;

//     let uploadPath = path.join(form.uploadDir, newFileName);

//     const writeStream = fs.createWriteStream(uploadPath);
//     part.pipe(writeStream);

//     let uploadData = new File({
//       id: uuidv4(),
//       user_id: req.params.user_id,
//       source: newFileName,
//       for: "files",
//       filetype: part.mime.substring(0, part.mime.indexOf("/")),
//     });

//     await uploadData.save();

//     returnMe.push({
//       fields: part.headers["content-disposition"],
//       file: newFileName,
//     });
//   };

//   form.on("progress", (bytesReceived, bytesExpected) => {});

//   form.on("error", function (err) {
//     console.log("An error has occured: \n" + err);
//     res.eventEmitter("error");
//   });

//   // once all the files have been uploaded, send a response to the client
//   form.on("end", function () {
//     console.log("finished uploading");
//     res.json({
//       success: true,
//       message: "Files uploaded successfully ",
//       data: returnMe,
//     });
//   });

//   form.parse(req);
// });

// try {
//   await res.json({
//     success: true,
//     message: "Files uploaded successfully!",
//     data: uploadedFiles,
//   });
// } catch (err) {
//   console.error("Error saving uploaded files:", err);
//   res
//     .status(500)
//     .json({ success: false, message: "Error saving uploaded files" }); // Handle errors gracefully
// }
