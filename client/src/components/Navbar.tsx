import { Link } from 'wouter';

const Navbar = () => {
  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="text-xl font-bold">Puppeteer Spammer Client</div>
          <div className="flex space-x-6">
            <Link to="/" className="hover:text-indigo-200 transition-colors">
              Dashboard
            </Link>
            <Link
              to="/tasks"
              className="hover:text-indigo-200 transition-colors"
            >
              Tasks
            </Link>
            <Link
              to="/groups"
              className="hover:text-indigo-200 transition-colors"
            >
              Groups
            </Link>
            <Link
              to="/posts"
              className="hover:text-indigo-200 transition-colors"
            >
              Posts
            </Link>
            <Link
              to="/session"
              className="hover:text-indigo-200 transition-colors"
            >
              Session
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
