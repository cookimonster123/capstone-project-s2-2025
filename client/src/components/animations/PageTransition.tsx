import { motion } from "framer-motion";
import React from "react";

interface PageTransitionProps {
   children: React.ReactNode;
}

/**
 * Smooth page transition wrapper with fade and slide effects
 * Creates a premium feel when navigating between pages
 */
const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
   return (
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         exit={{ opacity: 0, y: -20 }}
         transition={{
            duration: 0.5,
            ease: [0.6, -0.05, 0.01, 0.99],
         }}
      >
         {children}
      </motion.div>
   );
};

export default PageTransition;
