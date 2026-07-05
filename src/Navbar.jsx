import { Link } from "react-router-dom";

import { useContext, useEffect,useState } from "react";
import { cartContext } from "./App";




function Navbar(){
  
     const {cart}=useContext(cartContext);
     const [quantity,setQuantity]=useState(0);
      
     
      const totalQuantity=cart.reduce((sum,item)=>
           sum+item.quantity,
           0
      ) ;
    return (
        
           <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
             <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                  <h1 className="text-2xl font-extrabold tracking-tight">3lm<span className="text-indigo-600">solutions</span></h1>
              

              <div className="hidden md:flex items-center gap-8">
                  <Link to="/" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">Home</Link>
                  <Link to="/products" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">Products</Link>
                  <Link to="/categories" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">Categories</Link>
                  <Link to="/deals" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">Deals</Link>
              </div>

              <div className="flex items-center gap-3">
                  <button className="text-sm text-gray-600 hover:text-indigo-600 transition-colors px-3 py-2">Sign in</button>
                 <Link to="/cart">
                       <button className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors shadow-sm">Cart:{totalQuantity}</button>

                  </Link> 
              </div>
            </div>
           </nav>
      
       );
}
export default Navbar;