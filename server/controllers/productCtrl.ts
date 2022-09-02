import { Request, Response } from 'express'
import Products from '../models/productModel'
import { IReqAuth } from '../utils/interface'
import mongoose from 'mongoose'


const Pagination = (req: IReqAuth) => {
  let page = Number(req.query.page) * 1 || 1;
  let limit = Number(req.query.limit) * 1 || 4;
  let skip = (page - 1) * limit;

  return { page, limit, skip };
}


const productCtrl = {
  createProduct: async (req: IReqAuth, res: Response) => {
    if(!req.user) return res.status(400).json({msg: "Invalid Authentication."})

    try {
      const { name,  image , price   , countInStock , description , thumbnail, category } = req.body

      const newProduct = new Products({
        user: req.user.name,
        name: name.toLowerCase(), 
        image,
        price,
        countInStock,
        description, 
        thumbnail, 
        category
       
      }) 

      await newProduct.save()
      res.status(201).json({
        ...newProduct._doc,
        user: req.user
      })

    } catch (err: any) {
      return res.status(500).json({msg: err.message})
    }
  },
  getHomeProducts: async (req: Request, res: Response) => {
    try {
      const products = await Products.aggregate([
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
      ])

      res.json(Products)

    } catch (err: any) {
      return res.status(500).json({msg: err.message})
    }
  },
  //////////////********* */

  /**
 * Fetch all products
 * @route GET /api/products
 * @access Public
 */
 getProducts : async (req: Request, res: Response) => {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;
  
    // Get search keyword from request and search for partial match
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: "i",
          } as any,
        }
      : {};
  
    const count = await Products.countDocuments({ ...keyword });
    const product = await Products.find({ ...keyword })
      .limit(pageSize)
      .skip(pageSize * (page - 1));
  
    res.json({ product, page, pages: Math.ceil(count / pageSize) });
  },
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
  updateProduct: async (req: IReqAuth, res: Response) => {
    if(!req.user) 
      return res.status(400).json({msg: "Invalid Authentication."})

    try {
      const product = await Products.findOneAndUpdate({
        _id: req.params.id, user: req.user._id
      }, req.body)

      if(!product) return res.status(400).json({msg: "Invalid Authentication."})

      res.json({ msg: 'Update Success!', product })

    } catch (err: any) {
      return res.status(500).json({msg: err.message})
    }
  },
  ///**** */
  deleteProduct: async (req: IReqAuth, res: Response) => {
    if(!req.user) 
      return res.status(400).json({msg: "Invalid Authentication."})

    try {
      // Delete Product
      const product = await Products.findOneAndDelete({
        _id: req.params.id, user: req.user._id
      })

      if(!product) 
        return res.status(400).json({msg: "Invalid Authentication."})

      

    } catch (err: any) {
      return res.status(500).json({msg: err.message})
    }
  },
  searchProducts: async (req: Request, res: Response) => {
    try {
      const products = await Products.aggregate([
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
        { $limit: 5},
        {
          $project: {
            title: 1,
            description: 1,
            thumbnail: 1,
            createdAt: 1
          }
        }
      ])

      if(!products.length)
        return res.status(400).json({msg: 'No Products.'})

      res.json(products)

    } catch (err: any) {
      return res.status(500).json({msg: err.message})
    }
  },
}


export default productCtrl;

function asyncHandler(arg0: (req: Request, res: Response) => Promise<void>) {
  throw new Error('Function not implemented.')
}


