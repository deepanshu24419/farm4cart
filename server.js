require("dotenv").config();
const express = require("express");
const app = express();

const ejs = require("ejs");
const path = require("path");
const expressLayout = require("express-ejs-layouts");
const mongoose = require("mongoose");
// const connectDb = require("./config/db");
const session = require("express-session");
const flash = require("express-flash");

const MongoDbStore = require("connect-mongo")(session);
const passport = require("passport");
const Emitter = require("events");
//database Connection
// connectDb();

const PORT = process.env.PORT || 3000;

//databse connection
const url =
  "mongodb+srv://deepanshutyagi:tyagino1@clusterbasic-kb7wk.mongodb.net/farm4u?retryWrites=true&w=majority";
mongoose.connect(url, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: true,
});
const connection = mongoose.connection;
connection
  .once("open", () => {
    console.log("MongoDb connected...");
  })
  .catch((err) => {
    console.log("Connection failed ...");
  });

//session store
let mongoStore = new MongoDbStore({
  mongooseConnection: connection,
  collection: "sessions",
});

//event Emitter
const eventEmitter = new Emitter();
app.set("eventEmitter", eventEmitter);

//session config
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: mongoStore,

    cookie: { maxAge: 1000 * 60 * 60 * 24 }, //24 hours
  })
);

//passport config
const passportInit = require("./app/config/passport");
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

//assets
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//global middleware
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.user;
  next();
});

//set template engine
app.use(expressLayout);
app.set("views", path.join(__dirname, "/resources/views"));
app.set("view engine", "ejs");

require("./routes/web")(app);

const server = app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

//socket
const io = require("socket.io")(server);
io.on("connection", (socket) => {
  //join

  socket.on("join", (orderId) => {
    socket.join(orderId);
  });
});

eventEmitter.on("orderUpdated", (data) => {
  io.to(`order_${data.id}`).emit("orderUpdated", data);
});

eventEmitter.on("orderPlaced", (data) => {
  io.to("adminRoom").emit("orderPlaced", data);
});
