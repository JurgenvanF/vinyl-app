# 💿 Vinyl Vault

Vinyl Vault is a web application that allows users to digitally manage and explore their vinyl record collections. The platform provides a central place where collectors can organize their albums, discover detailed release information, and share collections with friends.

Users can add records manually, search for releases through the Discogs database, or quickly scan barcodes to find albums. Each release contains detailed metadata such as artist, genre, tracklist, and total duration.

The goal of Vinyl Vault is to make managing a vinyl collection easier, more organized, and more social.

<img src="https://jurgenvanfraeijenhove.nl/assets/logo-BEvGQZ1w.jpg" alt="Vinyl Vault logo" width="400"/>

---

## 🌐 Application

Hosted via **Vercel**  
https://vinyl-app-sigma.vercel.app/

---

## ✨ Features

- User registration and login using **Firebase Authentication**
- Personal vinyl collection stored with **Cloud Firestore**
- Optimization to keep Discogs API calls low while gradually filling the database
- Search and add releases using the **Discogs API**
- **Optimized search system** using methods such as scoring to return the most relevant results with minimal API calls
- **Barcode scanner** for quickly adding records
- **Custom entry feature** to add albums that cannot be found through the existing search methods
- Uses **Cloudinary** to store images (removing custom albums or images also deletes them from Cloudinary)
- Detailed album pages with tracklists and metadata
- **Wishlist** for keeping track of wanted records
- **Friends system** to view other users' collections
- Profile and privacy settings
- **Multilingual interface** (Dutch / English)
- Fully **responsive design** for desktop, tablet, and mobile
- Modular and reusable **React components**

---

## 🛠️ Tech Stack

- **React**
- **Next.js**
- **TypeScript**
- **Firebase Authentication**
- **Cloud Firestore**
- **Cloudinary**
- **TailwindCSS**
- **SCSS**
- **Discogs REST API**
- **ZXing Barcode Scanner**

---

## 📦 Installation

Clone the repository:

```bash
git clone https://github.com/JurgenvanF/vinyl-app.git
cd vinyl-app
```

Install dependencies:

```bash
npm install
```

📚 Install all required libraries:

```bash
npm install next react react-dom
npm install firebase firebase-admin
npm install cloudinary next-cloudinary
npm install @zxing/browser html5-qrcode
npm install tailwindcss @tailwindcss/postcss sass
npm install lucide-react react-zoom-pan-pinch
```

Or use the one-line npm install:

```bash
npm install next react react-dom firebase firebase-admin cloudinary next-cloudinary @zxing/browser html5-qrcode tailwindcss @tailwindcss/postcss sass lucide-react react-zoom-pan-pinch
```

🔑 Set up environment variables (create a `.env.local` in the project root):

```bash
DISCOGS_TOKEN=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=

FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

Run the development server:

```bash
npm run dev
```

Then open http://localhost:3000
