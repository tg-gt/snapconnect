# SnapConnect: Event Social Operating System

> **Temporary, High-Trust Social Networks for Events**
> 
> *Transforming events into private, gamified social experiences through location-based quests, AI-powered discovery, and ephemeral content that disappears when the magic ends.*

---

## 🎯 **The Core Thesis**

**SnapConnect isn't just another social app** — it's a **strategic pivot** that solves a fundamental problem in social networking: proximity-based features are scary in public, but magical in event contexts.

### **The Problem with General Social**
- Sharing location with strangers feels unsafe
- Follower counts create social hierarchies  
- Permanent content creates anxiety about consequences
- "Popularity spirals" favor early adopters over authentic moments

### **The Event Environment Solution**
- **Natural barriers to entry** create high-trust boundaries
- **Level playing field** - everyone starts with 0 followers
- **Situational identity** encourages authentic, in-the-moment expression
- **Temporary communities** remove "permanent consequences" anxiety
- **Shared context** makes proximity sharing feel safe and exciting

---

## 🚀 **Strategic Positioning: B2B Event Operating System**

**Not**: Another Instagram clone competing for user attention  
**But**: A deployable social platform that event organizers purchase to enhance their events

### **Business Model**
- **B2B SaaS**: Event organizers pay $500-5000 per event
- **White-label social experience** included in ticket price
- **Revenue streams**: Event licensing, sponsor integration, premium features

### **Target Market**
- Music festivals and concerts
- Corporate retreats and conferences  
- College events and orientation programs
- Art shows and cultural events
- Trade shows and networking events

---

## ⚡ **Spiky POVs: What Makes Us Different**

### 1. **High-Trust Environment Broadcasting**
Unlike general social platforms where proximity sharing is scary, event environments create natural safety boundaries that enable more open, authentic sharing.

### 2. **Level Playing Field Philosophy** 
Everyone starts with 0 followers at each event, encouraging authentic self-expression detached from external social proof or past accomplishments.

### 3. **Reverse Chronological Default**
Fights the "popularity spiral" by showing newest content first, giving everyone equal visibility opportunity regardless of early adoption.

### 4. **Quality Over Quantity Incentives**
Flat daily content limits prevent spam while ensuring equal posting opportunities for all participants.

### 5. **AI-Verified Gamification**
Probabilistic quest verification with acceptable false positives adds game-like unpredictability while enabling sophisticated challenges.

### 6. **Contextual Privacy Controls**
Granular broadcasting settings (geofenced, activity-based, connection-level) that match the situational nature of event networking.

### 7. **Memory Preservation Before Deletion**
AI-curated highlight reels and connection export features preserve meaningful memories while maintaining ephemeral core experience.

---

## 🏗️ **Technical Architecture**

### **Core Stack**
- **Frontend**: React Native + Expo
- **Backend**: Supabase (PostgreSQL + Real-time + Storage + Auth)
- **AI Layer**: OpenAI CLIP + GPT-4V for quest verification and content discovery
- **Vector DB**: Pinecone or Supabase pgvector for RAG features
- **Location**: expo-location with GPS verification (±100m accuracy)
- **Media**: Supabase Storage with automatic content expiration

### **Key Features**

#### **📱 Instagram-Style Foundation**
- 5-tab navigation (Home, Search, Create, Activity, Profile)
- Stories system with 24-hour expiration
- Real-time feed with infinite scroll
- Direct messaging and social interactions
- User profiles with post grids

#### **🎮 Event Gamification**
- **Location-based quests** with GPS verification
- **AI-powered photo challenges** using computer vision
- **Points and achievement system** with real-time leaderboards
- **Interactive venue maps** with quest markers
- **Social quests** encouraging networking and connections

#### **🤖 AI-Powered Experience**
- **Quest verification** using CLIP embeddings + GPT-4V analysis
- **Content discovery** with RAG-based recommendations
- **Interest matching** for "people doing similar activities"
- **Smart notifications** about nearby relevant content

#### **🔒 Privacy-First Design**
- **Geofenced content** - only visible within event boundaries
- **Ephemeral posts** with custom expiration timers
- **Pseudonymous handles** detached from real identity
- **Selective data export** before content deletion
- **Transparent organizer permissions** with clear boundaries

---

