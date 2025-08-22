// filepath: c:\Users\andre\Documents\DataShieldFinance\App\DataShieldFinance\src\components\AnimatedBackground.jsx
import { motion } from 'framer-motion';
import React from 'react';

const AnimatedBackground = ({ children }) => {
  return (
    <motion.div
      className="animated-background"
      initial={{ background: "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)" }}
      animate={{
        background: [
          "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)",
          "linear-gradient(to right, #43e97b 0%, #38f9d7 100%)",
          "linear-gradient(to right, #fa709a 0%, #fee140 100%)",
          "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)"
        ]
      }}
      transition={{ duration: 10, repeat: Infinity }}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedBackground;