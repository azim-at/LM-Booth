import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  useAnimations,
  Environment,
} from "@react-three/drei";
import * as THREE from "three";

/* =======================
   Advanced Easing Functions
======================= */
const easings = {
  // Smooth ease-in-out (default)
  easeInOutCubic: (t) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },

  // Extra smooth ease-in-out
  easeInOutQuint: (t) => {
    return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
  },

  // Gentle acceleration
  easeOutQuad: (t) => {
    return 1 - (1 - t) * (1 - t);
  },

  // Ultra-smooth hermite interpolation
  smootherstep: (t) => {
    return t * t * t * (t * (t * 6 - 15) + 10);
  },
};

/* =======================
   Scene Transition Manager
======================= */
function SceneTransition({ isTransitioning, progress, fromScene, toScene }) {
  const overlayRef = useRef();

  useFrame(() => {
    if (overlayRef.current && isTransitioning) {
      // Fade in then out
      const fadeProgress = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
      overlayRef.current.material.opacity = fadeProgress * 0.3;
    }
  });

  if (!isTransitioning) return null;

  return (
    <mesh ref={overlayRef} position={[0, 0, -0.1]}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial color="#000000" transparent opacity={0} />
    </mesh>
  );
}

/* =======================
   Enhanced Cinematic Camera
======================= */
function CinematicCamera({
  isActive,
  keyframes,
  progress,
  onComplete,
  easingType = "smootherstep",
}) {
  const { camera } = useThree();
  const prevPosition = useRef(new THREE.Vector3());
  const prevLookAt = useRef(new THREE.Vector3());
  const velocity = useRef(new THREE.Vector3());

  useEffect(() => {
    if (isActive && keyframes && keyframes.length > 0) {
      prevPosition.current.copy(camera.position);
      prevLookAt.current.copy(new THREE.Vector3(0, 1, 0));
    }
  }, [isActive, keyframes]);

  useFrame(() => {
    if (isActive && keyframes && keyframes.length > 0) {
      const totalDuration = keyframes[keyframes.length - 1].time;
      const currentTime = progress * totalDuration;

      let startFrame = keyframes[0];
      let endFrame = keyframes[0];

      for (let i = 0; i < keyframes.length - 1; i++) {
        if (
          currentTime >= keyframes[i].time &&
          currentTime <= keyframes[i + 1].time
        ) {
          startFrame = keyframes[i];
          endFrame = keyframes[i + 1];
          break;
        }
      }

      const frameProgress =
        endFrame.time === startFrame.time
          ? 0
          : (currentTime - startFrame.time) / (endFrame.time - startFrame.time);

      // Apply advanced easing
      const ease = easings[easingType](frameProgress);

      // Smooth position interpolation with damping
      const targetPosition = new THREE.Vector3().lerpVectors(
        startFrame.position,
        endFrame.position,
        ease
      );

      // Add velocity-based smoothing
      velocity.current
        .subVectors(targetPosition, camera.position)
        .multiplyScalar(0.15);
      camera.position.add(velocity.current);

      // Smooth lookAt interpolation
      const lookAt = new THREE.Vector3().lerpVectors(
        startFrame.lookAt,
        endFrame.lookAt,
        ease
      );

      // Smooth camera rotation
      const targetQuaternion = new THREE.Quaternion();
      const lookAtMatrix = new THREE.Matrix4().lookAt(
        camera.position,
        lookAt,
        new THREE.Vector3(0, 1, 0)
      );
      targetQuaternion.setFromRotationMatrix(lookAtMatrix);
      camera.quaternion.slerp(targetQuaternion, 0.1);

      // Smooth FOV interpolation
      if (startFrame.fov && endFrame.fov) {
        const targetFov = THREE.MathUtils.lerp(
          startFrame.fov,
          endFrame.fov,
          ease
        );
        camera.fov += (targetFov - camera.fov) * 0.1;
        camera.updateProjectionMatrix();
      }

      if (progress >= 0.99 && onComplete) {
        onComplete();
      }
    }
  });

  return null;
}

