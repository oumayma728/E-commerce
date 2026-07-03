import { Link } from "react-router-dom";

function Footer(){

    return(
    <footer className="bg-gray-900 text-gray-400 mt-20">
       <div className="max-w-7xl mx-auto px-6 py-25 grid grid-cols-2 md:grid-cols-4 gap-8">
         <div>
             <h3 className="text-xl font-extrabold tracking-tight text-white">3lm<span className="text-indigo-600">solutions</span></h3>
             <p>La plateforme e-commerce pilotée par
                 l'intelligence artificielle.</p>
         </div>
          <div>
             <ul className="px-25">
                 <h6 className="text-white">Navigation</h6>
                 <Link to="/" className="text-sm text-gray-400 hover:text-indigo-600 transition-colors">Home</Link> <br />
                 <Link to="/products" className="text-sm text-gray-400 hover:text-indigo-600 transition-colors">Products</Link>
             </ul>
         </div>

          <div>
             <ul className="px-25">
                 <h6 className="text-white">Aide</h6>
                 <li>FAQ</li>
                 <li>Livraison</li>
                 <li>Retours</li>
                 <li>Contact</li>
             </ul>
         </div>
       </div>
 <div className="border-t border-gray-800 py-5 text-center text-xs text-gray-600">
        © 2026 3lmsolutions— Tous droits réservés
      </div>
       
     </footer>
    );
   
     
}
export default Footer;