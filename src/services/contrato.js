import { db } from '@/services/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';

const contratosCollection = collection(db, 'contratos');

export default {
  async getAll() {
    const snapshot = await getDocs(contratosCollection);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async getById(id) {
    const docRef = doc(contratosCollection, id);
    const snapshot = await getDoc(docRef);
    return { id: snapshot.id, ...snapshot.data() };
  },

  async create(data) {
    const docRef = await addDoc(contratosCollection, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async update(id, data) {
    const docRef = doc(contratosCollection, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(id) {
    const docRef = doc(contratosCollection, id);
    await deleteDoc(docRef);
  },

  async getByPropiedadId(propiedadId) {
    const q = query(contratosCollection, where('propiedadId', '==', propiedadId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },
};
