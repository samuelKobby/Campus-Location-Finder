import React from 'react';
import { IconType } from 'react-icons';
import { motion } from 'framer-motion';

interface CategoryHeroProps {
  title: string;
  description: string;
  icon: IconType;
  backgroundImage: string;
  stats?: Array<{
    label: string;
    value: string;
  }>;
}

export const CategoryHero: React.FC<CategoryHeroProps> = ({
  title,
  description,
  icon: Icon,
  backgroundImage,
  stats,
}) => {
  return (
    <div className="relative h-[400px] overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          {/* Icon and Title */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
              <Icon className="text-white text-4xl" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">{title}</h1>
          </div>

          {/* Description */}
          <p className="text-xl text-white/90 mb-8 leading-relaxed">{description}</p>

          {/* Stats */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8"
            >
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10"
                >
                  <div className="text-3xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      <div className="absolute -bottom-px left-0 w-full h-1 bg-gray-50" />
    </div>
  );
};
