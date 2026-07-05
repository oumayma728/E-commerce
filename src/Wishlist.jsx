import { useState,useEffect,useContext } from "react";
import { wishContext } from "./App";
import { Heart } from "lucide-react";
import { cartContext } from "./App";




function WishList(){
   const {wishList,setWishList}=useContext(wishContext);
   const {cart,setCart}=useContext(cartContext);

   
   const deleteFromWishList=(id)=>{
        const deleted=wishList.filter(p=>p.id!==id);
        setWishList(deleted);
   }
const addToCart = (id) => {
    const product = wishList.find(p => p.id === id);

    const qty = product.quantity;

    const exists = cart.find(item => item.id === product.id);

    if (!exists) {
        setCart(prev => [
            ...prev,
            {
                ...product,
                quantity: qty,
            },
        ]);
    } else {
        setCart(prev =>
            prev.map(item =>
                item.id === product.id
                    ? {
                          ...item,
                          quantity: item.quantity + qty,
                      }
                    : item
            )
        );
    }
};


    return(
        <div className="max-w-7xl mx-auto px-2 py-8">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {
                     wishList.map((p)=>(
                         <div className="bg-white border border-gray-200 rounded-2xl p-4 relative">
                             <button className="absolute top-3 right-3 bg-white rounded-full p-1.5 border">
                                  <Heart></Heart>
                             </button>
                             <img src={p.image} alt={p.name} className="w-full h-40 object-contain mb-4 rounded-full"/>
                             <p className="text-xs text-indigo-600 uppercase tracking-wide">{p.category}</p>
                             <h3 className="font-medium text-gray-900 mt-1">{p.name}</h3>
                            <p class="text-sm text-gray-500 mt-1">★ {p.rating} (8901)</p>
                            <p class="text-lg font-semibold text-indigo-700 mt-2">{p.price}€</p>

                            <div className="flex gap-2 mt-3">
                                  <button className="flex-1 border border-gray-300 rounded-lg py-2 text-sm" onClick={()=>deleteFromWishList(p.id)}>Supprimer</button>
                                  <button className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm" onClick={()=>addToCart(p.id)}>Ajouter au panier</button>
                            </div>
   
                         </div>
                         
                     ))
                 }
                 
             </div>
             
        </div>
    );

}
export default WishList;