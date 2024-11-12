import React from "react";
import styles from "./Thumbnail.module.css"; // Assuming Thumbnail.module.css exists

interface ThumbnailProps {
  thumbnail: string;
  onOpen: () => void;
}

const Thumbnail: React.FC<ThumbnailProps> = ({ thumbnail, onOpen }) => (
  <div className={styles.thumbnail} onClick={onOpen}>
    <img src={thumbnail} alt="Thumbnail Image" />
  </div>
);

export default Thumbnail;
