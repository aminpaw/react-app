import "./App.css";
import React from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  doc,
  setDoc,
  addDoc,
} from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

const app = initializeApp({
  apiKey: "AIzaSyCAytks3dANDKYb_CKznzHkQhkOyRtKBQY",
  authDomain: "chat-app-24162.firebaseapp.com",
  projectId: "chat-app-24162",
  storageBucket: "chat-app-24162.appspot.com",
  messagingSenderId: "847337751263",
  appId: "1:847337751263:web:3a81589e851b05efd31f6a",
  measurementId: "G-7EJL2S9G54",
});

const auth = getAuth(app);
const db = getFirestore(app);

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Chat App</h1>
        {user ? <SignOut /> : <SignIn />}
      </header>
      {
        /* if user show chatroom else show nothing */
        user ? <ChatRoom /> : <></>
      }
    </div>
  );
}

function SignIn() {
  // Sign in with Google
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };
  return <button onClick={signInWithGoogle}>Sign in with Google</button>;
}

function SignOut() {
  // Sign out
  return (
    auth.currentUser && <button onClick={() => signOut(auth)}>Sign Out</button>
  );
}

function ChatRoom() {
  // Reference to messages collection
  const messagesRef = collection(db, "messages");
  // Query documents in collection
  const q = query(messagesRef, orderBy("createdAt"), limit(25));
  // Listen to data with a hook
  const [messages] = useCollectionData(q, { idField: "id" });

  const [formValue, setFormValue] = React.useState("");

  const sendMessage = async (e) => {
    e.preventDefault();
    await addDoc(messagesRef, {
      text: formValue,
      createdAt: new Date(),
      uid: auth.currentUser.uid,
      photoURL: auth.currentUser.photoURL,
    });
    setFormValue("");
  };
  return (
    <>
      <div>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
      </div>
      <div>
        <form onSubmit={sendMessage}>
          <input
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt="user" />
      <p>{text}</p>
    </div>
  );
}

export default App;
