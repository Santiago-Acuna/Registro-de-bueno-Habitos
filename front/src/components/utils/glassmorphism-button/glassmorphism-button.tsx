import styles from "./glassmorphism-button.module.css";

interface GlassmorphismButtonProps {
  text: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

const GlassmorphismButton: React.FC<GlassmorphismButtonProps> = ({
  text,
  onClick,
  disabled = false,
}) => {
  return (
    <button className={styles.btn} onClick={onClick} disabled={disabled}>
      <span className={styles.label}>{text}</span>
    </button>
  );
};

export default GlassmorphismButton;
