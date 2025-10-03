
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type CategoryCardProps = {
  icon: ReactNode;
  title: string;
  path: string;
  count?: string;
};

const CategoryCard: React.FC<CategoryCardProps> = ({ icon, title, path, count }) => {
  return (
    <Link to={path} className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center justify-center">
      <div className="text-munaasib-red mb-2">{icon}</div>
      <h3 className="font-medium text-sm text-center">{title}</h3>
      {count && <p className="text-xs text-gray-500 mt-1 text-center">{count}</p>}
    </Link>
  );
};

export default CategoryCard;