/* =======================
   Enhanced Dynamic Lights
======================= */
function DynamicLights({ isActive, lightKeyframes, progress }) {
  const ambientRef = useRef();
  const directional1Ref = useRef();
  const directional2Ref = useRef();
  const spotRef = useRef();

  // Store previous values for smoothing
  const prevValues = useRef({
    ambientIntensity: 0.5,
    dir1Intensity: 1,
    dir2Intensity: 0.3,
    spotIntensity: 0,
    spotAngle: 0.5,
  });

  useFrame(() => {
    if (isActive && lightKeyframes && lightKeyframes.length > 0) {
      const totalDuration = lightKeyframes[lightKeyframes.length - 1].time;
      const currentTime = progress * totalDuration;

      let startFrame = lightKeyframes[0];
      let endFrame = lightKeyframes[0];

      for (let i = 0; i < lightKeyframes.length - 1; i++) {
        if (
          currentTime >= lightKeyframes[i].time &&
          currentTime <= lightKeyframes[i + 1].time
        ) {
          startFrame = lightKeyframes[i];
          endFrame = lightKeyframes[i + 1];
          break;
        }
      }

      const frameProgress =
        endFrame.time === startFrame.time
          ? 0
          : (currentTime - startFrame.time) / (endFrame.time - startFrame.time);

      // Ultra-smooth easing for lights
      const ease = easings.smootherstep(frameProgress);

      // Smooth damping factor
      const dampingFactor = 0.08;

      // Animate ambient light with damping
      if (ambientRef.current) {
        const targetIntensity = THREE.MathUtils.lerp(
          startFrame.ambient.intensity,
          endFrame.ambient.intensity,
          ease
        );
        prevValues.current.ambientIntensity +=
          (targetIntensity - prevValues.current.ambientIntensity) *
          dampingFactor;
        ambientRef.current.intensity = prevValues.current.ambientIntensity;
      }

      // Animate directional lights with damping
      if (directional1Ref.current) {
        const targetIntensity = THREE.MathUtils.lerp(
          startFrame.directional1.intensity,
          endFrame.directional1.intensity,
          ease
        );
        prevValues.current.dir1Intensity +=
          (targetIntensity - prevValues.current.dir1Intensity) * dampingFactor;
        directional1Ref.current.intensity = prevValues.current.dir1Intensity;

        // Smooth position transition
        const targetPos = new THREE.Vector3().lerpVectors(
          startFrame.directional1.position,
          endFrame.directional1.position,
          ease
        );
        directional1Ref.current.position.lerp(targetPos, dampingFactor);
      }

      if (directional2Ref.current) {
        const targetIntensity = THREE.MathUtils.lerp(
          startFrame.directional2.intensity,
          endFrame.directional2.intensity,
          ease
        );
        prevValues.current.dir2Intensity +=
          (targetIntensity - prevValues.current.dir2Intensity) * dampingFactor;
        directional2Ref.current.intensity = prevValues.current.dir2Intensity;
      }

      // Animate spotlight with damping
      if (spotRef.current) {
        const targetIntensity = THREE.MathUtils.lerp(
          startFrame.spotlight.intensity,
          endFrame.spotlight.intensity,
          ease
        );
        const targetAngle = THREE.MathUtils.lerp(
          startFrame.spotlight.angle,
          endFrame.spotlight.angle,
          ease
        );

        prevValues.current.spotIntensity +=
          (targetIntensity - prevValues.current.spotIntensity) * dampingFactor;
        prevValues.current.spotAngle +=
          (targetAngle - prevValues.current.spotAngle) * dampingFactor;

        spotRef.current.intensity = prevValues.current.spotIntensity;
        spotRef.current.angle = prevValues.current.spotAngle;
      }
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.5} />
      <directionalLight
        ref={directional1Ref}
        position={[5, 10, 5]}
        intensity={1}
        castShadow
      />
      <directionalLight
        ref={directional2Ref}
        position={[-5, 5, -5]}
        intensity={0.3}
      />
      <spotLight
        ref={spotRef}
        position={[0, 8, 3]}
        angle={0.5}
        penumbra={0.8}
        intensity={0}
        castShadow
        target-position={[0, 0, 0]}
      />
    </>
  );
}

/* =======================
   Enhanced Model with Smooth Animation Blending
======================= */
function BoothWithLady({ activeAnimation, scene, animations }) {
  const group = useRef();
  const { actions } = useAnimations(animations, group);
  const previousAnimation = useRef(null);

  useEffect(() => {
    if (scene && group.current) {
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      group.current.position.set(-center.x, -box.min.y, -center.z);
    }
  }, [scene]);

  useEffect(() => {
    if (!activeAnimation || !actions) return;

    // Longer crossfade for smoother transitions
    const crossfadeDuration = 0.8;

    if (
      previousAnimation.current &&
      previousAnimation.current !== activeAnimation
    ) {
      const prevAction = actions[previousAnimation.current];
      if (prevAction) {
        prevAction.fadeOut(crossfadeDuration);
      }
    }

    const action = actions[activeAnimation];
    if (action) {
      action.reset().fadeIn(crossfadeDuration).play();
      action.setLoop(THREE.LoopRepeat);
      action.timeScale = 1;

      // Smooth animation playback
      action.clampWhenFinished = false;
    }

    previousAnimation.current = activeAnimation;

    return () => {
      if (action) {
        action.fadeOut(crossfadeDuration);
      }
    };
  }, [activeAnimation, actions]);

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}

/* =======================
   Enhanced Scene Manager with Transition Support
======================= */
function CinematicSceneManager({ scene, onComplete, transitionProgress = 0 }) {
  const [progress, setProgress] = useState(0);
  const startTime = useRef(Date.now());

  useFrame(() => {
    const elapsed = (Date.now() - startTime.current) / 1000;
    const newProgress = Math.min(elapsed / scene.duration, 1);
    setProgress(newProgress);
  });

  return (
    <>
      <CinematicCamera
        isActive={true}
        keyframes={scene.cameraKeyframes}
        progress={progress}
        onComplete={onComplete}
        easingType="smootherstep"
      />
      <DynamicLights
        isActive={true}
        lightKeyframes={scene.lightKeyframes}
        progress={progress}
      />
    </>
  );
}

/* =======================
   App
======================= */
export default function App() {
  const { scene, animations } = useGLTF("/6.glb");
  const [activeAnimation, setActiveAnimation] = useState(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [orbitEnabled, setOrbitEnabled] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);

  // Enhanced cinematic scenes with refined keyframes
const cinematicScenes = [
  {
    name: "Welcome",
    description: "Elegant opening introduction",
    icon: "🎬",
    duration: 7,
    animation: animations[0]?.name || null,
    cameraKeyframes: [
      {
        time: 0,
        position: new THREE.Vector3(12, 6, 12),
        lookAt: new THREE.Vector3(0, 1, 0),
        fov: 65,
      },
      {
        time: 2,
        position: new THREE.Vector3(10, 5, 10),
        lookAt: new THREE.Vector3(0, 1, 0),
        fov: 60,
      },
      {
        time: 4.5,
        position: new THREE.Vector3(8, 4, 8),
        lookAt: new THREE.Vector3(0, 1, 0),
        fov: 58,
      },
      {
        time: 7,
        position: new THREE.Vector3(6, 3, 6),
        lookAt: new THREE.Vector3(0, 1, 0),
        fov: 55,
      },
    ],
    lightKeyframes: [
      {
        time: 0,
        ambient: { intensity: 0.3 },
        directional1: {
          intensity: 0.5,
          position: new THREE.Vector3(5, 10, 5),
        },
        directional2: { intensity: 0.2 },
        spotlight: { intensity: 0, angle: 0.5 },
      },
      {
        time: 3.5,
        ambient: { intensity: 0.5 },
        directional1: {
          intensity: 0.8,
          position: new THREE.Vector3(5, 10, 5),
        },
        directional2: { intensity: 0.3 },
        spotlight: { intensity: 0, angle: 0.5 },
      },
      {
        time: 7,
        ambient: { intensity: 0.6 },
        directional1: {
          intensity: 1.0,
          position: new THREE.Vector3(4, 8, 4),
        },
        directional2: { intensity: 0.4 },
        spotlight: { intensity: 0, angle: 0.5 },
      },
    ],
  },
  {
    name: "Showcase",
    description: "Smooth 360° orbital view with interior exploration",
    icon: "🎥",
    duration: 15,
    animation: animations[1]?.name || animations[0]?.name || null,
    cameraKeyframes: [
      // Start: Front right angle
      {
        time: 0,
        position: new THREE.Vector3(6, 3, 6),
        lookAt: new THREE.Vector3(0, 1, 0),
        fov: 55,
      },
      // Quarter turn: Right side
      {
        time: 2.5,
        position: new THREE.Vector3(7, 2.5, 0),
        lookAt: new THREE.Vector3(0, 1, 0),
        fov: 50,
      },
      // Half turn: Back right
      {
        time: 5,
        position: new THREE.Vector3(5, 2, -5),
        lookAt: new THREE.Vector3(0, 1, 0),
        fov: 48,
      },
      // Three-quarter: Left side
      {
        time: 7.5,
        position: new THREE.Vector3(-6, 2, -3),
        lookAt: new THREE.Vector3(0, 1, 0),
        fov: 50,
      },
      // Interior peek: Move inside
      {
        time: 10,
        position: new THREE.Vector3(-2, 1.5, 0),
        lookAt: new THREE.Vector3(1, 1.3, 0),
        fov: 65,
      },
      // Interior: Looking outward from inside
      {
        time: 12,
        position: new THREE.Vector3(0, 1.4, 0.5),
        lookAt: new THREE.Vector3(3, 1.2, -2),
        fov: 70,
      },
      // Exit and full view
      {
        time: 15,
        position: new THREE.Vector3(8, 4, 4),
        lookAt: new THREE.Vector3(0, 1, 0),
        fov: 55,
      },
    ],
    lightKeyframes: [
      {
        time: 0,
        ambient: { intensity: 0.6 },
        directional1: {
          intensity: 1.0,
          position: new THREE.Vector3(5, 8, 5),
        },
        directional2: { intensity: 0.4 },
        spotlight: { intensity: 0, angle: 0.5 },
      },
      {
        time: 5,
        ambient: { intensity: 0.65 },
        directional1: {
          intensity: 0.9,
          position: new THREE.Vector3(0, 8, -5),
        },
        directional2: { intensity: 0.5 },
        spotlight: { intensity: 0, angle: 0.5 },
      },
      {
        time: 10,
        ambient: { intensity: 0.8 },
        directional1: {
          intensity: 0.6,
          position: new THREE.Vector3(-3, 6, 0),
        },
        directional2: { intensity: 0.7 },
        spotlight: { intensity: 0.5, angle: 0.6 },
      },
      {
        time: 15,
        ambient: { intensity: 0.6 },
        directional1: {
          intensity: 1.0,
          position: new THREE.Vector3(5, 8, 5),
        },
        directional2: { intensity: 0.4 },
        spotlight: { intensity: 0, angle: 0.5 },
      },
    ],
  },
  {
    name: "Spotlight",
    description: "Dramatic close-up finale",
    icon: "✨",
    duration: 6,
    animation: animations[2]?.name || animations[0]?.name || null,
    cameraKeyframes: [
      {
        time: 0,
        position: new THREE.Vector3(8, 4, 4),
        lookAt: new THREE.Vector3(0, 1, 0),
        fov: 55,
      },
      {
        time: 2,
        position: new THREE.Vector3(2.5, 1.7, 3),
        lookAt: new THREE.Vector3(0, 1.3, 0),
        fov: 42,
      },
      {
        time: 4,
        position: new THREE.Vector3(2, 1.6, 2.5),
        lookAt: new THREE.Vector3(0, 1.4, 0),
        fov: 38,
      },
      {
        time: 6,
        position: new THREE.Vector3(1.5, 1.5, 2),
        lookAt: new THREE.Vector3(0, 1.5, 0),
        fov: 35,
      },
    ],
    lightKeyframes: [
      {
        time: 0,
        ambient: { intensity: 0.6 },
        directional1: {
          intensity: 1.0,
          position: new THREE.Vector3(5, 8, 5),
        },
        directional2: { intensity: 0.4 },
        spotlight: { intensity: 0, angle: 0.5 },
      },
      {
        time: 2,
        ambient: { intensity: 0.45 },
        directional1: {
          intensity: 0.7,
          position: new THREE.Vector3(3, 7, 3),
        },
        directional2: { intensity: 0.3 },
        spotlight: { intensity: 0.8, angle: 0.45 },
      },
      {
        time: 4,
        ambient: { intensity: 0.3 },
        directional1: {
          intensity: 0.4,
          position: new THREE.Vector3(3, 6, 3),
        },
        directional2: { intensity: 0.2 },
        spotlight: { intensity: 1.8, angle: 0.35 },
      },
      {
        time: 6,
        ambient: { intensity: 0.2 },
        directional1: {
          intensity: 0.3,
          position: new THREE.Vector3(2, 5, 2),
        },
        directional2: { intensity: 0.1 },
        spotlight: { intensity: 2.5, angle: 0.3 },
      },
    ],
  },
];

  // Smooth transition between scenes
  const transitionToScene = async (index) => {
    setIsTransitioning(true);

    // Fade out transition
    for (let i = 0; i <= 100; i += 5) {
      setTransitionProgress(i / 100);
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    setIsTransitioning(false);
    setTransitionProgress(0);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      playScene(0);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const playScene = async (index, skipTransition = false) => {
    if (isPlaying) return;

    const sceneData = cinematicScenes[index];

    // Smooth transition if not the first scene
    if (!skipTransition && currentSceneIndex !== null) {
      await transitionToScene(index);
    }

    setIsPlaying(true);
    setCurrentSceneIndex(index);
    setOrbitEnabled(false);

    if (sceneData.animation) {
      setActiveAnimation(sceneData.animation);
    }

    setTimeout(() => {
      setIsPlaying(false);
      setCurrentSceneIndex(null);
      setOrbitEnabled(true);
    }, sceneData.duration * 1000);
  };

  const playAllScenes = async () => {
    for (let i = 0; i < cinematicScenes.length; i++) {
      await new Promise((resolve) => {
        playScene(i, i === 0);
        setTimeout(
          resolve,
          cinematicScenes[i].duration * 1000 +
            (i < cinematicScenes.length - 1 ? 500 : 0)
        );
      });
    }
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    setCurrentSceneIndex(null);
    setOrbitEnabled(true);
    setIsTransitioning(false);
  };

  const handleAnimationClick = (animName) => {
    if (!isPlaying) {
      setActiveAnimation(animName);
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        background: "linear-gradient(to bottom, #0f0c29, #302b63, #24243e)",
      }}
    >
      {/* Cinematic Scenes Panel */}
      <div
        style={{
          position: "absolute",
          zIndex: 10,
          top: 20,
          left: 20,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          maxWidth: "280px",
        }}
      >
        <div
          style={{
            color: "white",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "14px 18px",
            borderRadius: "14px",
            fontWeight: "bold",
            fontSize: "15px",
            boxShadow: "0 8px 25px rgba(102, 126, 234, 0.5)",
            textAlign: "center",
            letterSpacing: "1px",
          }}
        >
          🎬 CINEMATIC SCENES
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={playAllScenes}
            disabled={isPlaying}
            style={{
              flex: 1,
              padding: "14px",
              background: isPlaying
                ? "linear-gradient(135deg, #555 0%, #333 100%)"
                : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: isPlaying ? "not-allowed" : "pointer",
              fontSize: "13px",
              fontWeight: "700",
              boxShadow: isPlaying
                ? "none"
                : "0 6px 20px rgba(245, 87, 108, 0.5)",
              transition: "all 0.3s ease",
              opacity: isPlaying ? 0.6 : 1,
              letterSpacing: "0.5px",
            }}
          >
            ▶️ Play All
          </button>

          {isPlaying && (
            <button
              onClick={stopPlayback}
              style={{
                padding: "14px 18px",
                background: "linear-gradient(135deg, #ff6b6b 0%, #c92a2a 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "700",
                boxShadow: "0 6px 20px rgba(255, 107, 107, 0.5)",
                transition: "all 0.3s ease",
                letterSpacing: "0.5px",
              }}
            >
              ⏹️
            </button>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {cinematicScenes.map((sceneData, index) => (
            <button
              key={index}
              onClick={() => playScene(index)}
              disabled={isPlaying}
              style={{
                padding: "16px 18px",
                background:
                  currentSceneIndex === index
                    ? "linear-gradient(135deg, #ffd89b 0%, #19547b 100%)"
                    : isPlaying
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(255, 255, 255, 0.1)",
                color: "white",
                border:
                  currentSceneIndex === index
                    ? "2px solid #ffd89b"
                    : "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                cursor: isPlaying ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "600",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                textAlign: "left",
                opacity: isPlaying && currentSceneIndex !== index ? 0.4 : 1,
                backdropFilter: "blur(15px)",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                boxShadow:
                  currentSceneIndex === index
                    ? "0 6px 20px rgba(255, 216, 155, 0.4)"
                    : "0 4px 12px rgba(0, 0, 0, 0.3)",
                transform:
                  currentSceneIndex === index ? "scale(1.02)" : "scale(1)",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <span style={{ fontSize: "24px" }}>{sceneData.icon}</span>
                <span
                  style={{ flex: 1, fontWeight: "700", letterSpacing: "0.5px" }}
                >
                  {sceneData.name}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    opacity: 0.8,
                    background: "rgba(0,0,0,0.4)",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontWeight: "600",
                  }}
                >
                  {sceneData.duration}s
                </span>
              </div>
              <span
                style={{ fontSize: "11px", opacity: 0.75, marginLeft: "34px" }}
              >
                {sceneData.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Manual Animation Controls */}
      <div
        style={{
          position: "absolute",
          zIndex: 10,
          top: 20,
          right: 20,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          maxWidth: "220px",
        }}
      >
        <div
          style={{
            color: "white",
            background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
            padding: "12px 16px",
            borderRadius: "12px",
            fontWeight: "bold",
            fontSize: "13px",
            boxShadow: "0 6px 20px rgba(250, 112, 154, 0.4)",
            textAlign: "center",
            letterSpacing: "1px",
          }}
        >
          🎭 ANIMATIONS
        </div>
        {animations && animations.length > 0 ? (
          animations.map((anim) => (
            <button
              key={anim.name}
              onClick={() => handleAnimationClick(anim.name)}
              disabled={isPlaying}
              style={{
                padding: "12px 18px",
                background:
                  activeAnimation === anim.name
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "rgba(255, 255, 255, 0.1)",
                color: "white",
                border:
                  activeAnimation === anim.name
                    ? "2px solid #667eea"
                    : "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "10px",
                cursor: isPlaying ? "not-allowed" : "pointer",
                fontSize: "13px",
                fontWeight: "600",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                opacity: isPlaying ? 0.5 : 1,
                backdropFilter: "blur(15px)",
                boxShadow:
                  activeAnimation === anim.name
                    ? "0 6px 20px rgba(102, 126, 234, 0.4)"
                    : "0 4px 12px rgba(0, 0, 0, 0.3)",
                letterSpacing: "0.3px",
              }}
            >
              {anim.name}
            </button>
          ))
        ) : (
          <div
            style={{
              color: "white",
              background: "rgba(0,0,0,0.5)",
              padding: "12px",
              borderRadius: "10px",
              fontSize: "12px",
              textAlign: "center",
            }}
          >
            No animations found
          </div>
        )}
      </div>

      {/* Status Indicator */}
      {isPlaying && currentSceneIndex !== null && (
        <div
          style={{
            position: "absolute",
            zIndex: 10,
            bottom: 40,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0, 0, 0, 0.85)",
            color: "white",
            padding: "14px 28px",
            borderRadius: "30px",
            fontSize: "14px",
            fontWeight: "700",
            backdropFilter: "blur(15px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            letterSpacing: "0.5px",
          }}
        >
          <span
            style={{
              width: "10px",
              height: "10px",
              background: "#ff6b6b",
              borderRadius: "50%",
              animation: "pulse 1.5s infinite",
            }}
          ></span>
          Playing: {cinematicScenes[currentSceneIndex]?.name}
        </div>
      )}

      {/* Transition Overlay */}
      {isTransitioning && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 5,
            opacity: transitionProgress,
            transition: "opacity 0.3s ease",
            pointerEvents: "none",
          }}
        />
      )}

      <Canvas
        camera={{ position: [5, 2.5, 5], fov: 50 }}
        style={{ width: "100%", height: "100%" }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#0a0a0a"]} />
        <fog attach="fog" args={["#0a0a0a", 10, 50]} />

        {!isPlaying ? (
          <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
            <directionalLight position={[-5, 5, -5]} intensity={0.3} />
            <spotLight
              position={[0, 8, 3]}
              angle={0.5}
              penumbra={0.8}
              intensity={0}
              castShadow
            />
          </>
        ) : (
          <CinematicSceneManager
            scene={cinematicScenes[currentSceneIndex]}
            onComplete={() => {}}
            transitionProgress={transitionProgress}
          />
        )}

        <Suspense fallback={null}>
          <BoothWithLady
            activeAnimation={activeAnimation}
            scene={scene}
            animations={animations}
          />
        </Suspense>

        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial
            color="#1a1a1a"
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>

        <OrbitControls
          enabled={orbitEnabled && !isPlaying}
          enableDamping
          dampingFactor={0.05}
          minDistance={2}
          maxDistance={15}
          maxPolarAngle={Math.PI / 2}
        />

        <Environment preset="night" />
      </Canvas>

      <style>{`
        @keyframes pulse {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.7);
          }
          50% { 
            opacity: 0.7; 
            transform: scale(1.1);
            box-shadow: 0 0 0 10px rgba(255, 107, 107, 0);
          }
        }
        
        div::-webkit-scrollbar {
          width: 6px;
        }
        div::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        div::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        button:hover:not(:disabled) {
          transform: translateY(-2px) !important;
        }

        button:active:not(:disabled) {
          transform: translateY(0) !important;
        }
      `}</style>
    </div>
  );
}
