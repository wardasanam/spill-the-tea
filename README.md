# **🍵 SPILL THE TEA**

**Spill the Tea** is a high-energy, Gen Z-inspired anonymous confession platform. It allows users to share "unhinged" thoughts, react with "vibes," and watch the timeline evolve in real-time before confessions expire after 24 hours.

## **✨ Core Features**

* **Anonymous Spilling:** No login required. Users are assigned randomly generated identities like "Toxic Simp" or "Based Demon."  
* **Burn After Reading:** Every confession is ephemeral. A 24-hour countdown ensures the timeline stays fresh and the "tea" doesn't get stale.  
* **Aura & XP System:** Build your "Aura" by interacting. Level up through ranks from **NPC** to **Lurker**, **Main Character**, and finally **Tea God**.  
* **Dynamic Vibe Styling:** Apply text styles (BASED, CRINGE, REAL, DOWN BAD, DARK) that automatically format your confession with appropriate emojis and casing.  
* **Giphy Integration:** Search and attach animated stickers directly from Giphy to make your confessions pop.  
* **Real-Time Feed:** Powered by Firebase Firestore for instant updates across all users.  
* **Custom Themes:** 15+ immersive themes including *Cyber Acid*, *Anime Lo-Fi*, *Dreamcore*, *Y2K Glitter*, and *Dark Academia*.

## **🚀 Tech Stack**

* **Frontend:** React.js  
* **Styling:** Tailwind CSS  
* **Icons:** Lucide-React  
* **Database:** Firebase Firestore (NoSQL)  
* **Authentication:** Firebase Anonymous Auth  
* **Animations:** Custom CSS Keyframes & Tailwind Transitions  
* **API:** Giphy API for sticker search

## **🛠️ Setup & Installation**

### **1\. Clone the repository**

git clone \[https://github.com/your-username/tea-confessions.git\](https://github.com/your-username/tea-confessions.git)  
cd tea-confessions

### **2\. Install Dependencies**

npm install  
\# or  
yarn install

### **3\. Firebase Configuration**

Update the userFirebaseConfig object in the main file with your own Firebase project credentials:

const userFirebaseConfig \= {  
  apiKey: "YOUR\_API\_KEY",  
  authDomain: "YOUR\_PROJECT.firebaseapp.com",  
  projectId: "YOUR\_PROJECT\_ID",  
  storageBucket: "YOUR\_PROJECT.firebasestorage.app",  
  messagingSenderId: "YOUR\_SENDER\_ID",  
  appId: "YOUR\_APP\_ID"  
};

### **4\. Firestore Security Rules**

To ensure the app works correctly with the custom path structure used in the code, your Firestore rules should allow access to:  
/artifacts/{appId}/public/data/confessions/{document=\*\*}

### **5\. Run the Project**

npm run dev

## **🎮 How to Play**

1. **Change Your Name:** Click your generated identity to edit it or hit the refresh icon to roll a new one.  
2. **Pick a Vibe:** Select a color dot (BASED, REAL, etc.) to style your text automatically.  
3. **Add Stickers:** Click the emoji face to open the Giphy search.  
4. **Sip the Tea:** Click "SIP" on confessions you like to give the author Aura XP.  
5. **React:** Long press or click "Add Vibe" on a card to drop a 💀, 🔥, or 🤡 reaction.

## **📝 License**

This project is for educational/experimental purposes. Keep the tea spicy but respectful\!