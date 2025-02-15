import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AiOutlineUsergroupAdd, AiOutlineRobot } from "react-icons/ai";
import { useAccount } from 'wagmi';
import NFCIndicator from './NFCIndicator';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

// We'll define a small palette of orange/red shades.
const EMBER_COLORS = [
  "#FF4500", // OrangeRed
  "#FF6347", // Tomato
  "#FF7F50", // Coral
  "#FF8C00", // DarkOrange
  "#FF0000", // Red
  "#E25822", // Flame
  "#D73C10"  // Darker Red-Orange
];

// Helper function to get a random item from an array
function randomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function Firesides({ modal }) {
  const [cursorX, setCursorX] = useState(0);
  const [cursorY, setCursorY] = useState(0);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [embers, setEmbers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [memoryType, setMemoryType] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [message, setMessage] = useState("");
  const [showAIFriends, setShowAIFriends] = useState(false);
  const [showAISummary, setShowAISummary] = useState(false);

  const { address } = useAccount();

  // Decide if header should be smaller
  const isHeaderSmall = isConnected || isCreating || isConfirming;

  // Hardcoded style for 3D-ish buttons
  const buttonClass =
    "px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl shadow-inner drop-shadow-lg";

  useEffect(() => {
    function handleResize() {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Cursor tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorX(e.clientX);
      setCursorY(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Generate random embers on mount
  useEffect(() => {
    if (!windowSize.width || !windowSize.height) return;

    const emberCount = 12;
    const newEmbers = [];
    for (let i = 0; i < emberCount; i++) {
      newEmbers.push({
        x: Math.random() * windowSize.width,
        y: Math.random() * windowSize.height,
        size: 20 + Math.random() * 40,
        color: randomFromArray(EMBER_COLORS),
        speed: 0.7 + Math.random() * 0.6
      });
    }
    setEmbers(newEmbers);
  }, [windowSize]);

  const REPEL_RADIUS = 300;
  const REPEL_FORCE = 3.5;

  useEffect(() => {
    const interval = setInterval(() => {
      setEmbers((prev) => {
        return prev.map((ember) => {
          let { x, y, speed } = ember;

          y -= speed;
          if (y < -100) {
            y = windowSize.height + 50;
            x = Math.random() * windowSize.width;
          }

          const dx = x - cursorX;
          const dy = y - cursorY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < REPEL_RADIUS) {
            const factor = (REPEL_RADIUS - dist) / REPEL_RADIUS * REPEL_FORCE;
            x += (dx / dist) * factor * 10;
            y += (dy / dist) * factor * 10;
          }

          return {
            ...ember,
            x,
            y,
          };
        });
      });
    }, 30);

    return () => clearInterval(interval);
  }, [cursorX, cursorY, windowSize]);

  // Effect to handle wallet connection
  useEffect(() => {
    if (address) {
      setIsConnected(true);
      toast.success('¡Wallet conectada!', {
        position: "top-center",
        autoClose: 2000,
      });
    } else {
      setIsConnected(false);
    }
  }, [address]);

  const handleCreateMemory = () => {
    setIsCreating(true);
  };

  const handleSelectMemoryType = (type) => {
    setMemoryType(type);
  };

  const handleMediaChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      toast.info('Subida de archivos en desarrollo', {
        position: "top-center",
        autoClose: 2000,
      });
    }
  };

  const handleConfirmMemory = async () => {
    setIsConfirming(true);
    try {
      const memoryData = {
        memoryType,
        data: memoryType === 'message' ? message : 'media_url_here',
      };

      const response = await axios.post('http://localhost:3001/api/memories', memoryData);

      if (response.data.success) {
        toast.success('¡Memoria guardada!', {
          position: "top-center",
          autoClose: 2000,
        });
      }

      setTimeout(() => {
        setMessage("");
        setIsCreating(false);
        setIsConfirming(false);
        setMemoryType("");
      }, 2000);
    } catch (error) {
      console.error('Error storing memory:', error);
      toast.error('Error al guardar la memoria', {
        position: "top-center",
        autoClose: 2000,
      });
      setIsConfirming(false);
    }
  };

  const handleToggleAIFriends = () => {
    setShowAIFriends(!showAIFriends);
  };

  const handleToggleAISummary = () => {
    setShowAISummary(!showAISummary);
  };

  const handleAIHelpMessage = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/ai-message', {
        prompt: "Genera un mensaje memorable para la hackerhouse"
      });
      
      if (response.data.success) {
        setMessage(response.data.message);
        toast.info('¡Mensaje AI generado!', {
          position: "top-center",
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error('Error getting AI message:', error);
      toast.error('Error al generar mensaje AI', {
        position: "top-center",
        autoClose: 2000,
      });
    }
  };

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      {embers.map((ember, i) => {
        const dx = ember.x - cursorX;
        const dy = ember.y - cursorY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const baseBrightness = 3.0;
        const maxBrightness = 7.0;
        const extra = (REPEL_RADIUS - dist) / REPEL_RADIUS * 1.8;
        const brightnessFactor = Math.min(maxBrightness, baseBrightness + Math.max(0, extra));

        return (
          <motion.div
            key={i}
            className="absolute rounded-full mix-blend-screen"
            style={{
              width: ember.size,
              height: ember.size,
              left: ember.x,
              top: ember.y,
              backgroundColor: ember.color,
              filter: `blur(${ember.size * 1}px) brightness(${brightnessFactor})`,
              opacity: 1,
            }}
          />
        );
      })}

      <div
        className={`${
          isHeaderSmall
            ? "fixed top-2 left-1/2 -translate-x-1/2 flex flex-col items-center z-10 text-base"
            : "text-center flex flex-col items-center relative z-10 mb-2"
        } transition-all`}
      >
        <span className={isHeaderSmall ? "text-3xl" : "text-6xl"}>🔥</span>
        <h1 className={`${isHeaderSmall ? "text-2xl" : "text-4xl md:text-6xl"} font-bold`}>
          Firesides
        </h1>
        <p className={`${isHeaderSmall ? "text-sm" : "text-md md:text-lg"} opacity-80 mt-1`}>
          by {" "}
          <a
            href="https://nacc.club"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-400 underline"
          >
            Nomadic
          </a>
        </p>
      </div>

      <NFCIndicator />

      {isConnected && (
        <button
          onClick={handleToggleAIFriends}
          className="absolute top-4 right-4 text-white bg-orange-700 p-2 rounded-full shadow-lg"
        >
          <AiOutlineUsergroupAdd size={24} />
        </button>
      )}
      
      {showAIFriends && (
        <div className="absolute top-14 right-4 w-64 bg-white text-black p-4 rounded-lg shadow-lg z-50">
          <h3 className="font-bold mb-2">Your Tagged Friends</h3>
          <p className="text-sm mb-2">(Hardcoded Example)</p>
          <ul className="text-sm list-disc list-inside mb-2">
            <li>alice.eth</li>
            <li>bob.eth</li>
            <li>charlie.eth</li>
          </ul>
          <p className="text-xs italic">
            "It seems you guys have been spending quite some time together, so good to see..."
          </p>
        </div>
      )}

      {isConnected && (
        <button
          onClick={handleToggleAISummary}
          className="absolute top-4 right-16 text-white bg-orange-700 p-2 rounded-full shadow-lg"
        >
          <AiOutlineRobot size={24} />
        </button>
      )}
      
      {showAISummary && (
        <div className="absolute top-14 right-16 w-64 bg-white text-black p-4 rounded-lg shadow-lg z-50">
          <h3 className="font-bold mb-2">AI Summary (Demo)</h3>
          <p className="text-xs">
            This feature will summarize all your interactions at the end of the hackerhouse.
            Currently disabled.
          </p>
        </div>
      )}

      <div className="flex flex-col items-center justify-center w-full h-full">
        {!isConnected && !isCreating && !isConfirming && (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-lg mb-2">Conecta tu wallet para empezar</p>
            <button 
              onClick={() => modal.open()} 
              className={`${buttonClass} transform hover:scale-105 transition-transform`}
            >
              Conectar Wallet
            </button>
          </div>
        )}

        {isConnected && !isCreating && !isConfirming && (
          <button onClick={handleCreateMemory} className={`mt-6 ${buttonClass}`}>
            Create a Fireside Memory
          </button>
        )}

        {isCreating && !memoryType && !isConfirming && (
          <div className="relative z-10 flex flex-col items-center mt-6 space-y-4">
            <p className="mb-2">Select how you want to create a memory:</p>
            <button onClick={() => handleSelectMemoryType("media")} className={buttonClass}>
              Upload Media
            </button>
            <button onClick={() => handleSelectMemoryType("message")} className={buttonClass}>
              Upload Public Message
            </button>
            <button onClick={() => handleSelectMemoryType("raffle")} className={buttonClass}>
              Make a Raffle
            </button>
          </div>
        )}

        {memoryType === "media" && !isConfirming && (
          <div className="relative z-10 flex flex-col items-center mt-6 space-y-3">
            <p className="mb-2">Upload an image or video to share with the house!</p>
            <label className="flex flex-col">
              <span>Drag or select media from your device:</span>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaChange}
                className="text-black rounded mt-1"
              />
            </label>
            <button onClick={handleConfirmMemory} className={buttonClass}>
              Next
            </button>
          </div>
        )}

        {memoryType === "message" && !isConfirming && (
          <div className="relative z-10 flex flex-col items-center mt-6 space-y-3">
            <p className="mb-2">Share a public message for everyone!</p>
            <label className="flex flex-col w-72">
              <div className="flex justify-between mb-1">
                <span>Type your message:</span>
                <button
                  onClick={handleAIHelpMessage}
                  className="ml-2 px-2 bg-blue-700 text-white rounded text-xs hover:bg-blue-800"
                >
                  Get AI help
                </button>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="text-black rounded"
                placeholder="Write something memorable..."
                rows={4}
              />
            </label>
            <button onClick={handleConfirmMemory} className={buttonClass}>
              Next
            </button>
          </div>
        )}

        {memoryType === "raffle" && !isConfirming && (
          <div className="relative z-10 flex flex-col items-center mt-6 space-y-3">
            <p className="mb-2">Create a raffle for the house participants!</p>
            <p className="italic text-sm">(Demo: No extra fields, just hit Next to confirm)</p>
            <button onClick={handleConfirmMemory} className={buttonClass}>
              Next
            </button>
          </div>
        )}

        {isConfirming && (
          <div className="flex flex-col items-center justify-center mt-6 relative z-10">
            <motion.div
              className="text-6xl"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              🔥
            </motion.div>
            <p className="mt-2">Confirming your Fireside memory...</p>
          </div>
        )}
      </div>

      <p className="w-full text-center absolute bottom-2 text-sm text-white opacity-70">
        Created with <span className="text-orange-500">🧡</span> by {" "}
        <a
          href="https://x.com/victorxva"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          victorxva
        </a>
      </p>
    </div>
  );
} 