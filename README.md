# ET Navigator: The Intelligent Newsroom

An AI-native business news experience featuring personalized newsrooms, interactive intelligence briefings, and story arc tracking. ET Navigator synthesizes thousands of sources to deliver a specific, high-signal news edge tailored to your persona.

## 🚀 Features

- **Personalized Newsrooms**: Tailored news feeds for General, Investor, Startup, and Student personas.
- **AI News Navigator**: Deep-dive into any story with an interactive, conversational interface powered by Gemini 3.1 Pro.
- **Story Arc Tracking**: Visualize the evolution of a news narrative over time with sentiment analysis and key player identification.
- **AI Video Studio**: Generate concise, professional broadcast reports of key news stories with kinetic typography.
- **Demo Mode**: Explore the full application with high-quality mock data even without a live Gemini API key.
- **Dynamic Theming**: A premium Dark Mode with color-coded sidebar accents that adapt to your active tab (Red for Feed, Blue for Navigator, Gold for Arcs).
- **Multilingual Support**: Switch between English, Hindi, and Tamil with a single tap.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Motion (Framer Motion)
- **Icons**: Lucide React
- **AI Integration**: Google Gemini API via `@google/genai`
- **Charts**: Recharts

## 📦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Gemini API Key (get one at [ai.google.dev](https://ai.google.dev/))

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd et-navigator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open the app**:
   Navigate to `http://localhost:3000` in your browser.

## 🏗️ Build for Production

To create a production-ready build:
```bash
npm run build
```
The output will be in the `dist` folder.

## 📄 License

This project is licensed under the Apache-2.0 License. See the `LICENSE` file for details.
