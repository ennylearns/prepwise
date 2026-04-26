# **Product Requirements Document (PRD) — Prepwise**

## **1. Product Overview**

**Product Name:** Prepwise  
**Category:** EdTech (Exam Preparation)  
**Target Market:** Nigerian secondary school students preparing for JAMB

### **Problem Statement**

Students preparing for JAMB face:
- No structured study path
- Overwhelming syllabus
- Lack of clarity on weak areas
- Passive practice (random questions without feedback)
### **Solution**
Prepwise delivers:
- A **structured, syllabus-mapped curriculum**
- **Teacher-created lessons per topic**
- **Practice questions tied to each lesson**
- **Mastery-based progression**
- **Full CBT mock exams simulating JAMB**

---

## **2. Goals & Objectives**

### **Primary Goals**
- Help students **complete the JAMB syllabus effectively**
- Ensure **mastery before progression**
- Provide **real exam simulation experience**

### **Success Metrics**
- Lesson completion rate
- Daily active users
- Mock exam participation rate
- Conversion rate (free → paid)
- Student performance improvement (pre vs post tests)

---

## **3. User Roles**

### **3.1 Students (Primary Users)**
- Access lessons and practice
- Take mock exams
- Track progress

### **3.2 Teachers (Restricted Access)**
- Upload lessons per topic
- Attach 10 practice questions per lesson

### **3.3 Content Uploaders (Restricted Access)**
- Upload JAMB past questions
- Maintain question database

### **3.4 Admin (You)**
- Manage users (teachers/uploaders)
- Approve content
- Monitor system

---
## **4. System Architecture Overview**
### **Frontend (React.js)**
Three separate portals:
1. Student App (Public)
2. Teacher Portal (Private)
3. Question Upload Portal (Private)
    
### **Backend**
- Convex (database + server functions)
    
### **Key Rule**
- **Frontend NEVER talks directly to the database**
- All communication goes through **Convex functions**

---
## **5. Core Features**


## **5.1 Student Platform (Main Product)**

### **5.1.1 Authentication**
- Sign up / Login
- JWT-based authentication (handled via Convex)

### **5.1.2 Lesson Tree (Duolingo Style)**

#### Structure:
- Subject → Sections → Topics → Lessons

#### UI Behavior:

- Tree-like structure
- Topics represented as nodes
- Locked/unlocked progression

#### Rules:
- Must complete previous node to unlock next
    
- Must pass lesson quiz to proceed
    

---

### **5.1.3 Lesson Experience**

Each lesson contains:
- Teacher-created content (text, images, examples)
- “Practice Section” (10 questions)

#### Rules:
- Must complete lesson before attempting questions
- Must reach a **minimum score (e.g., 70%)** to pass

### **5.1.4 Practice Questions**
- Multiple choice format
- Instant feedback
- Explanation after submission

### **5.1.5 CBT Exam Mode**

#### Features:
- Full-length JAMB simulation
- Timer
- Subject combination selection
- Navigation between questions
- JAMB-style keyboard controls:
    - Next/Previous
    - Jump to question
    - Flag questions

### **5.1.6 Progress Tracking**
- Completed topics
- Weak areas
- Scores per subject
- Performance trends

### **5.1.7 Free vs Paid Access**
#### Free Tier:
- Access to:
    
    - 1 lesson only per day
        
    - 20 questions only per day for the CBT simulation
        

#### Paid Tier:
- Unlimited access

### **5.1.8 Payments**

#### Integration:

- Paystack via Convex functions

#### Flow:
1. User clicks “Upgrade”
2. Frontend calls Convex function
3. Convex interacts with Paystack
4. Payment verified
5. User access upgraded

---

## **5.2 Teacher Portal**

### **Access Control**

- Only whitelisted users
    

---

### **Features**

#### 5.2.1 Lesson Creation

- Select:
    
    - Subject
        
    - Section
        
    - Topic
        
- Add lesson content
    

---

#### 5.2.2 Question Upload (Per Lesson)**

- Add exactly 10 questions:
    
    - Question text
        
    - Options (A–D)
        
    - Correct answer
        
    - Explanation
        

---

#### 5.2.3 Editing**

- Update lessons
    
- Update questions
    

---

## **5.3 Question Upload Portal**

### **Purpose**

- Bulk upload of JAMB past questions
    

---

### **Features**

#### 5.3.1 Question Entry**

- Subject
    
- Year
    
- Question text
    
- Options
    
- Correct answer
    
- Explanation
    

---

#### 5.3.2 Bulk Upload (Optional Future Feature)**

- CSV/Excel upload
    

---

## **6. Database Design (High-Level)**

### **Entities**

#### Users

- id
    
- email
    
- role (student / teacher / uploader)
    
- subscription_status
    

---

#### Subjects

- id
    
- name
    

---

#### Sections

- id
    
- subject_id
    
- title
    

---

#### Topics

- id
    
- section_id
    
- title
    

---

#### Lessons

- id
    
- topic_id
    
- content
    
- created_by (teacher_id)
    

---

#### LessonQuestions

- id
    
- lesson_id
    
- question
    
- options
    
- correct_answer
    
- explanation
    

---

#### PastQuestions

- id
    
- subject
    
- year
    
- question
    
- options
    
- correct_answer
    
- explanation
    

---

#### Progress

- user_id
    
- topic_id
    
- status
    
- score
    

---

## **7. API Design (Convex Functions)**

### **Student APIs**

- getLessonTree()
    
- getLesson(topicId)
    
- submitLessonQuiz()
    
- getMockExam()
    
- submitMockExam()
    
- getProgress()
    

---

### **Teacher APIs**

- createLesson()
    
- addLessonQuestions()
    
- updateLesson()
    

---

### **Uploader APIs**

- addPastQuestion()
    
- bulkUploadQuestions()
    

---

### **Payment APIs**

- initializePayment()
    
- verifyPayment()
    

---

## **8. UX Principles**

- Simple, clean UI (students shouldn’t feel overwhelmed)
    
- Mobile-first (most users in Nigeria use phones)
    
- Fast loading (low bandwidth optimization)
    
- Gamified progression (progress bars, streaks)
    

---

## **9. Constraints & Rules**

- No direct DB access from frontend
    
- All sensitive operations handled via Convex
    
- Payment handled server-side only
    
- Strict access control for teacher/uploader portals
    

---

## **10. Future Enhancements**

- AI-generated explanations
    
- Personalized study plans
    
- Leaderboards
    
- Offline mode
    
- WAEC/NECO expansion
    

---

## **11. Risks**

- Content quality (teachers must be vetted properly)
    
- Payment friction
    
- User retention after initial signup
    

---

## **12. Execution Advice (Important)**

Don’t try to build everything at once. If you do, you’ll stall.

### **Phase 1 (MVP)**

- Auth
    
- Lesson tree (basic)
    
- Lesson + 10 questions
    
- Free vs paid limit
    
- Simple payment
    

### **Phase 2**

- CBT exam system
    
- Progress tracking
    

### **Phase 3**

- Teacher + uploader portals
    
- Scale content
    
