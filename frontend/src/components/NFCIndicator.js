import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdNfc } from 'react-icons/md';

export default function NFCIndicator() {
  const [isNFCSupported, setIsNFCSupported] = useState(false);
  const [isNFCActive, setIsNFCActive] = useState(false);

  useEffect(() => {
    // Check if NFC is supported in a more browser-compatible way
    const checkNFCSupport = async () => {
      try {
        // @ts-ignore - NDEFReader might not be recognized by TypeScript
        if (typeof window !== 'undefined' && 'NDEFReader' in window) {
          setIsNFCSupported(true);
          try {
            // @ts-ignore
            const ndef = new window.NDEFReader();
            await ndef.scan();
            setIsNFCActive(true);
            
            ndef.onreading = () => {
              // Pulse animation when NFC is read
              setIsNFCActive(prev => !prev);
              setTimeout(() => setIsNFCActive(prev => !prev), 200);
            };
          } catch (error) {
            console.log('NFC available but not active:', error);
            setIsNFCActive(false);
          }
        }
      } catch (error) {
        console.log('NFC not supported:', error);
        setIsNFCSupported(false);
      }
    };

    checkNFCSupport();
  }, []);

  return (
    <motion.div
      className="absolute top-4 right-28 flex items-center"
      animate={{
        opacity: isNFCActive ? 1 : 0.6
      }}
    >
      <motion.div
        animate={{
          scale: isNFCActive ? [1, 1.2, 1] : 1
        }}
        transition={{
          duration: 0.5,
          repeat: isNFCActive ? Infinity : 0,
          repeatType: "reverse"
        }}
      >
        <MdNfc
          className={isNFCActive ? "text-green-500" : (isNFCSupported ? "text-yellow-500" : "text-gray-500")}
          size={24}
        />
      </motion.div>
      <span className={`ml-2 text-xs ${
        isNFCActive ? "text-green-500" : (isNFCSupported ? "text-yellow-500" : "text-gray-500")
      }`}>
        {isNFCSupported ? (isNFCActive ? "NFC activo" : "NFC inactivo") : "NFC no soportado"}
      </span>
    </motion.div>
  );
} 