import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-chef-orange rounded-lg flex items-center justify-center">
                <i className="fas fa-utensils text-white text-sm"></i>
              </div>
              <span className="text-xl font-bold">ChefGPT</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              AI-powered cooking companion that helps you create delicious meals and achieve your health goals faster.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-facebook text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-youtube text-xl"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-white">Features</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/pantry-chef" className="hover:text-white transition-colors">
                  PantryChef
                </Link>
              </li>
              <li>
                <Link href="/meal-plan-chef" className="hover:text-white transition-colors">
                  MealPlanChef
                </Link>
              </li>
              <li>
                <Link href="/master-chef" className="hover:text-white transition-colors">
                  MasterChef
                </Link>
              </li>
              <li>
                <Link href="/macros-chef" className="hover:text-white transition-colors">
                  MacrosChef
                </Link>
              </li>
              <li>
                <Link href="/mixology" className="hover:text-white transition-colors">
                  MixologyMaestro
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-white">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-white transition-colors">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 ChefGPT. All rights reserved. Made with ❤️ for home cooks everywhere.</p>
        </div>
      </div>
    </footer>
  );
}
