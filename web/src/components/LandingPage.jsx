import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Text3D, Center } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { Button } from "@/components/ui/button";

function FloatingShapes() {
  const meshRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = Math.cos(t / 4) / 2;
    meshRef.current.rotation.y = Math.sin(t / 4) / 2;
    meshRef.current.position.y = Math.sin(t / 1.5) / 10;
  });

  return (
    <group ref={meshRef}>
      <Float speed={4} rotationIntensity={1} floatIntensity={2}>
        <mesh position={[2, 0, 0]} rotation={[0, 0.5, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.1} metalness={0.8} />
        </mesh>
      </Float>

      <Float speed={2} rotationIntensity={2} floatIntensity={1}>
        <mesh position={[-2, 1, -1]} rotation={[0.5, 0, 0]}>
          <torusGeometry args={[0.6, 0.2, 16, 32]} />
          <meshStandardMaterial color="#8b5cf6" roughness={0.1} metalness={0.8} />
        </mesh>
      </Float>

      <Float speed={3} rotationIntensity={1.5} floatIntensity={1.5}>
        <mesh position={[0, -1.5, 1]} rotation={[0, 0, 0.5]}>
          <octahedronGeometry args={[0.8]} />
          <meshStandardMaterial color="#ec4899" roughness={0.1} metalness={0.8} />
        </mesh>
      </Float>
    </group>
  );
}

export default function LandingPage() {
  return (
    <div className="w-full h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} color="blue" intensity={0.5} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <FloatingShapes />
        </Canvas>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <motion.h1
            className="text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-400 to-pink-600 mb-6 tracking-tight"
            animate={{
              backgroundPosition: ["0% 50%", "200% 50%", "0% 50%"],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{ backgroundSize: "200% 200%" }}
          >
            RoomScan
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Transform your physical space into a digital masterpiece. <br />
            Capture, reconstruct, and interact in 3D.
          </motion.p>

          {/* BUTTONS */}
          <div className="flex gap-8 justify-center">

            {/* ⭐ GET STARTED BUTTON — PREMIUM ANIMATION */}
            <Link to="/signup">
              <motion.button
                whileHover={{
                  scale: 1.08,
                  boxShadow: "0 0 45px rgba(99,102,241,0.7)",
                }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  filter: ["drop-shadow(0 0 6px rgba(99,102,241,0.6))", "drop-shadow(0 0 12px rgba(168,85,247,0.6))", "drop-shadow(0 0 6px rgba(99,102,241,0.6))"],
                }}
                transition={{
                  backgroundPosition: { repeat: Infinity, duration: 4, ease: "linear" },
                  filter: { repeat: Infinity, duration: 3, ease: "easeInOut" }
                }}
                className="relative px-14 py-5 text-white font-bold text-xl rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-[length:220%_220%] overflow-hidden shadow-xl"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started
                  <motion.span
                    animate={{ x: [0, 6, 0] }}
                    transition={{ repeat: Infinity, duration: 1.6 }}
                    className="text-2xl"
                  >
                    →
                  </motion.span>
                </span>

                {/* Shine sweep on hover */}
                <motion.div
                  className="absolute inset-0 bg-white/10"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.7 }}
                />
              </motion.button>
            </Link>

            {/* ⭐ LOGIN BUTTON — GLASS + HOVER SWEEP */}
            <Link to="/login">
              <motion.button
                whileHover={{
                  scale: 1.08,
                  borderColor: "rgba(255,255,255,0.6)",
                  backgroundColor: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(16px)",
                }}
                whileTap={{ scale: 0.95 }}
                className="relative px-14 py-5 text-white font-bold text-xl rounded-full backdrop-blur-lg border border-white/20 shadow-lg overflow-hidden"
              >
                Login

                {/* Glow sweep effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                  initial={{ x: "-130%" }}
                  whileHover={{ x: "130%" }}
                  transition={{ duration: 0.7 }}
                />
              </motion.button>
            </Link>

          </div>
        </motion.div>
      </div>

    </div>
  );
}
