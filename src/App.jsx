import Navbar from './Navbar';
import Hero from './Hero';
import Footer from './Footer';
import Products from './Products';
import { Routes, Route } from "react-router-dom";
import ProductDetail from './ProductDetail';
import { useState,createContext } from 'react';


export const cartContext=createContext();


function App() {


  const [cart,setCart]=useState([]);
  return (
    <>
  
<cartContext.Provider value={{cart,setCart}}>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/products" element={<Products/>}/>
        <Route path='/product-detail/:id' element={         
          <ProductDetail></ProductDetail>}></Route>
      </Routes>
      <Footer />
</cartContext.Provider>
    </>
  );
}

export default App;