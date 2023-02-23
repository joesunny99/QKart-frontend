import { Search } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box} from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard from "./ProductCard"
import Cart from "./Cart"
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import {generateCartItemsFrom} from './Cart'

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 * 
 * @property {string} name - The name or title of the product


/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 * 
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
* @property {string} productId - Unique ID for the product
*/ 


const Products = () => {
  const [productData, setProductData] = useState([]);
  const [searchKey, setSearchKey] = useState("");
  const [isEmpty, setIsEmpty] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [debounceTimeout, setDebounceTimeout] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [allProduct, setAllProduct] = useState([]);
  const [itemsInCart, setItemsInCart] = useState([]);

  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const performAPICall = async (text) => {
    setIsLoading(true);
    try {
      if(text===""){
      let response = await axios.get(`${config.endpoint}/products`);
      const data = response.data;
      setAllProduct(data);
      setIsLoading(false);
      return data;
      }
      let response = await axios.get(`${config.endpoint}/products/search?value=${text}`);
      const data = response.data;
      setIsLoading(false);
      return data;  
    }catch(error){
      console.log(error);
      setIsLoading(false);
    }
    
  };

  useEffect(()=>{
    performSearch("");
    fetchCart(localStorage.getItem('token'));
  }, []);

  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    setIsEmpty(false);   
    let data = await performAPICall(text);
    if(!data){
      setIsEmpty(true);
    }else{
      setProductData(data);
    }
  };

  
  
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeout) => {
    
    if (debounceTimeout !== 0) {
      clearTimeout(debounceTimeout);
    }
    setSearchKey(event.target.value);
    const newTimeout = setTimeout(() => performSearch(event.target.value), 500);
    setDebounceTimeout(newTimeout);
  };

  /**
   * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */
  const fetchCart = async (token) => {
    if (!token) return;

    try {
    
      let res = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      let responseData = await axios.get(`${config.endpoint}/products`);
      setItemsInCart(generateCartItemsFrom(res.data,responseData.data));
      return res.data;

    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };

  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */
  const isItemInCart = (items, productId) => {
    return items.some(item=>item["_id"]===productId);
  };

  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */
  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options 
  ) => {
    if(!options){
      
      let data = {"productId":productId,"qty":qty};
      let response = await axios.post(`${config.endpoint}/cart`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setItemsInCart(generateCartItemsFrom(response.data,products));
    }else{  

      if(!localStorage.getItem('username')){
        enqueueSnackbar(
          "Login to add an item to the Cart",
          {
            variant: "warning",
          }
        );
      }
      else if(isItemInCart(items, productId)){
        enqueueSnackbar(
          "Item already in cart. Use the cart sidebar to update quantity or remove item.",
          {
            variant: "warning",
          }
        );
      }
      else {
        //console.log("inside axios post")
        let data = {"productId":productId,"qty":qty};
        let response = await axios.post(`${config.endpoint}/cart`, data, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setItemsInCart(generateCartItemsFrom(response.data,products));
      }
    }
  };


  return (
    <div>
      <Header>      
          <TextField
          className="search-desktop"
          size="small"
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="search"
          value = {searchKey}
          onChange = {(e)=>debounceSearch(e,debounceTimeout)}
        />
      </Header>

      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        value = {searchKey}
        onChange = {(e)=>debounceSearch(e,debounceTimeout)}
      />
       <Grid container>
         <Grid item className="product-grid" md={localStorage.getItem('username')?9:12} sm={12}>
           <Box className="hero">
             <p className="hero-heading">
               India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
               to your door step
             </p>             
           </Box>
           { isLoading? (
             <Box>
              <Box display="flex" justifyContent="center" alignItems="center" sx={{height:"40vh", }}>
                 <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                    <CircularProgress/>
                    <p>Loading Products...</p>
                 </Box>
               </Box> 
            </Box>
            ) :
             isEmpty?(
               <Box display="flex" justifyContent="center" alignItems="center" sx={{height:"40vh", }}>
                 <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                    <SentimentDissatisfiedIcon/>
                    <p>No products found</p>
                 </Box>
               </Box>              
             ):(
              <Grid container spacing={2} mt={0.25} mb={2}>
                {productData.map(pData=>{
                  return (
                    <Grid item xs={6} md={3} key={pData["_id"]}>
                      <ProductCard product={pData} handleAddToCart={addToCart} items={itemsInCart} products={allProduct} />
                    </Grid>
                  );
                })
                }
            </Grid>
             )
           }
           
         </Grid>
         {localStorage.getItem('username') &&(
           <Grid item md={3} sm={12} sx={{backgroundColor: '#E9F5E1'}}>
             <Cart products={allProduct}  items={itemsInCart} handleQuantity={addToCart}/>
           </Grid>
         )
         }
       </Grid>       
      <Footer />
    </div>
  );
};

export default Products;
