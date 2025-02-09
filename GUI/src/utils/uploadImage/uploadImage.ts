import axios from "axios";

const UploadImage = async (file: File): Promise<string | undefined> => {
  // const presetKey: string = "619383924723864";
  const cloudName: string = "drs6nv4cv";
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "images-pi-foods");
  const uploadProcess = await axios.post(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    formData
  );
  console.log(uploadProcess.data.secure_url);
  if (uploadProcess.data.secure_url !== null)
    return uploadProcess.data.secure_url;
  else return undefined;
};

export default UploadImage;
