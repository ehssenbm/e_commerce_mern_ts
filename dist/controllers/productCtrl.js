"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const productModel_1 = __importDefault(require("../models/productModel"));
const Pagination = (req) => {
    let page = Number(req.query.page) * 1 || 1;
    let limit = Number(req.query.limit) * 1 || 4;
    let skip = (page - 1) * limit;
    return { page, limit, skip };
};
const productCtrl = {
    createProduct: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user)
            return res.status(400).json({ msg: "Invalid Authentication." });
        try {
            const { name, image, price, countInStock, description, thumbnail, category } = req.body;
            const newProduct = new productModel_1.default({
                user: req.user.name,
                name: name.toLowerCase(),
                image,
                price,
                countInStock,
                description,
                thumbnail,
                category
            });
            yield newProduct.save();
            res.status(201).json(Object.assign(Object.assign({}, newProduct._doc), { user: req.user }));
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }),
    getHomeProducts: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const products = yield productModel_1.default.aggregate([
                // User
                {
                    $lookup: {
                        from: "users",
                        let: { user_id: "$user" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$_id", "$$user_id"] } } },
                            { $project: { password: 0 } }
                        ],
                        as: "user"
                    }
                },
                // array -> object
                { $unwind: "$user" },
                // Category
                {
                    $lookup: {
                        "from": "categories",
                        "localField": "category",
                        "foreignField": "_id",
                        "as": "category"
                    }
                },
                // array -> object
                { $unwind: "$category" },
                // Sorting
                { $sort: { "createdAt": -1 } },
                // Group by category
                {
                    $group: {
                        _id: "$category._id",
                        name: { $first: "$category.name" },
                        Products: { $push: "$$ROOT" },
                        count: { $sum: 1 }
                    }
                },
                // Pagination for Products
                {
                    $project: {
                        Products: {
                            $slice: ['$products', 0, 4]
                        },
                        count: 1,
                        name: 1
                    }
                }
            ]);
            res.json(productModel_1.default);
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }),
    //////////////********* */
    /**
   * Fetch all products
   * @route GET /api/products
   * @access Public
   */
    getProducts: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const pageSize = 10;
        const page = Number(req.query.pageNumber) || 1;
        // Get search keyword from request and search for partial match
        const keyword = req.query.keyword
            ? {
                name: {
                    $regex: req.query.keyword,
                    $options: "i",
                },
            }
            : {};
        const count = yield productModel_1.default.countDocuments(Object.assign({}, keyword));
        const product = yield productModel_1.default.find(Object.assign({}, keyword))
            .limit(pageSize)
            .skip(pageSize * (page - 1));
        res.json({ product, page, pages: Math.ceil(count / pageSize) });
    }),
    ///////////***** */
    /*getProductsByCategory: async (req: Request, res: Response) => {
      const { limit, skip } = Pagination(req)
  
      try {
        const Data = await Products.aggregate([
          {
            $facet: {
              totalData: [
                {
                  $match:{
                    category: mongoose.Types.ObjectId(req.params.id)
                  }
                },
                // User
                {
                  $lookup:{
                    from: "users",
                    let: { user_id: "$user" },
                    pipeline: [
                      { $match: { $expr: { $eq: ["$_id", "$$user_id"] } } },
                      { $project: { password: 0 }}
                    ],
                    as: "user"
                  }
                },
                // array -> object
                { $unwind: "$user" },
                // Sorting
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit }
              ],
              totalCount: [
                {
                  $match: {
                    category: mongoose.Types.ObjectId(req.params.id)
                  }
                },
                { $count: 'count' }
              ]
            }
          },
          {
            $project: {
              count: { $arrayElemAt: ["$totalCount.count", 0] },
              totalData: 1
            }
          }
        ])
  
        const products = Data[0].totalData;
        const count = Data[0].count;
  
        // Pagination
        let total = 0;
  
        if(count % limit === 0){
          total = count / limit;
        }else {
          total = Math.floor(count / limit) + 1;
        }
  
        res.json({ products, total })
      } catch (err: any) {
        return res.status(500).json({msg: err.message})
      }
    },
    getProductsByUser: async (req: Request, res: Response) => {
      const { limit, skip } = Pagination(req)
  
      try {
        const Data = await Products.aggregate([
          {
            $facet: {
              totalData: [
                {
                  $match:{
                    user: mongoose.Types.ObjectId(req.params.id)
                  }
                },
                // User
                {
                  $lookup:{
                    from: "users",
                    let: { user_id: "$user" },
                    pipeline: [
                      { $match: { $expr: { $eq: ["$_id", "$$user_id"] } } },
                      { $project: { password: 0 }}
                    ],
                    as: "user"
                  }
                },
                // array -> object
                { $unwind: "$user" },
                // Sorting
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit }
              ],
              totalCount: [
                {
                  $match: {
                    user: mongoose.Types.ObjectId(req.params.id)
                  }
                },
                { $count: 'count' }
              ]
            }
          },
          {
            $project: {
              count: { $arrayElemAt: ["$totalCount.count", 0] },
              totalData: 1
            }
          }
        ])
  
        const products = Data[0].totalData;
        const count = Data[0].count;
  
        // Pagination
        let total = 0;
  
        if(count % limit === 0){
          total = count / limit;
        }else {
          total = Math.floor(count / limit) + 1;
        }
  
        res.json({ products, total })
      } catch (err: any) {
        return res.status(500).json({msg: err.message})
      }
    },
    ////*** */
    /* getProduct: async (req: Request, res: Response) => {
       try {
         const product = await Products.findOne({_id: req.params.id})
         .populate("user", "-password")
   
         if(!product) return res.status(400).json({ msg: "Product does not exist." })
   
         return res.json(product)
       } catch (err: any) {
         return res.status(500).json({ msg: err.message })
       }
     },
     ////***** */
    ///////////*******  */
    updateProduct: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user)
            return res.status(400).json({ msg: "Invalid Authentication." });
        try {
            const product = yield productModel_1.default.findOneAndUpdate({
                _id: req.params.id, user: req.user._id
            }, req.body);
            if (!product)
                return res.status(400).json({ msg: "Invalid Authentication." });
            res.json({ msg: 'Update Success!', product });
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }),
    ///**** */
    deleteProduct: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user)
            return res.status(400).json({ msg: "Invalid Authentication." });
        try {
            // Delete Product
            const product = yield productModel_1.default.findOneAndDelete({
                _id: req.params.id, user: req.user._id
            });
            if (!product)
                return res.status(400).json({ msg: "Invalid Authentication." });
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }),
    searchProducts: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const products = yield productModel_1.default.aggregate([
                {
                    $search: {
                        index: "searchName",
                        autocomplete: {
                            "query": `${req.query.name}`,
                            "path": "name"
                        }
                    }
                },
                { $sort: { createdAt: -1 } },
                { $limit: 5 },
                {
                    $project: {
                        title: 1,
                        description: 1,
                        thumbnail: 1,
                        createdAt: 1
                    }
                }
            ]);
            if (!products.length)
                return res.status(400).json({ msg: 'No Products.' });
            res.json(products);
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }),
};
exports.default = productCtrl;
function asyncHandler(arg0) {
    throw new Error('Function not implemented.');
}
//# sourceMappingURL=productCtrl.js.map