import React, { useMemo } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";

interface PageTransitionProps {
   children: React.ReactNode;
}

/**
 * Smooth page transition wrapper with fade and slide effects
 * Creates a premium feel when navigating between pages
 */
const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
   const prefersReducedMotion = useReducedMotion();

   // Memoize variants and transition to avoid re-creating objects on each render
   const variants = useMemo(
      () => ({
         initial: { opacity: 0, y: 20 },
         animate: { opacity: 1, y: 0 },
         exit: { opacity: 0, y: -20 },
      }),
      [],
   );

   const transition = useMemo(
      () => ({
         duration: 0.5,
         ease: [0.6, -0.05, 0.01, 0.99] as [number, number, number, number],
      }),
      [],
   );

   // Respect OS/user preference to reduce motion
   if (prefersReducedMotion) {
      return <div>{children}</div>;
   }

   return (
      <LazyMotion features={domAnimation} strict>
         <m.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            transition={transition}
         >
            {children}
         </m.div>
      </LazyMotion>
   );
};

export default PageTransition;
