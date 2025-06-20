# Virtual Human – AI Health Companion

## 🧠 Introduction

**Virtual Human** is an AI project aimed at developing an accessible virtual assistant to support individuals with low health literacy. The assistant will guide users in understanding and managing their well-being by simplifying access to trusted health resources, such as those on the Dutch platform **"De Stap."**

By engaging users in clear, step-by-step conversations, the AI filters and delivers personalized health content—helping users build healthier, more active lifestyles, without overwhelming them with information.

---

## 🎯 Purpose & Goals

### The Problem  
Despite the abundance of health content, many low-literate individuals in the Netherlands struggle to:
- Understand complex text-based resources.
- Know where to start.
- Stay engaged on platforms like "De Stap."

### The Vision  
Create a **conversational AI assistant** that:
- Engages users in a simple, intuitive flow.
- Asks clear questions to understand needs.
- Recommends relevant health resources.
- Builds trust through personalized and visual communication.

---

## 🛠️ Key Features

- **AI-powered assistant** for guiding users.
- **Simple, accessible dialogue** with the user.
- **Personalized content** recommendation.
- **Multilingual support** for better reach (optional future step).
- **Engagement tracking** to evaluate performance.

---

## 🧪 Technical Overview

- **AI Framework**: GPT-4o-mini
- **Model Type**: Natural Language Understanding (NLU) and Recommendation System
- **Interface**: Chatbot (web-based or voice-assisted)
- **Training Dataset**:
  - Curated health texts from De Stap
  - Synthetic dialogues simulating user queries
  - Annotated low-literacy question/response pairs
- **Deployment**: Standalone or integrated into the existing De Stap website

---

## 🚀 Start project
- **Node:** install node from the official website [nodejs.org](https://nodejs.org/en) and make sure to download at least version 20
- **Environment**: Make a .env file in the front-end folder
- **Add api keys**: Add the API keys in the .env folder as seen here:
  - OPENAI_API_KEY=INSERT_YOUR_OWN_KEY_HERE
  - ELEVENLABS_API_KEY=INSERT_YOUR_OWN_KEY_HERE
- **Open terminal**: Open the terminal for the following commands (In this order).
- **Go to folder**: 'cd front-end'
- **Install packages**: 'npm install'
- **Start application**: 'npm run dev'
- **Open application**: Go to the localhost or IP-adress in the command line. The application should work then
- **Chatbot data embedding**: After sending the first message it takes a while for the chatbot to react. This is because of the AI generating and embedding the data. He only needs to do this once.
- **Start chatting**: Now you are free to have a conversation with the AI (Watch the tokens tho. especcialy with the speech function).

---

## 🧭 Implementation Plan

1. **Data Collection**
   - Source structured health content
   - Analyze engagement patterns from "De Stap"
2. **Model Training**
   - Build and fine-tune conversational AI
   - Train for classification and recommendation
3. **Prototype & Test**
   - MVP with basic health query navigation
   - User testing and feedback loops
4. **Iteration**
   - Weekly updates (Friday check-ins)
   - Refine based on engagement and usability metrics

---

## 📊 Measuring Success

- Increased time spent on relevant pages
- Higher click-through and interaction rates
- Improved user understanding (measured via surveys or behavior)
- Ability to make independent health-related decisions

---

## 👥 Team Roles

| Name               | Role                         |
|--------------------|------------------------------|
| Sam Deen           | Team Leader / Secondary Notes|
| Merijn Wilgehof    | Spokesperson / Primary Notes |
| Viktor Velizarov   | Scrum Master                 |

---

## 💰 Budget

| Item       			| Cost Estimate                     		|
|-----------------------|-------------------------------------------|
| AI Model   			| ~€4.50/month per user *(10 requests/day)*	|
| Hosting, Infra, etc. 	| TBD based on scale            			|

---

## 📌 Questions Still To Address

- What AI architecture is best (transformer vs. simpler models)?
- How to monitor user comprehension in real-time?
- Is a voice assistant more effective than text for this audience?
- What privacy measures are necessary?

---

## ✅ Conclusion

The Virtual Human project is more than a digital assistant—it’s a **gateway to health empowerment**. By combining GPT-4o-mini based AI with a user-friendly interface, it aims to break down health information barriers and encourage healthier lifestyles for everyone, regardless of literacy level.

