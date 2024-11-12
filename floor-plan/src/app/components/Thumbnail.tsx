// components/Thumbnail.tsx
import React from "react";
import styles from "./Thumbnail.module.css";

interface ThumbnailProps {
  thumbnail: string;
  onOpen: () => void;
}

/**
 * Component to render a thumbnail for a file.
 */
const Thumbnail: React.FC<ThumbnailProps> = ({ thumbnail, onOpen }) => {
  return (
    <div className={styles.thumbnailContainer} onClick={onOpen}>
      <img src={thumbnail} alt="Thumbnail" className={styles.thumbnail} />
    </div>
  );
};

export default Thumbnail;
