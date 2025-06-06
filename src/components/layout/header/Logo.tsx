
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center" aria-label="Home">
      <h1 className="text-2xl font-bold">
        <span className="text-primary">acczen</span>
        <span className="text-primary-dark">.net</span>
      </h1>
    </Link>
  );
};

export default Logo;
