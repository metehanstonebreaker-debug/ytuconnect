import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// read firebase config
const configPath = path.resolve('firebase-applet-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const app = initializeApp(config);
const db = getFirestore(app, "ai-studio-yldzconnect-bbc6f1a6-1069-4aa8-9f8b-d9c26d7cac84");

async function run() {
  const postsRef = collection(db, 'posts');
  const snapshot = await getDocs(postsRef);
  
  for (const d of snapshot.docs) {
    const data = d.data();
    if (d.id.startsWith('p') || data.author === "SKY LAB Kulübü" || data.author === "YTÜ Kariyer Planlama" || data.author === "Müzik Kulübü" || data.author === "IEEE YTÜ" || data.content.includes("Yıldız Hack")) {
      await deleteDoc(d.ref);
      console.log('deleted post', d.id);
    }
  }

  const storiesRef = collection(db, 'stories');
  const storiesSnapshot = await getDocs(storiesRef);
  for (const d of storiesSnapshot.docs) {
    const data = d.data();
    if (["SKY LAB Kulübü", "Müzik Kulübü", "IEEE YTÜ"].includes(data.author)) {
      await deleteDoc(d.ref);
      console.log('deleted story', data.author);
    }
  }
}

run().then(() => {
    console.log('Done');
    process.exit(0);
}).catch(console.error);
