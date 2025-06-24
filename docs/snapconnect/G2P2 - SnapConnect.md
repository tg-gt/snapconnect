![A blue sphere leads a group of blue spheres across a boundary between differently coloured areas][image1]

# **SnapConnect**

*Share Moments. Disappear. Discover More.*

---

## **Background**

Visual communication has become the dominant language of digital connection. Over 5 billion people worldwide use ephemeral messaging daily—from teenagers sharing moments with friends to professionals networking at events. The visual social media market has grown to over $15 billion annually, with Snapchat alone serving 750 million daily users and generating $4+ billion in revenue.

Yet despite this massive adoption, current platforms are fundamentally limited by their shallow understanding of content and user preferences. Users are drowning in generic content, struggling to find personalized experiences, and missing out on AI-generated content that could perfectly match their interests and social contexts.

**The Current Problem:**

* **Surface-Level Personalization:** While platforms have recommendation algorithms, they lack deep semantic understanding of user interests and content meaning  
* **Limited Content Assistance:** Users must generate all content themselves without intelligent AI assistance for creation  
* **Manual Content Creation:** No tools to help users create engaging captions, stories, or post ideas based on their interests  
* **Context-Aware Generation Gap:** Apps can't leverage user history and preferences to generate relevant, personalized content suggestions  
* **Reactive Rather Than Proactive:** Platforms show existing content but don't help users create better content

**The Market Opportunity:** Snapchat's success proves massive demand for ephemeral visual communication, but their pre-AI architecture leaves enormous room for improvement. Users consistently report frustration with irrelevant content, repetitive experiences, and lack of intelligent content assistance.

**The RAG Revolution:** Retrieval-Augmented Generation represents a fundamental breakthrough in personalized content experiences. Instead of static recommendations, RAG enables real-time access to vast knowledge bases about user preferences, interests, and behaviors to generate perfectly tailored content and suggestions.

What if we could rebuild Snapchat with RAG at its core? Instead of users seeing generic content, AI could understand their interests deeply and generate personalized snaps, captions, and recommendations. Rather than manual content creation, RAG could assist users in creating content that resonates with their audience and personal brand.

Today, we're building the next generation of social platforms: RAG-powered applications that don't just share content, but intelligently generate and curate personalized experiences based on deep understanding of user preferences and social contexts.

## **Project Overview**

This 7-day project challenges you to build a fully functional Snapchat clone, then enhance it with cutting-edge RAG (Retrieval-Augmented Generation) capabilities that surpass existing social platforms. You'll leverage modern AI development tools and implement sophisticated content generation and personalization systems throughout the entire user experience.

### **Phase 1: Core Clone (Days 1-3)**

Build a complete ephemeral messaging platform with essential features:

* Real-time photo/video sharing with disappearing messages  
* Simple AR filters and camera effects  
* User authentication and friend management  
* Stories and group messaging functionality  
* Core social features matching Snapchat's core experience

### **Phase 2: RAG Enhancement (Days 4-7)**

Transform your clone by integrating advanced RAG capabilities tailored to your chosen user niche:

* Personalized content generation based on user interests and history  
* Intelligent caption and story suggestions using RAG  
* Context-aware friend and content recommendations  
* AI-generated content ideas and prompts

**Ultimate Goal:** Create a better version of Snapchat built with RAG-first principles, demonstrating how retrieval-augmented generation can revolutionize content creation and personalization beyond what traditional platforms offer.

## **Submission Guidelines**

At the end of the week, you'll need to submit the following:

1. **GitHub Repository:** A link to your project's public GitHub repository with complete source code and documentation

2. **Video Demo:** A 5-minute walkthrough showcasing your RAG features and core functionality

3. **Deployed Application:** A link to the working deployed application where users can test all features

4. **BrainLift**: A link to the document you used to learn, understand, and enhance the application with RAG

5. **Social Media Post:** A link to a post on X (Twitter) or LinkedIn showcasing your process of building with RAG, key technical achievements, or insights gained during development

## **Key Development Focus: RAG-Powered Content Generation**

Your project centers on building an intelligent social platform using Retrieval-Augmented Generation for personalized content experiences. Choose one primary user type and build a complete RAG-enhanced experience for them.

### **Choose Your Primary User**

**Option 1: Content Creators** \- Users building personal brands and engaging audiences   
**Option 2: Social Connectors** \- Users sharing moments and maintaining friendships  
**Option 3: Interest Enthusiasts** \- Users passionate about specific hobbies, topics, or communities

### **Specify Your Niche**

Narrow your focus to a specific type of user within your chosen category:

**Content Creator Examples:**

* Fitness influencers sharing workout content and motivation  
* Food bloggers showcasing recipes and restaurant experiences  
* Travel enthusiasts documenting adventures and recommendations  
* Fashion creators styling outfits and trend commentary

**Social Connector Examples:**

* College students sharing campus life and study moments  
* Remote workers maintaining connections with colleagues  
* Family members sharing updates and milestone moments  
* Friend groups coordinating activities and shared experiences

**Interest Enthusiast Examples:**

