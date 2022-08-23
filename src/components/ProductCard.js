import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Box,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart, items, products }) => {
  const {name, category, cost, rating, image, _id} = product;

  const handleInput =async(e) =>{
    await handleAddToCart(localStorage.getItem('token'),items, products, _id, 1, true);
  }

  return (
    <Card className="card">
      <Box height="200">
        <CardMedia component="img"  image={image} />
      </Box>
      <CardContent>
        <Typography variant="subtitle2">{name}</Typography>
        <Typography>${cost}</Typography>
        <Rating name="read-only" value={rating} readOnly />
      </CardContent>
      <CardActions>
        <Button variant="contained" sx={{width:'100%'}} startIcon={<AddShoppingCartOutlined />} onClick={(e)=>handleInput(e)}>ADD TO CART</Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
