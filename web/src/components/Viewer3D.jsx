import React, { Suspense, useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { OrbitControls, Grid, Stage, Html } from '@react-three/drei';
import * as THREE from 'three';

function Model({ url, onObjectClick }) {
  const obj = useLoader(OBJLoader, url);
  
  // Traverse to enable raycasting on all meshes
  obj.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      // Ensure material is cloned so we can highlight individual parts
      if (!child.userData.originalMaterial) {
         child.userData.originalMaterial = child.material.clone();
      }
    }
  });

  return (
    <primitive 
      object={obj} 
      onClick={(e) => {
        e.stopPropagation();
        // Find the actual mesh that was clicked
        const mesh = e.object;
        if (mesh && onObjectClick) {
          onObjectClick(mesh);
        }
      }}
    />
  );
}

export default function Viewer3D({ modelUrl }) {
  const [selectedObject, setSelectedObject] = useState(null);

  const handleObjectClick = (mesh) => {
    // Reset previous selection if exists
    // Note: In a real app we might want to keep a reference to all meshes to reset them properly
    // For now, we just update the UI state. 
    // To visually highlight, we can swap materials.
    
    setSelectedObject(mesh.name);
    console.log("Clicked:", mesh.name);
  };

  return (
    <div className="viewer-container">
      <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6}>
            <Model url={modelUrl} onObjectClick={handleObjectClick} />
          </Stage>
        </Suspense>
        <OrbitControls makeDefault />
        <Grid infiniteGrid fadeDistance={50} fadeStrength={5} />
      </Canvas>
      
      <div className="viewer-overlay glass-panel">
        <h3>3D Room View</h3>
        <p>Click on objects to identify them</p>
        {selectedObject && (
          <div style={{ marginTop: '10px', padding: '5px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '4px' }}>
            <strong>Selected:</strong> {selectedObject}
          </div>
        )}
      </div>
    </div>
  );
}
