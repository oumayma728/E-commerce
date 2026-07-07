import { useState,useEffect,useContext } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import {ShoppingCart, Heart, ChevronLeft, Star, CheckCircle2, AlertTriangle, Sparkles} from "lucide-react";
import { cartContext } from "./App";
import { wishContext } from "./App";
import toast from "react-hot-toast";



function ProductDetail(){

const {cart,setCart}=useContext(cartContext);
const {wishList,setWishList}=useContext(wishContext);

const {id}=useParams();

   const [products,setProducts]=useState([]);
   const [quantity,setQuantity]=useState(0);
   const [images,setImage]=useState(0);
   const [reviews,setReviews]=useState([]);
 

const handleWish=()=>{
     if(wished){
         setWishList(p=>p.filter(item=>item.id!==product.id));
         toast.error('Product removed from wish list ❌',{
             style:{
                    background: '#ef4444', 
                    color: '#fff',
                    fontWeight: '500',
             },
             iconTheme: {
            primary: '#fff',
            secondary: '#22c55e',
             },
         })
         
     }
     else{
         setWishList(p=>[...p,product]);
         toast.success('Product added to wish list ❤️',{
             style:{
                    background: '#22c55e', 
                    color: '#fff',
                    fontWeight: '500',
             },
             iconTheme: {
            primary: '#fff',
            secondary: '#22c55e',
             },
         })
     }
}

const handleCart = () => {
   const qty = quantity === 0 ? 1 : quantity;

   const exists=cart.find(item=>item.id===product.id);
   if(!exists){
      setCart(c=>[...c,{
          ...product,
          quantity:qty
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
   }
   else{
     setCart(p=>p.map(item=>
         item.id===product.id?{
             ...item,
             quantity:item.quantity+qty

         }:item
     ))
   };
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
 
   const handleQuantityPlus=()=>{
       
        setQuantity(q=>q+1);
   }
    const handleQuantityMinus=()=>{
        if(quantity>0){
            setQuantity(q=>q-1);
        }
        
   }



   const handleImage=(index)=>{
      setImage(index);
   }
 
   useEffect(()=>{
        async function loadProducts(){
             const response= await fetch("/api/products");
             const data = await response.json();
             setProducts(data);
        }  
        loadProducts();
    },[])
  

const product=products.find(p=>p.id===Number(id));
const wished=wishList.some(item=>item.id===product?.id);
const produitSimilaire = products.filter((p) => {
    return p.category === product.category && p.id !== product.id;
});




if(products.length === 0){
    return <p>Chargement...</p>;
}

if(!product){
    return <p>Produit introuvable.</p>;
}
    return(
     <div className="max-w-7xl mx-auto px-2 py-8">
            <nav className="flex items-center gap-1.5 text-xs text-gray-500 ">
                 <Link to="/" className="hover:text-gray-900">Acceuil</Link>
                 <span>/</span>
                 <Link to="/products" className="hover:text-gray-900">Produits</Link>
                 <span>/</span>
                 <p>{product.name}</p>                 
            </nav>
        <div>
            <div className="mt-8">

    <div className="grid grid-cols-2 gap-16 lg:grid-cols-2">
        <div>
            <div className="bg-gray-50 border border-gray-200 rounded-3xl h-[500px] flex items-center justify-center">
                <img
                    src={product.image[images]}
                    alt={product.name}
                    className="w-110 object-contain hover:scale-105 transition duration-300 rounded-xl"
                />
            </div>

            <div className="flex gap-4 mt-5">
                {product.image.map((img, index) => (
                    <button
                        key={index}
                        onClick={() => handleImage(index)}
                        className={`w-16 h-16 rounded-xl border flex items-center justify-center
                            ${
                                images === index
                                ? "border-2 border-indigo-500"
                                : "border-gray-200 hover:border-indigo-400"
                            }`}
                    >

                        <img
                            src={img}
                            className="w-9 object-contain rounded-xl"
                        />

                    </button>

                ))}

            </div>

        </div>

        {/* RIGHT */}

        <div>

            <div className="flex items-center gap-3">
                <p className="uppercase tracking-widest text-xs text-gray-400 font-semibold">
                    {product.category}
                </p>
            </div>
            <h1 className="font-bold text-5xl mt-5">
                {product.name}
            </h1>
            <div className="flex items-center gap-2 mt-5">
                <span className="text-yellow-400 text-lg">
                    ⭐⭐⭐⭐⭐
                </span>
                <span className="text-gray-600">
                    {product.rating}
                </span>
                <span className="text-gray-400">
                    • 8901 avis
                </span>
            </div>
           <h2 className="font-bold text-5xl mt-8">
                {product.price} €
            </h2>
            <p className="text-gray-600 leading-8 mt-7">
               Caméra professionnelle 48 MP, puce A18 Pro,
                et un écran Super Retina XDR de 6,3 pouces.
            </p>
            <div className="flex items-center gap-2 mt-7">
                <CheckCircle2
                    size={18}
                    className="text-green-600"
                />

                <p className="text-green-600 font-medium">
                    En stock (12 disponibles)

                </p>

            </div>

            {/* Buttons */}

            <div className="flex gap-4 mt-8">

                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">

                    <button className="px-5 py-4 hover:bg-gray-100" onClick={handleQuantityMinus} >
                        -
                    </button>

                    <span className="px-5 font-medium" >
                        {quantity}
                    </span>
                    <button className="px-5 py-4 hover:bg-gray-100" onClick={handleQuantityPlus}>
                        +
                    </button>

                </div>

                <button className="flex-1 bg-slate-900 text-white rounded-xl flex items-center justify-center gap-2 font-semibold hover:bg-indigo-600 transition" onClick={handleCart}>
                    <ShoppingCart size={18}/>
                    Ajouter au panier
                </button>
                <button className={`w-14 h-14 border rounded-xl flex items-center justify-center transition
                        ${
                          wished? "bg-red-500 text-white border-red-500":"border-gray-200 hover:bg-red-500 hover:text-white"
                     }`} onClick={handleWish}>
                    <Heart size={18} fill={wished ? "currentColor" : "none"}/>
                </button>

            </div>

        </div>

     </div>

   </div>
             
        </div>

        <div className="mt-9">
             <h2 className="text-2xl font-bold text-gray-900 mt-10">
                         Avis clients
            </h2>
                 {product.reviews.map((review)=>(
                    <div key={review.id} className="bg-gray-100 border border-gray-100 rounded-xl p-4 mt-3">
                        <div className="flex items-center justify-between mt-4">
                               <h3 className="font-semibold text-gray-900">
                                        {review.author}
                               </h3>
                               <p className="text-gray-600 text-sm">{review.date}</p>
                        </div>
                        <div>
                           <span className="text-yellow-400 text-sm">
                                    ⭐⭐⭐⭐⭐
                            </span>
                            <span className="text-gray-600 text-sm">
                                {product.rating}
                            </span>

                            <p className="mt-2">{review.comment}</p>
                        </div>            
                    </div>        
                 ))}  
              <div>
                 
             </div>
        </div>
        
        <div className="mt-10">
             <h2 className="text-2xl font-bold text-gray-900">Produits similaires</h2>
        </div>

      <div className="grid grid-cols-4 gap-6 mt-6">
            {produitSimilaire.map((p) => (
                <Link
                    key={p.id}
                    to={`/product-detail/${p.id}`}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition"
                >
                    <img
                        src={p.image[0]}
                        alt={p.name}
                        className="w-full h-52 object-cover"
                    />

                    <div className="p-4">
                        <h3 className="font-semibold">
                            {p.name}
                        </h3>

                        <p className="text-gray-500 text-sm">
                            {p.category}
                        </p>

                        <div className="flex justify-between mt-3">
                            <span className="font-bold">
                                {p.price} €
                            </span>

                            <span>
                                ⭐ {p.rating}
                            </span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    </div>                  
           
      

         
     );
}

export default ProductDetail;