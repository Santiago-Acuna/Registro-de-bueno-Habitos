import { FC } from "react";
import logs from "../../assets/logs2.png";
import book from "../../assets/book.png";
import styles from "./reading.module.css";
import { Link } from "react-router-dom";

const ReadingDashboard: FC = () => {
  return (
    <div className={styles.readingContainer}>
      <div className={styles.optionCard}>
        <Link to="/books">
          <img src={book} className={styles.optionImg} />
          <p className={styles.optionCardP}>Books Verde </p>
        </Link>
      </div>
      <div className={styles.optionCard}>
      <Link to="/logs">
        <img src={logs} className={styles.optionImg} />
        <p className={styles.optionCardP}>Logs Naranja</p>
        </Link>
      </div>
    </div>
  );
};
export default ReadingDashboard;
