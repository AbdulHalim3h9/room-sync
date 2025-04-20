import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase";

export const storeDeviceInfo = async (deviceInfo) => {
  try {
    const deviceCollection = collection(db, 'deviceInfo');
    const docRef = await addDoc(deviceCollection, {
      ...deviceInfo,
      timestamp: serverTimestamp(),
      ip: window.location.hostname
    });
    console.log('Device info stored with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error storing device info:', error);
    throw error;
  }
};

export const storeUniqueDeviceInfo = async (deviceInfo) => {
  try {
    // Create a unique identifier for this device
    const deviceIdentifier = `${deviceInfo.deviceModel}-${deviceInfo.osVersion}-${deviceInfo.screenWidth}x${deviceInfo.screenHeight}`;
    
    // Check if this device already exists
    const deviceCollection = collection(db, 'uniqueDevices');
    const q = query(deviceCollection, where('identifier', '==', deviceIdentifier));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // Device is unique, store it
      const docRef = await addDoc(deviceCollection, {
        ...deviceInfo,
        identifier: deviceIdentifier,
        firstSeen: serverTimestamp(),
        lastSeen: serverTimestamp(),
        usageCount: 1,
        ip: window.location.hostname
      });
      console.log('New unique device stored with ID:', docRef.id);
      return { isNew: true, id: docRef.id };
    } else {
      // Device already exists, update last seen and increment usage count
      const deviceDoc = querySnapshot.docs[0];
      await deviceDoc.ref.update({
        lastSeen: serverTimestamp(),
        usageCount: deviceDoc.data().usageCount + 1
      });
      console.log('Existing device updated:', deviceDoc.id);
      return { isNew: false, id: deviceDoc.id };
    }
  } catch (error) {
    console.error('Error storing unique device info:', error);
    throw error;
  }
};

export const getDeviceStats = async () => {
  try {
    // Get total unique devices
    const uniqueDevicesSnapshot = await getDocs(collection(db, 'uniqueDevices'));
    const uniqueDevicesCount = uniqueDevicesSnapshot.size;
    
    // Get total device accesses
    const deviceInfoSnapshot = await getDocs(collection(db, 'deviceInfo'));
    const totalAccesses = deviceInfoSnapshot.size;
    
    // Get most common device
    const deviceModels = {};
    deviceInfoSnapshot.docs.forEach(doc => {
      const model = doc.data().deviceModel;
      deviceModels[model] = (deviceModels[model] || 0) + 1;
    });
    const mostCommonDevice = Object.entries(deviceModels).reduce((a, b) => 
      a[1] > b[1] ? a : b
    );
    
    return {
      uniqueDevices: uniqueDevicesCount,
      totalAccesses,
      mostCommonDevice: mostCommonDevice[0],
      mostCommonDeviceCount: mostCommonDevice[1]
    };
  } catch (error) {
    console.error('Error getting device stats:', error);
    throw error;
  }
};
