import { useState } from "react";
import styles from "./glassmorphism-form.module.css";

interface GlassmorphismFormProps {
  onClose: () => void;
  onSubmit?: (data: GlassmorphismFormData) => void;
}

export interface GlassmorphismFormData {
  name: string;
  description: string;
  logo: File | null;
}

const GlassmorphismForm: React.FC<GlassmorphismFormProps> = ({
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<GlassmorphismFormData>({
    name: "",
    description: "",
    logo: null,
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, logo: file }));
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert("Please enter an action type name");
      return;
    }
    onSubmit?.(formData);
    onClose();
  };

  const handleRemoveLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLogoPreview(null);
    setFormData((prev) => ({ ...prev, logo: null }));
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      {/* Floating orbs */}
      <div
        className={styles.orb}
        style={{
          top: "10%",
          left: "10%",
          width: "300px",
          height: "300px",
          background: "rgba(138, 43, 226, 0.3)",
        }}
      />
      <div
        className={styles.orb}
        style={{
          top: "60%",
          right: "15%",
          width: "250px",
          height: "250px",
          background: "rgba(0, 191, 255, 0.3)",
          animationDelay: "2s",
        }}
      />
      <div
        className={styles.orb}
        style={{
          bottom: "10%",
          left: "50%",
          width: "200px",
          height: "200px",
          background: "rgba(255, 0, 128, 0.3)",
          animationDelay: "4s",
        }}
      />

      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="1" y1="1" x2="13" y2="13" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="13" y1="1" x2="1" y2="13" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </button>

        <div className={styles.header}>
          <h1 className={styles.title}>CREATE ACTION TYPE</h1>
          <div className={styles.divider} />
          <p className={styles.subtitle}>Define your habit parameters</p>
        </div>

        <div className={styles.fields}>
          <div>
            <label className={styles.label}>Action Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter action name..."
              className={styles.input}
            />
          </div>

          <div>
            <label className={styles.label}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe this action type..."
              rows={4}
              className={styles.textarea}
            />
          </div>

          <div>
            <label className={styles.label}>Action Logo</label>
            <div
              className={`${styles.uploadArea} ${logoPreview ? styles.uploadAreaHasImage : ""}`}
              onClick={() =>
                document.getElementById("glassmorphism-logo-upload")?.click()
              }
            >
              {logoPreview ? (
                <div>
                  <img
                    src={logoPreview}
                    alt="Preview"
                    className={styles.previewImg}
                  />
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={handleRemoveLogo}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <div className={styles.uploadIcon}>📸</div>
                  <div className={styles.uploadText}>Click to upload logo</div>
                  <div className={styles.uploadHint}>
                    PNG, JPG, GIF up to 2MB
                  </div>
                </div>
              )}
              <input
                type="file"
                id="glassmorphism-logo-upload"
                accept="image/*"
                onChange={handleImageUpload}
                className={styles.hiddenInput}
              />
            </div>
          </div>

          <button className={styles.submitBtn} onClick={handleSubmit}>
            <span className={styles.submitLabel}>Create Action Type</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlassmorphismForm;
