import { useState,useEffect,useContext } from "react";
import { wishContext } from "./App";
import { Heart } from "lucide-react";
import { cartContext } from "./App";
import { Trash } from "lucide-react";
import { EyeIcon } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";



function WishList(){
   const {wishList,setWishList}=useContext(wishContext);
   const {cart,setCart}=useContext(cartContext);



const deleteAllWishList=()=>{
     setWishList([]);
}


   
const deleteFromWishList=(id)=>{
        const deleted=wishList.filter(p=>p.id!==id);
        setWishList(deleted);
        toast.error(`Product removed from Wish list`,{
            style: {
                    background: '#ef4444', 
                    color: '#fff',
                    fontWeight: '500',
            },
            iconTheme: {
            primary: '#fff',
            secondary: '#22c55e',
            },
        });
        
}
const addToCart = (id) => {
    const product = wishList.find(p => p.id === id);

    const qty = 1;

    const exists = cart.find(item => item.id === product.id);

    if (!exists) {
        setCart(prev => [
            ...prev,
            {
                ...product,
                quantity: qty,
            },
        ]);

        toast.success(`${product.name} added to cart`,{
        style: {
        background: '#22c55e', 
        color: '#fff',
        fontWeight: '500',
        },
        iconTheme: {
        primary: '#fff',
        secondary: '#22c55e',
        },
   });


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
        toast.success(`${product.name} added to cart`,{
        style: {
        background: '#22c55e', 
        color: '#fff',
        fontWeight: '500',
        },
        iconTheme: {
        primary: '#fff',
        secondary: '#22c55e',
        },
   });
    }
  
};

if (wishList.length === 0) {
    return (
        <div className="text-center py-24">
            <h2 className="text-3xl font-bold">
                Your Wish list is empty
            </h2>

            <Link to="/products">
            <p className="text-gray-500 mt-4">
                View Products :D
            </p>
            </Link>
        </div>
    );

} 
    return(
        <div className="max-w-7xl mx-auto px-2 py-8">


     
             <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight">
                    Your Wish List
                </h1>

                <button
                    onClick={deleteAllWishList}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl shadow transition"
                >
                    <Trash size={18} />
                    Clear Wish list
                </button>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {
                     wishList.map((p)=>(
                         <div className="bg-white border border-gray-200 rounded-2xl p-4 relative">
                           <Link to={`/product-detail/${p.id}`}>
                                <button className="absolute top-3 right-3 bg-white rounded-full p-1.5 border hover:bg-indigo-600 hover:text-white">
                                      <EyeIcon></EyeIcon> 
                                </button>
                           </Link>

                
                             <img src={p.image} alt={p.name} className="w-full h-40 object-contain mb-4 rounded-full"/>
                             <p className="text-xs text-indigo-600 uppercase tracking-wide">{p.category}</p>
                             <h3 className="font-medium text-gray-900 mt-1">{p.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">★ {p.rating} (8901)</p>
                            <p className="text-lg font-semibold text-indigo-700 mt-2">{p.price}€</p>

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