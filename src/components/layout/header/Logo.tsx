
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center" aria-label="Home">
      <h1 className="text-2xl font-bold text-primary">
        Digital<span className="text-accent">Deals</span>Hub
      </h1>
    </Link>
  );
};

export default Logo;
