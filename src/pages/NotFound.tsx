
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="text-center">
      <h1 className="text-6xl font-bold text-munaasib-red">404</h1>
      <p className="text-2xl mt-4">Page Not Found</p>
      <p className="text-gray-600 mt-2">Sorry, the page you are looking for does not exist.</p>
      <Link to="/" className="mt-6 inline-block bg-munaasib-red text-white px-6 py-3 rounded-full">
        Go to Homepage
      </Link>
    </div>
  );
};

export default NotFound;
