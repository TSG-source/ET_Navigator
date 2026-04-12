# 🚀 ET Navigator: Your AI-Powered Newsroom

**ET Navigator** is like having a personal assistant who reads the news for you. It picks out the most important stories based on who you are (like an investor or a student) and can even turn news into short videos!

---

## 📺 What can it do?
*   **Personalized for You:** Tell the app who you are, and it shows you news you actually care about.
*   **Chat with News:** Don't understand a complex story? Just ask the AI to explain it like you're 5.
*   **See the Future:** Use "Story Arcs" to see where a news story is heading.
*   **Watch the News:** Click a button to turn any article into a professional video report.
*   **Dark Mode:** A beautiful, eye-friendly dark grey and red theme for night reading.

---

## ⚙️ Technical Requirements

If you are a developer or want to use specific tools, here are the requirements:

*   **Node.js:** Version **v18.0.0** or higher (Recommended: **v20 LTS** or **v22 LTS**).
*   **npm:** Version **v9.0.0** or higher (comes bundled with Node.js).
*   **Version Manager (Optional):** We recommend using [**fnm**](https://github.com/Schniz/fnm) for fast and easy Node.js version switching.
    *   To install the correct version with fnm: `fnm install --lts`
*   **Docker (Optional):** If you prefer containers, you can run this app using Docker.
    1.  Build the image: `docker build -t et-navigator .`
    2.  Run the container: `docker run -p 3000:3000 et-navigator`

---

## 🛠️ How to set it up (The "Easy Way")

If you've never touched code in your life, don't worry! Just follow these steps:

### Step 1: Install the "Engine" (Node.js)
Think of this as the engine that makes the app run.
1.  Go to [nodejs.org](https://nodejs.org/).
2.  Click the big button that says **"LTS"**.
3.  Open the file you downloaded and keep clicking **"Next"** until it's finished.

### Step 2: Get the Project Files
1.  On this GitHub page, click the green **"Code"** button (near the top right).
2.  Click **"Download ZIP"**.
3.  Find the file in your "Downloads" folder, right-click it, and choose **"Extract All"** (or "Unzip"). Move that folder to your **Desktop**.

### Step 3: Open the "Command Center"
We need to tell your computer to start the app.
*   **Windows:** Press the `Start` key, type **cmd**, and press Enter.
*   **Mac:** Press `Command + Space`, type **Terminal**, and press Enter.

### Step 4: Go to the Folder
Type this exactly and press Enter:
```bash
cd Desktop/ET_Navigator-main
```
*(Note: If your folder has a different name, use that name instead!)*

### Step 5: Install & Start
Type these two lines, one after the other (press Enter after each):
1.  `npm install`  *(Wait for the bars to finish moving)*
2.  `npm run dev`

### Step 6: Open the App!
Your "Command Center" will show a link like `http://localhost:3000`. 
**Copy and paste that into your web browser (Chrome, Safari, etc.) and you're done!**

---

## 💡 Frequently Asked Questions (FAQ)

**"Do I need to pay for anything?"**
No! The app works in **Demo Mode** for free using sample data.

**"How do I use the real AI?"**
If you want live news and real AI answers:
1.  Get a free key from [ai.google.dev](https://ai.google.dev/).
2.  Find the file `.env.example` in the folder.
3.  Rename it to `.env`.
4.  Open it with Notepad, paste your key after the `=`, and save.

**"It's not working!"**
Make sure you installed **Node.js** (Step 1). If you get an error, try closing the "Command Center" and starting again from Step 3.

---

## 📄 License
This project is free to use under the Apache-2.0 License.
