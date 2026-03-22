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
      <span className={styles.label}>
        <span className={styles.star}>✨</span>
        {text}
        <span className={styles.star}>✨</span>
      </span>
    </button>
  );
};

export default GlassmorphismButton;
