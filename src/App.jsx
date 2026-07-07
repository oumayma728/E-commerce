import Navbar from './Navbar';
import Hero from './Hero';
import Footer from './Footer';
import Products from './Products';
import { Routes, Route } from "react-router-dom";
import ProductDetail from './ProductDetail';
import { useEffect, useState,} from 'react';
import Cart from './Cart';
import { createContext } from 'react';
import WishList from './Wishlist';
import {Toaster} from 'react-hot-toast'

export const cartContext=createContext();
export const wishContext=createContext();


function App() {
  //hna we get the item from local storage
  const [cart,setCart]=useState(()=>{
     const saved=localStorage.getItem("cart");
     return saved?JSON.parse(saved):[];
  });
 
  //we save it into local storage (kolama cart tbdlat) save it.
  useEffect(()=>{
       localStorage.setItem("cart",JSON.stringify(cart));  
  },[cart]);

  const [wishList,setWishList]=useState(()=>{
      const saved=localStorage.getItem("wishList");
      return saved?JSON.parse(saved):[];
  });

  useEffect(()=>{
     localStorage.setItem("wishList",JSON.stringify(wishList));
  },[wishList]);




  return (
    <>
<cartContext.Provider value={{cart,setCart}}>
    <wishContext.Provider value={{wishList,setWishList}}>
      <Toaster></Toaster>
      <Navbar/> 
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/products" element={<Products/>}/>
        <Route path='/product-detail/:id' element={         
          <ProductDetail></ProductDetail>}></Route>
        <Route path='/cart' element={<Cart></Cart>}></Route>
        <Route path='/wishlist' element={<WishList></WishList>}></Route>
      </Routes>
      
      <Footer />
    </wishContext.Provider>
</cartContext.Provider>


     
      

    </>
  );
}

export default App;