## 📊 **Current Status**

### ✅ **Phase 1: Instagram MVP - COMPLETE**
- Full social media foundation with posts, stories, comments, likes
- User authentication and profile management
- Real-time messaging and activity notifications
- Search and discovery functionality

### 🚧 **Phase 2: Event Operating System - IN PROGRESS**
- ✅ **Dual feed system** (Following vs Discovery)
- ✅ **Quest system** with location tracking and GPS verification
- ✅ **Interactive gamification** with points, achievements, leaderboards
- 🔄 **AI integration** (Vector DB + RAG features)
- ⏳ **Organizer dashboard** and B2B tools

### 🔮 **Phase 3: Platform Evolution - PLANNED**
- Event organizer marketplace
- Advanced AR/VR quest experiences
- Multi-event user profiles
- Enterprise team-building packages

---

## 🛠️ **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g @expo/cli`)
- Supabase account
- OpenAI API key (for AI features)

### **Setup**

1. **Clone and Install**
   ```bash
   git clone https://github.com/your-username/snapconnect.git
   cd snapconnect
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Add your keys:
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_key
   ```

3. **Database Setup**
   ```bash
   # In Supabase SQL Editor, run:
   # 1. config/database-schema.sql (Phase 1 tables)
   # 2. config/phase2-database-extensions.sql (Event tables)
   # 3. Create 'media' storage bucket (public)
   ```

4. **Run Development Server**
   ```bash
   npm start
   # Choose your platform: iOS, Android, or Web
   ```

### **Storage Setup**
Follow the detailed instructions in [`docs/SUPABASE_STORAGE_SETUP.md`](docs/SUPABASE_STORAGE_SETUP.md) to configure media uploads.

---

## 📚 **Documentation**

### **Project Overview**
- [📱 Application Overview](docs/application-overview.md) - Basic setup and authentication
- [🏗️ Project Structure](docs/project-structure.md) - File organization and architecture
- [🎨 Components & Styling](docs/components-and-styling.md) - UI framework and design system

### **Implementation Guides**
- [🎯 Phase 1 Complete](docs/PHASE_1A_COMPLETE.md) - Instagram MVP features
- [📋 Phase 2 PRD](docs/snapconnect/PRD/PHASE2-PRD-spikyPOVs-update.md) - Event OS specifications
- [⚡ Implementation Plan](docs/snapconnect/implement/phase2/p2-plan.md) - Development roadmap

### **Technical Deep Dives**
- [🗃️ State Management](docs/state-management.md) - Data flow and form handling
- [⚙️ Project Configuration](docs/project-configuration.md) - ESLint, TypeScript, tooling

---

## 🎪 **Demo Experience**

The current build showcases the "Event Operating System" concept:

1. **Join Demo Event** - Experience scoped to "SnapConnect Demo Event"
2. **Dual Feed System** - Toggle between Following (chronological) and Discovery (algorithmic) feeds
3. **Complete Quests** - Find locations, take photos, earn points with GPS verification
4. **Interactive Map** - Explore venue with quest markers and real-time activity
5. **Gamification** - Track progress on leaderboards, unlock achievements
6. **AI Features** - Experience smart content recommendations and quest verification

---

## 🤝 **Contributing**

SnapConnect is building the future of event social experiences! We welcome contributions from:

- **Developers** - React Native, Supabase, AI/ML expertise
- **Event Organizers** - Feedback on B2B features and real-world testing
- **UX Designers** - Improving the gamification and social interaction flows
- **Data Scientists** - Enhancing AI recommendations and quest verification

### **Development Process**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the implementation guides in `/docs`
4. Test with real GPS data and event scenarios
5. Submit a pull request with detailed descriptions

### **Current Priorities**
- AI quest verification optimization
- Organizer dashboard features
- Real-time leaderboard performance
- Event joining flow UX

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🌟 **Vision**

**SnapConnect isn't just solving a technical problem** — we're creating a new category of **temporary, high-trust social networks** that help people form authentic connections in event environments.

*Every festival becomes a private Instagram. Every conference becomes a gamified networking experience. Every gathering becomes a memory worth preserving.*

**The future of events is social, gamified, and ephemeral.** 🚀

---

*Built with ❤️ for event organizers who believe in the magic of bringing people together*
