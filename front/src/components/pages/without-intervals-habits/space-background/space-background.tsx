import "./styles.modules.css"; // This imports the CSS file

interface SpaceBackgroundProps {
  children: React.ReactNode;
  className?: string; // The className prop is optional
}

const SpaceBackground = ({ children, className }: SpaceBackgroundProps) => {
  return (
    <div className={className}>
      <div id="stars" />
      <div id="stars2" />
      <div id="stars3" />
      {children}
    </div>
  );
};

export default SpaceBackground;

// <SpaceBackground className={styles.container}></SpaceBackground> ejemplo de uso

// .container { // anadir a la hoja de estilos principal
//   display: flex;
//   min-height: 100vh;
//   min-width: 100vw;
//   flex-direction: column;
//   position: fixed;
//   background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
// }
