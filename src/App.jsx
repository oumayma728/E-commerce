import Navbar from './Navbar';
import Hero from './Hero';
import Footer from './Footer';
import Products from './Products';
import { Routes, Route } from "react-router-dom";
import ProductDetail from './ProductDetail';
import { useState,} from 'react';
import Cart from './Cart';
import { createContext } from 'react';
import WishList from './Wishlist';


export const cartContext=createContext();
export const wishContext=createContext();


function App() {

  const [cart,setCart]=useState([]);
  const [wishList,setWishList]=useState([]);

  return (
    <>
<cartContext.Provider value={{cart,setCart}}>
    <wishContext.Provider value={{wishList,setWishList}}>
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