* Gaming enthusiasts sharing achievements and strategies  
* Book lovers discussing reviews and recommendations  
* Music fans sharing concert experiences and discoveries  
* Sports fans following teams and sharing game moments

### **Define RAG-Enhanced User Stories**

Create detailed user stories that specifically leverage RAG capabilities for content generation. For example:

**Fitness Influencer Stories:**

* "As a fitness influencer, I want AI to generate personalized workout captions based on my training history and audience interests"  
* "As a fitness influencer, I want content suggestions for posts that resonate with my followers based on trending fitness topics"  
* "As a fitness influencer, I want AI to help me create motivational content that matches my personal brand and messaging style"

**College Student Stories:**

* "As a college student, I want AI to suggest fun captions for my study group photos based on our shared experiences"  
* "As a college student, I want personalized content ideas for campus events that would interest my friend network"  
* "As a college student, I want AI to help me create engaging stories about my academic journey and campus life"

### **Build RAG-First**

Every feature should leverage RAG capabilities for intelligent content generation and personalization. Each RAG implementation should work end-to-end before moving to the next.

For example, if you choose **Content Creators:**

✅ Complete user interest profiling → content knowledge base → personalized generation pipeline 

❌ Partial implementation of basic recommendations, caption generation, AND audience analysis

If you choose **Social Connectors:**

✅ Complete friend interaction history → relationship context → personalized content suggestions flow 

❌ Partial implementation of friend suggestions, group features, AND content recommendations

**Remember:** A fully functional RAG app for one user type is more valuable than a partial implementation trying to serve everyone.

## **Core Requirements**

To successfully complete this project, you must:

### **1\. Build and Deploy a Working Application**

* **User Focus:** Pick one primary user type (Content Creators/Social Connectors/Interest Enthusiasts)

* **Niche Selection:** Choose a specific niche within your user type

* **Feature Set:** Identify 6 core user stories that leverage or support RAG capabilities

### **2\. Implement RAG-Powered Features**

* **Personalized Content Generation:** AI-generated captions, stories, and post ideas based on user interests and history

* **Intelligent Content Suggestions:** Context-aware recommendations for what to post, when to post, and how to engage

* **Knowledge-Enhanced Responses:** Use external knowledge bases to generate relevant, accurate, and engaging content

* **Adaptive Learning:** RAG system that improves suggestions based on user feedback and behavior patterns

### **3\. Showcase Your Implementation**

* **Demo Video:** Highlight your chosen path, niche, and RAG-powered user stories

* **Working Features:** Demonstrate functionality that matches your 6 user stories

* **RAG Integration:** Show how RAG enhances the content creation or social experience

## **Technical Architecture Recommendations**

### **Frontend Stack**

* **Framework:** React Native with Expo for rapid cross-platform development

* **Build Tool:** Expo for React Native for rapid development

* **Styling:** NativeWind/Tailwind CSS for responsive design

* **State Management:** Zustand or Redux Toolkit for complex state management

* **Real-time Features:** Firebase Realtime Database or Supabase Realtime

### **Backend & RAG Integration**

* **Option A: Firebase**

  * Authentication: Firebase Auth

  * Database: Firestore for user data and content

  * Functions: Cloud Functions for RAG processing

  * Storage: Firebase Storage for media files

  * Hosting: Firebase Hosting with global CDN

* **Option B: Supabase**

  * Authentication: Supabase Auth

  * Database: PostgreSQL on Supabase with vector extensions

  * Functions: Edge Functions for RAG processing

  * Storage: Supabase Storage for media files

  * Hosting: Vercel or Netlify

### **RAG Services**

* **Primary LLM:** OpenAI GPT-4 API for content generation and understanding

* **Vector Database:** Pinecone, Weaviate, or Supabase Vector for semantic search

* **Processing:** Cloud Functions or Edge Functions for RAG orchestration

## **Success Metrics**

### **Core Functionality**

* **Feature Completeness:** All 6 identified user stories fully functional

* **Performance:** Sub-3 second response time for RAG-generated content

* **User Experience:** Seamless content generation/consumption without interrupting user flow

* **Deployment:** Fully deployed and accessible mobile application

### **RAG Quality**

* **Content Quality:** Generated content matches user interests and writing style

* **Personalization:** Demonstrable improvement in content quality through user-specific RAG

* **Knowledge Integration:** Effective use of external knowledge for enhanced content generation

* **Learning:** Personalization improves with user feedback and interaction history

### **User Acquisition (Bonus Points)**

* **Launch Success:** App successfully deployed and acquiring real users

* **Growth Metrics:** 5 bonus points for every 10 users acquired (up to 50 bonus points)

* **Engagement:** Active user behavior and feature utilization

* **Retention:** Users returning to use RAG-powered content generation features

## **Project Milestones**

| Date | Milestone | Description |
| ----- | ----- | ----- |
| June 24 | MVP Submission | Submit a working Snapchat clone with core social features |
| June 25 | RAG Development Phase | Begin adding RAG-powered content generation tailored to your target user |
| June 27 | Early Submission | Submit deployed working app with 6 complete user stories |
| June 29 | Final Submission | Submit your final project for grading with user acquisition metrics |
