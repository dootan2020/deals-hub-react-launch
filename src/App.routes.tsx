
import { Route } from 'react-router-dom';
import ProductsPage from './pages/ProductsPage';

// This is not a full component, just a snippet to be added to App.tsx routes
const ProductsPageRoute = (
  <Route path="/products" element={<ProductsPage />} />
);

export default ProductsPageRoute;
