import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export const PageTransition = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();

    return (
        <motion.div
            key={location.pathname}
            initial={{ opacity: 0, filter: 'blur(8px)', y: 15 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            exit={{ opacity: 0, filter: 'blur(8px)', y: -15 }}
            transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1]
            }}
            className="min-h-screen"
        >
            {children}
        </motion.div>
    );
};
