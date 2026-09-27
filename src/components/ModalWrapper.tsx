import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

export const ModalWrapper: React.FC<ModalWrapperProps> = ({
  isOpen,
  onClose,
  children,
  maxWidth = 'max-w-md',
  className = '',
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop with smooth blur and fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Content with spring entrance, scale, and subtle slide */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{
              type: 'spring',
              damping: 26,
              stiffness: 340,
              mass: 0.8,
            }}
            className={`relative z-10 w-full ${maxWidth} my-auto ${className}`}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
