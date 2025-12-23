# LandmarkMarketsBooth Component

A cinematic 3D booth visualization component built with React Three Fiber. Features automatic 360° rotation, multiple cinematic scenes with smooth camera transitions, and dynamic lighting effects.

## Features

- 🎬 **Cinematic Camera Movements** - Professionally choreographed camera paths
- 🔄 **360° Rotation** - Automatic rotation on load for full booth visualization
- 🎭 **Multiple Scenes** - Three distinct cinematic scenes with smooth transitions
- 💡 **Dynamic Lighting** - Animated lighting that changes with each scene
- 🎨 **Smooth Animations** - Advanced easing functions for professional-grade movements
- 🎮 **Interactive Controls** - Play through scenes with a single button
- 📱 **Responsive** - Adapts to any container size

## Installation

### Required Dependencies

Install the following npm packages:

```bash
npm install react react-dom three @react-three/fiber @react-three/drei
```

Or with yarn:

```bash
yarn add react react-dom three @react-three/fiber @react-three/drei
```

### Package Versions

The component is compatible with:

- `react`: ^18.0.0
- `react-dom`: ^18.0.0
- `three`: ^0.160.0 or higher
- `@react-three/fiber`: ^8.15.0 or higher
- `@react-three/drei`: ^9.88.0 or higher

## Usage

### Basic Usage

1. **Copy the Component**

   Place the `LandmarkMarketsBooth.jsx` file in your project's components directory.

2. **Import and Use**

   ```jsx
   import LandmarkMarketsBooth from './components/LandmarkMarketsBooth';

   function App() {
     return (
       <div style={{ width: '100vw', height: '100vh' }}>
         <LandmarkMarketsBooth modelPath="/path/to/your/model.glb" />
       </div>
     );
   }

   export default App;
   ```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelPath` | `string` | `"/6.glb"` | Path to your GLB/GLTF 3D model file |

### Example Usage Scenarios

#### Full Screen Implementation

```jsx
import LandmarkMarketsBooth from './components/LandmarkMarketsBooth';

function FullScreenBooth() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh',
      margin: 0,
      padding: 0 
    }}>
      <LandmarkMarketsBooth modelPath="/models/booth.glb" />
    </div>
  );
}
```

#### Container-Based Implementation

```jsx
import LandmarkMarketsBooth from './components/LandmarkMarketsBooth';

function ContainerBooth() {
  return (
    <div style={{ 
      width: '800px', 
      height: '600px',
      margin: '20px auto'
    }}>
      <LandmarkMarketsBooth modelPath="/models/booth.glb" />
    </div>
  );
}
```

#### Responsive Grid Layout

```jsx
import LandmarkMarketsBooth from './components/LandmarkMarketsBooth';

function ResponsiveGrid() {
  return (
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '20px',
      padding: '20px'
    }}>
      <div style={{ height: '500px' }}>
        <LandmarkMarketsBooth modelPath="/models/booth1.glb" />
      </div>
      <div style={{ height: '500px' }}>
        <LandmarkMarketsBooth modelPath="/models/booth2.glb" />
      </div>
    </div>
  );
}
```

## 3D Model Requirements

### Supported Formats

- GLB (recommended)
- GLTF

### Model Specifications

Your 3D model should:
- Be optimized for web (< 10MB recommended)
- Have animations included (optional but recommended)
- Be properly centered at origin (0, 0, 0)
- Use standard PBR materials for best results

### Model Structure

The component expects:
- **animations[0]**: First animation for Scene 1
- **animations[1]**: Second animation for Scene 2
- **animations[2]**: Third animation for Scene 3

If your model has fewer animations, the component will fallback gracefully.

## Scene Configuration

The component includes 3 pre-configured cinematic scenes:

### Scene 1 (10 seconds)
- Grand opening shot from high altitude
- Dramatic descent and circular sweep
- Dynamic lighting build-up

### Scene 2 (15 seconds)
- Medium shots with varied angles
- Close-up details and booth exploration
- Spotlight effects

### Scene 3 (6 seconds)
- Close approach to the booth
- Intimate viewing angle
- Dramatic focused lighting

## Customization

### Modifying Camera Paths

Edit the `cinematicScenes` array in the component:

```jsx
const cinematicScenes = [
  {
    name: "Custom Scene",
    duration: 8,
    animation: animations[0]?.name || null,
    cameraKeyframes: [
      {
        time: 0,
        position: new THREE.Vector3(x, y, z),
        lookAt: new THREE.Vector3(x, y, z),
        fov: 60,
      },
      // Add more keyframes...
    ],
    lightKeyframes: [
      // Configure lighting...
    ],
  },
];
```

### Adjusting 360° Rotation

Modify the `Rotation360Camera` component parameters:

```jsx
const radius = 8;           // Distance from center
const height = 3;           // Camera height
const rotationDuration = 10; // Duration in seconds
```

### Changing Environment

The component uses Three.js `Environment` preset. Change it in the Canvas:

```jsx
<Environment preset="night" />
// Options: sunset, dawn, night, warehouse, forest, apartment, studio, city, park, lobby
```

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

WebGL 2.0 support required.

## Performance Optimization

### Best Practices

1. **Optimize your 3D model**
   - Use Draco compression for GLB files
   - Reduce polygon count where possible
   - Optimize textures (use 1024x1024 or smaller)

2. **Container sizing**
   - Ensure parent container has explicit width and height
   - Avoid percentage-based sizing without context

3. **Multiple instances**
   - If rendering multiple instances, consider lazy loading
   - Use React.memo() for optimization

## Troubleshooting

### Model not loading
- Check the file path is correct
- Ensure the model file is in the public directory
- Verify the model format is GLB or GLTF

### Black screen
- Check browser console for errors
- Ensure WebGL is enabled
- Verify parent container has height

### Performance issues
- Reduce model complexity
- Lower texture resolution
- Check for console warnings

## Project Structure

```
your-project/
├── public/
│   └── models/
│       └── booth.glb          # Your 3D model
├── src/
│   ├── components/
│   │   └── LandmarkMarketsBooth.jsx  # The component
│   └── App.jsx                # Your main app
├── package.json
└── README.md
```

## License

This component is provided as-is for use in your projects.

## Credits

Built with:
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Three.js](https://threejs.org/)
- [React Three Drei](https://github.com/pmndrs/drei)

## Support

For issues or questions, please refer to the documentation of the underlying libraries:
- React Three Fiber: https://docs.pmnd.rs/react-three-fiber
- Three.js: https://threejs.org/docs/
- Drei: https://github.com/pmndrs/drei

---

**Note**: Make sure your 3D model includes animations for the best experience. The component will work without animations but the scenes will be camera-only movements.