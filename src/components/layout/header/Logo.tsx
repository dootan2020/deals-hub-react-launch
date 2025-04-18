
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center" aria-label="Home">
      <h1 className="text-2xl font-bold">
        <span className="text-[#9b87f5]">Acc</span>
        <span className="text-[#7E69AB]">Zen.net</span>
      </h1>
    </Link>
  );
};

export default Logo;
