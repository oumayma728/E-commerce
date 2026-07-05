import { useEffect,useContext } from "react";
import { cartContext } from "./App";
import { Trash } from "lucide-react";

function Cart() {
    const {cart,setCart}=useContext(cartContext);


 
    const deleteProduct=(id)=>{
         const deleted=cart.filter(item=>item.id!==id);
         setCart(deleted);
    }
    const clearAllCart=()=>{
        setCart([]);
    }

    const handleCartQuantityPlus=(id)=>{
          setCart(prev =>
            prev.map(item =>
                item.id === id
            ? { ...item, quantity: item.quantity + 1 }
            : item
       )
     );
    }

    const handleCartQuantityMinus=(id)=>{
         setCart(c=>c.map(
             item=>item.id===id && item.quantity>1?{
                 ...item,
                 quantity:item.quantity-1
             }:item
         ));
    }

    return(
      <div className="max-w-7xl mx-auto px-6 py-12">

            <div className="flex items-center justify-between mb-10">
                <h1 className="text-4xl font-bold text-gray-900">
                    Your Cart
                </h1>

                <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl transition shadow-md" onClick={clearAllCart}>
                    <Trash size={18}/>
                         Clear Cart
                </button>
    </div>

    <div className="space-y-6">

        {cart.map((p) => (

            <div
                key={p.id}
                className="flex items-center justify-between bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition"
            >

                {/* Image */}

                <div className="w-32 h-32 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden">

                    <img
                        src={p.image[0]}
                        alt={p.name}
                        className="w-24 object-contain"
                    />

                </div>

                {/* Product Info */}

                <div className="flex-1 ml-8">

                    <h2 className="text-xl font-semibold text-gray-900">
                        {p.name}
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        {p.category}
                    </p>

                    <div className="flex items-center gap-4 mt-4">

                        <span className="text-2xl font-bold text-indigo-600">
                            {p.price} €
                        </span>

                        <span className="text-yellow-500 font-medium">
                            ⭐ {p.rating}
                        </span>
                        

                    </div>
                     <span className="text-black-500 font-medium">
                             x{p.quantity}
                    </span>

                </div>
         <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden mr-100">

                    <button className="w-12 h-12 text-xl hover:bg-gray-100 transition"
                        onClick={() => handleCartQuantityMinus(p.id)}> −
                    </button>

                    <span className="w-12 text-center font-semibold">
                        {p.quantity}
                    </span>

                    <button
                        className="w-12 h-12 text-xl hover:bg-gray-100 transition"
                        onClick={() => handleCartQuantityPlus(p.id)}
                    >
                        +
                    </button>

         </div>
                {/* boutton dial delete*/}

                

                <button className="w-12 h-12 rounded-xl border border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition flex items-center justify-center" onClick={()=>deleteProduct(p.id)}>

                    <Trash size={20}/>
                </button>
                

            </div>

        ))}

    </div>

</div>
        
    );

  
}
export default Cart;