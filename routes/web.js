const homeController = require("../app/http/controllers/homeController");
const authController = require("../app/http/controllers/authController");
const productsController = require("../app/http/controllers/productsController");
const cartController = require("../app/http/controllers/customers/cartController");
const orderController = require("../app/http/controllers/customers/orderController");
const AdminOrderController = require("../app/http/controllers/admin/orderController");
const statusController = require("../app/http/controllers/admin/statusController");

//middleware
const guest = require("../app/http/middlewares/guest");

const auth = require("../app/http/middlewares/auth");
const admin = require("../app/http/middlewares/admin");

function initRoutes(app) {
  app.get("/", homeController().index);

  app.get("/products", productsController().products);

  app.get("/cart", cartController().index);

  app.get("/login", guest, authController().login);
  app.post("/login", authController().postLogin);

  app.get("/register", guest, authController().register);

  app.post("/register", authController().postRegister);
  app.post("/logout", authController().logout);

  app.post("/update-cart", cartController().update);

  //customer routes
  app.post("/orders", auth, orderController().store);
  app.get("/customers/orders", auth, orderController().index);
  app.get("/customers/orders/:id", auth, orderController().show);
  //admin routes
  app.get("/admin/orders", admin, AdminOrderController().index);
  app.post("/admin/order/status", admin, statusController().update);
}

module.exports = initRoutes;
