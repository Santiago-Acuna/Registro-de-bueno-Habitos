
import './styles.modules.css'; // This imports the CSS file

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