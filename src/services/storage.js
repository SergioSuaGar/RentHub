import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';

const storage = getStorage();

export default {
  async getDownloadURL(filePath) {
    const fileRef = storageRef(storage, filePath);
    return await getDownloadURL(fileRef);
  },
};
