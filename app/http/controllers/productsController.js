const Product = require("../../models/Product");

function productsController() {
  return {
    async products(req, res) {
      const foods = await Product.find();

      res.render("products", { foods: foods });
    },
  };
}

module.exports = productsController;
