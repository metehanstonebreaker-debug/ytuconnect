import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

const configPath = path.resolve('firebase-applet-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const app = initializeApp(config);
const db = getFirestore(app, "ai-studio-yldzconnect-bbc6f1a6-1069-4aa8-9f8b-d9c26d7cac84");

const mockAuthors = [
    "SKY LAB Kulübü", "YTÜ Kariyer Planlama", "Prof. Dr. Ahmet Yılmaz (Bilgisayar Müh.)",
    "IEEE YTÜ", "Kalite ve Verimlilik Kulübü", "YTÜ Rektörlük Duyuru",
    "Sanat & Tasarım Kulübü", "YTÜ Spor Kulübü", "Doç. Dr. Elif Kaya (Endüstri Müh.)",
    "İşletme Kulübü", "YTÜ Mizah Topluluğu", "Prof. Dr. Caner Şahin (Makine Müh.)",
    "Mimarlık Fakültesi Dekanlığı", "Müzik Kulübü"
];

async function run() {
  const postsRef = collection(db, 'posts');
  const snapshot = await getDocs(postsRef);
  
  for (const d of snapshot.docs) {
    const data = d.data();
    if (d.id.startsWith('p') || mockAuthors.includes(data.author) || data.author.includes("YTÜ") || data.author.includes("Kulübü") || data.author.includes("Prof") || data.author.includes("Doç")) {
      await deleteDoc(d.ref);
      console.log('deleted post', d.id, data.author);
    }
  }

  const storiesRef = collection(db, 'stories');
  const storiesSnapshot = await getDocs(storiesRef);
  for (const d of storiesSnapshot.docs) {
    const data = d.data();
    if (mockAuthors.includes(data.author) || data.author.includes("YTÜ") || data.author.includes("Kulübü")) {
      await deleteDoc(d.ref);
      console.log('deleted story', d.id, data.author);
    }
  }
}

run().then(() => {
    console.log('Done');
    process.exit(0);
}).catch(console.error);
