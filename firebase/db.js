import { db, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, addDoc, serverTimestamp, runTransaction } from './config';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export async function logWaste({ userId, weight, classId, foodType }) {
  if (!db) return;
  
  const weightNum = parseFloat(weight);
  if (isNaN(weightNum) || weightNum <= 0 || weightNum > 100) {
    throw new Error('Ugyldig vekt');
  }

  const logData = {
    userId,
    classId: classId || null,
    foodType: foodType || 'Annet',
    weight: weightNum,
    timestamp: new Date().toISOString(),
  };

  const docRef = await addDoc(collection(db, 'waste_logs'), logData);

  await runTransaction(db, async (transaction) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await transaction.get(userRef);
    if (userSnap.exists()) {
      transaction.update(userRef, {
        totalWaste: (userSnap.data().totalWaste || 0) + weightNum,
      });
    }

    if (classId) {
      const classRef = doc(db, 'classes', classId);
      const classSnap = await transaction.get(classRef);
      if (classSnap.exists()) {
        transaction.update(classRef, {
          totalWaste: (classSnap.data().totalWaste || 0) + weightNum,
        });
      }
    }
  });

  return { logId: docRef.id, weight: weightNum };
}

export async function getUserLogs(userId) {
  if (!db) return [];
  const q = query(
    collection(db, 'waste_logs'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(50)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getClassLogs(classId) {
  if (!db) return [];
  const q = query(
    collection(db, 'waste_logs'),
    where('classId', '==', classId),
    orderBy('timestamp', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getWeeklyWaste(classId) {
  if (!db) return [];
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);

  const q = query(
    collection(db, 'waste_logs'),
    where('classId', '==', classId),
    where('timestamp', '>=', weekStart.toISOString())
  );
  const snapshot = await getDocs(q);
  
  const logs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  const total = logs.reduce((s, l) => s + (l.weight || 0), 0);
  
  return { total, logs };
}

export async function getClassStudents(classId) {
  if (!db) return [];
  const q = query(
    collection(db, 'users'),
    where('classId', '==', classId),
    where('role', '==', 'student')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getTeacherClasses(teacherId) {
  if (!db) return [];
  const q = query(
    collection(db, 'classes'),
    where('teacherId', '==', teacherId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createClass({ name, teacherId }) {
  if (!db) return null;
  const code = generateId().substring(0, 6).toUpperCase();
  const docRef = await addDoc(collection(db, 'classes'), {
    name,
    teacherId,
    code,
    studentCount: 0,
    totalWaste: 0,
    createdAt: new Date().toISOString(),
  });
  return { id: docRef.id, code };
}

export async function getAdminStats() {
  if (!db) return { totalUsers: 0, totalStudents: 0, totalClasses: 0, totalWaste: 0 };

  const [usersSnap, classesSnap, logsSnap] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'classes')),
    getDocs(collection(db, 'waste_logs')),
  ]);

  const users = usersSnap.docs.map(d => d.data());
  const students = users.filter(u => u.role === 'student');
  const totalWaste = logsSnap.docs.reduce((s, d) => s + (d.data().weight || 0), 0);

  return {
    totalUsers: users.length,
    totalStudents: students.length,
    totalClasses: classesSnap.size,
    totalWaste,
    students,
    classes: classesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    logs: logsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
  };
}

export async function getAllSchools() {
  if (!db) return [];
  const snapshot = await getDocs(collection(db, 'schools'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createSchool({ name }) {
  if (!db) return null;
  const code = generateId().substring(0, 6).toUpperCase();
  const docRef = await addDoc(collection(db, 'schools'), {
    name,
    code,
    createdAt: new Date().toISOString(),
  });
  return { id: docRef.id, code };
}

export async function deleteWasteLog(logId) {
  if (!db) return;
  await deleteDoc(doc(db, 'waste_logs', logId));
}

export async function deleteUser(uid) {
  if (!db) return;
  await deleteDoc(doc(db, 'users', uid));
}

export async function deleteClass(classId) {
  if (!db) return;
  await deleteDoc(doc(db, 'classes', classId));
}
