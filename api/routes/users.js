const User = require("../models/user"); // Import User Model Schema
const { v4: uuidv4 } = require("uuid");
const hash = require("../config/password-hasher");
const mongoose = require("mongoose");
let bcrypt = require("bcryptjs");
const { logger } = require("../middleware/logger");
const ObjectId = mongoose.Types.ObjectId;

module.exports = (router) => {
  router.get("/getAllUsersForDashboard", async (req, res) => {
    let data = [];
    try {
      let adminCount = await User.countDocuments({
        deleted: false,
        role: "admin",
      });
      let userCount = await User.countDocuments({
        deleted: false,
        role: "user",
      });
      let documentCount = await User.countDocuments({ deleted: false });
      data.push({
        admin: adminCount,
        user: userCount,
        document: documentCount,
      });
      res.json({ success: true, data: data });
    } catch (error) {
      res.json({ success: false, message: error });
    }
  });

  router.get("/getAllUsers", (req, res) => {
    User.find(
      { deleted: false },
      { id: 1, email: 1, username: 1, department: 1, role: 1, status: 1 },
      (err, users) => {
        if (err) {
          res.json({ success: false, message: err });
        } else {
          if (!users) {
            res.json({ success: false, message: "No User found." });
          } else {
            res.json({ success: true, users: users });
          }
        }
      }
    ).sort({ _id: -1 });
  });

  router.get("/getAllUsersExceptLoggedIn/:id", (req, res) => {
    User.find(
      { id: { $ne: req.params.id }, deleted: false },
      { id: 1, email: 1, username: 1, department: 1, role: 1, status: 1 },
      (err, users) => {
        if (err) {
          res.json({ success: false, message: err });
        } else {
          if (!users) {
            res.json({ success: false, message: "No User found." });
          } else {
            res.json({ success: true, users: users });
          }
        }
      }
    ).sort({ _id: -1 });
  });

  router.post("/findById", (req, res) => {
    User.findOne({ id: req.body.id }, function (err, user) {
      if (err) {
        res.json({ success: false, message: err });
      } else {
        if (!user) {
          res.json({ success: false, message: "No User found." });
        } else {
          res.json({ success: true, user: user });
        }
      }
    });
  });

  router.post("/addUser", (req, res) => {
    const { email, username, password, confirm, department } = req.body;
    if (
      !email ||
      !username ||
      !password ||
      !department ||
      password !== confirm
    ) {
      return res.json({
        success: false,
        message:
          "You must provide an email, username, department, password and matching password",
      });
    }

    const userData = {
      id: uuidv4(),
      email: req.body.email.toLowerCase(),
      username: req.body.username.toLowerCase(),
      password: req.body.password,
      department: req.body.department,
      // role: req.body.role.toLowerCase(),
    };

    User.create(userData)
      .then((data) => {
        res.json({
          success: true,
          message: "This user is successfully Registered ",
          data: { email: data.email, username: data.username, department },
        });
      })
      .catch((err) => {
        if (err.code === 11000) {
          res.json({
            success: false,
            message: "User name or Email already exists ",
            err: err.message,
          });
        } else if (err.errors) {
          //for specific error email,username and password
          const errors = Object.keys(err.errors);
          res.json({ success: false, message: err.errors[errors[0]].message });
        } else {
          res.json({
            success: false,
            message: "Could not save user Error : " + err,
          });
        }
      });
  });

  router.put("/deleteUser", (req, res) => {
    let data = req.body;

    User.deleteOne(
      {
        id: data.id,
      },
      (err, user) => {
        if (err) {
          res.json({ success: false, message: "Could not Delete User" + err });
        } else {
          res.json({
            success: true,
            message: " Successfully Deleted the User",
            data: user,
          });
          // globalconnetion.emitter('user')
        }
      }
    );
  });

  router.put("/setInactiveUser", (req, res) => {
    let data = req.body;

    User.findOne(
      {
        id: data.id,
      },
      (err, user) => {
        if (err) throw err;
        User.findOneAndUpdate(
          { id: data.id },
          {
            deleted: true,
            status: user.status === "active" ? "inactive" : "inactive",
          },
          { upsert: true },
          (err, response) => {
            if (err) return res.json({ success: false, message: err.message });
            if (response) {
              res.json({
                success: true,
                message: " Successfully Delete User",
                data: user,
              });
            } else {
              res.json({ success: false, message: "Could Delete User" + err });
            }
          }
        );
      }
    );
  });

  router.put("/changeUserStatus", (req, res) => {
    let { id } = req.body;
    User.findOne(
      {
        id: id,
      },
      (err, user) => {
        let statusData =
          user.status === "pending"
            ? "active"
            : user.status === "active"
            ? "inactive"
            : "active";

        if (err) throw err;
        User.findOneAndUpdate(
          { id: id },
          { status: statusData },
          { upsert: true },
          (err, response) => {
            if (err) return res.json({ success: false, message: err.message });
            if (!response) {
              res.json({
                success: false,
                message: "Could not set User  Status" + err,
              });
            } else {
              res.json({
                success: true,
                message: " Successfully User set Status",
                data: user,
              });
            }
          }
        );
      }
    );
  });

  router.put("/updateUser", async (req, res) => {
    const { username, email, department, id } = req.body;

    User.findOneAndUpdate(
      { id: id },
      { username, email, department },
      { upsert: false },
      (err, response) => {
        if (err) return res.json({ success: false, message: err.message });
        if (response) {
          res.json({
            success: true,
            message: "User Information has been updated!",
            data: response,
          });
        } else {
          res.json({
            success: true,
            message: "No User has been modified!",
            data: response,
          });
        }
      }
    );
  });

  router.put("/updateProfile", async (req, res) => {
    let data = req.body;
    let userData = {};

    const user = await User.findOne({ id: req.body.id });

    if (data.confirmPassword !== data.password) {
      res.json({
        success: false,
        message:
          "Password not match : " + data.password + " for " + data.username,
      });
    } else if (data.confirmPassword && data.confirmPassword.trim() !== "") {
      let checkPassword = await bcrypt.compare(
        data.old_password,
        user.password
      );
      if (!checkPassword) {
        res.json({
          success: false,
          message:
            "Incorrect Old Password : " +
            data.password +
            " for " +
            data.username,
        });
      } else {
        hash
          .encryptPassword(data.password)
          .then((hash) => {
            userData.role = data.role;
            userData.username = data.username;
            userData.email = data.email;
            userData.password = hash;
            userData.profile_pic = data.profile_pic;
            User.findOneAndUpdate(
              { id: data.id },
              userData,
              { upsert: true },
              (err, response) => {
                if (err)
                  return res.json({ success: false, message: err.message });
                if (response) {
                  res.json({
                    success: true,
                    message: "User Information has been updated!",
                    data: response,
                  });
                } else {
                  res.json({
                    success: true,
                    message: "No User has been modified!",
                    data: response,
                  });
                }
              }
            );
          })
          .catch((err) => {
            console.log(err);
          });
      }
    } else {
      const { username, email, profile_pic, id } = req.body;

      User.findOneAndUpdate(
        { id: id },
        { username, email, profile_pic },
        { upsert: false },
        (err, response) => {
          if (err) return res.json({ success: false, message: err.message });
          if (response) {
            res.json({
              success: true,
              message: "User Information has been updated!",
              data: response,
            });
          } else {
            res.json({
              success: true,
              message: "No User has been modified!",
              data: response,
            });
          }
        }
      );
    }
  });

  router.get("/profile/:id", (req, res) => {
    User.findOne({ id: req.params.id })
      .select("username email profile_pic")
      .exec((err, user) => {
        if (err) {
          res.json({ success: false, message: err.message });
        } else {
          if (!user) {
            res.json({ success: false, message: "User not found" });
          } else {
            res.json({ success: true, user: user });
          }
        }
      });
  });

  router.get("/UserProfilePic/:id", (req, res) => {
    User.findOne({ profile_pic: req.params.id })
      .select("profile_pic")
      .exec((err, user) => {
        if (err) {
          res.json({ success: false, message: err.message });
        } else {
          if (!user) {
            res.json({ success: false, message: "UserPic not found" });
          } else {
            res.json({ success: true, picture: user });
          }
        }
      });
  });

  return router;
};
