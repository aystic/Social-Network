const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");
const socket = require("./utils/socket");
const helmet = require("helmet");
const compression = require("compression");

console.log(process.env);

// const { graphqlHTTP } = require("express-graphql");
// const graphqlSchema = require("./graphql/schema");
// const graphqlResolvers = require("./graphql/resolvers");
// const https = require("https");
// const fs = require("fs");

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + "-" + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// const privateKey = fs.readFileSync("server.key");
// const certificate = fs.readFileSync("server.cert");

app.use(bodyParser.json());
app.use("/images", express.static(path.join(__dirname, "images")));

//allowing cross origin sharing
app.use((req, res, next) => {
  // res.setHeader("Access-Control-Allow-Origin", "domain");
  // res.setHeader("Access-Control-Allow-Origin", "domain1,domain2,...");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});
app.use(helmet());
app.use(compression());
app.use(multer({ storage: fileStorage, fileFilter }).single("image"));

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

// app.use(
//   "/graphql",
//   graphqlHTTP({
//     schema: graphqlSchema,
//     rootValue: graphqlResolvers,
//     graphiql: true,
//   })
// );

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({
    message,
  });
});

// mongoose
//   .connect(MongoDBURI)
//   .then(() => {
//     console.log("Connection to DB successfull!");
//     const server = app.listen("8080", () => {
//       console.log("Listening at port 8080");
//     });
//     socket.init(server);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    // const server = https
    //   .createServer({ key: privateKey, cert: certificate }, app)
    //   .listen("8080", () => {
    //     console.log("Listening at port 8080");
    //   });
    console.log("Connection to DB successfull!");
    const server = app.listen(process.env.PORT || "8080", () => {
      console.log("Listening at port 8080");
    });
    socket.init(server);
  })
  .catch((err) => {
    console.log(err);
  });
