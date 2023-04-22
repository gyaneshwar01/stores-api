const Products = require("../models/product");

const getAllProductsStatic = async (req, res, next) => {
  const products = await Products.find({
    price: {
      $gt: 30,
    },
  }).sort("price");
  res.status(200).json({ products, nbHits: products.length });
};

const getAllProducts = async (req, res) => {
  const { featured, company, name, sort, fields, numericFilters } = req.query;
  const queryObject = {};

  if (featured) {
    queryObject.featured = featured === "true" ? true : false;
  }
  if (company) {
    queryObject.company = company;
  }
  if (name) {
    queryObject.name = { $regex: name, $options: "i" };
  }

  if (numericFilters) {
    const operatorsMap = {
      ">": "$gt",
      ">=": "$gte",
      "<": "$lt",
      "<=": "$lte",
      "=": "$eq",
    };
    const regEx = /\b(<|>|<=|>=|=)\b/g;
    let filters = numericFilters.replace(
      regEx,
      (match) => `-${operatorsMap[match]}-`
    );

    const numericFields = ["price", "rating"];

    filters.split(",").forEach((item) => {
      const [field, operator, number] = item.split("-");
      if (numericFields.includes(field)) {
        queryObject[field] = { [operator]: parseInt(number) };
      }
    });
  }

  console.log(queryObject);

  let result = Products.find(queryObject);

  // sorting
  if (sort) {
    const sortList = sort.replace(",", " ");
    result = result.sort(sortList);
  } else {
    result = result.sort("createdAt");
  }

  // get selectedFields
  if (fields) {
    const fieldsList = fields.replace(",", " ");
    result = result.select(fieldsList);
  }

  // pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  result = result.limit(limit).skip(skip);

  const products = await result;
  res.status(200).json({ nbHits: products.length, products });
};

module.exports = { getAllProducts, getAllProductsStatic };
