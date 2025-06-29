# 📅 Implementation Tasks

## **🎯 Goal: Event Join Flow + AI Integration**

### **Morning Session : Event Join Flow**

#### **Task 1: Create Event Join Screen** 
```typescript
// app/join-event.tsx
```
- [ ] Event code input UI (6-digit codes)
- [ ] Validation and error states
- [ ] Loading state during join
- [ ] Success transition to main app

#### **Task 2: Event Storage Service** 
```typescript
// lib/storage.ts (new file)
```
- [ ] `saveEventContext(context)` - Save to AsyncStorage
- [ ] `getEventContext()` - Retrieve on app start
- [ ] `clearEventContext()` - For leaving events
- [ ] `updateEventContext(updates)` - Partial updates

#### **Task 3: Update App Entry Point** 
```typescript
// app/_layout.tsx (root layout)
```
- [ ] Check for saved event context on startup
- [ ] Redirect to join-event if no context
- [ ] Pass context to protected routes

#### **Task 4: Welcome Flow Polish** 
```typescript
// app/welcome.tsx (enhance existing)
```
- [ ] Add "Join Event" button
- [ ] Value prop messaging
- [ ] Smooth transition to join-event

---

### **Afternoon Session: AI Integration Throughout**

#### **Task 5: AI Quest Recommendations** 
```typescript
// components/quests/AIQuestRecommendations.tsx (new)
```
- [ ] "Recommended for You" section
- [ ] Based on completed quests + activity
- [ ] 2-3 suggested quests with AI reasoning

```typescript
// Update app/(protected)/(tabs)/quests.tsx
```
- [ ] Add AI recommendations at top
- [ ] Show why quest is recommended

#### **Task 6: AI in Discovery Feed** 
```typescript
// components/feed/AISimilarPosts.tsx (new)
```
- [ ] "People posting similar content" section
- [ ] Interest-based grouping

```typescript
// Update lib/api.ts
```
- [ ] Add `getAIRecommendedPosts()`
- [ ] Mock AI-curated content

#### **Task 7: AI Photo Verification UI**
```typescript
// components/quests/AIVerificationStatus.tsx (new)
```
- [ ] "AI Verifying..." animation
- [ ] Confidence score display
- [ ] Success/retry states

```typescript
// Update app/(protected)/quest-detail.tsx
```
- [ ] Integrate AI verification flow
- [ ] Show verification in progress

#### **Task 8: Quick AI Touch Points** 
```typescript
// components/ui/AIBadge.tsx (new)
```
- [ ] Small "AI Recommended" badge
- [ ] Use throughout app where AI is involved

---

### **Evening Session : Integration & Testing**

#### **Task 9: Connect Event Join to App** 
- [ ] Test full flow: Welcome → Join → Main App
- [ ] Ensure event context updates all tabs
- [ ] Verify context persistence works

#### **Task 10: Test AI Features** 
- [ ] Verify all AI touchpoints work
- [ ] Check loading states
- [ ] Ensure graceful fallbacks

---

## **📝 Code Snippets to Get Started**

### **Event Join Screen Structure:**
```tsx
// app/join-event.tsx
export default function JoinEventScreen() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleJoin = async () => {
    // Validate code
    // Save to storage
    // Navigate to main app
  };
  
  return (
    <SafeAreaView>
      <Text>Enter Event Code</Text>
      <TextInput value={code} onChangeText={setCode} />
      <Button onPress={handleJoin} loading={loading} />
    </SafeAreaView>
  );
}
```

### **AI Recommendations Component:**
```tsx
// components/quests/AIQuestRecommendations.tsx
export function AIQuestRecommendations({ quests, userActivity }) {
  const recommendations = useMemo(() => {
    // Mock AI logic for now
    return quests.slice(0, 3).map(quest => ({
      ...quest,
      aiReason: "Based on your interest in photography"
    }));
  }, [quests, userActivity]);
  
  return (
    <View>
      <Text>Recommended for You 🤖</Text>
      {recommendations.map(quest => (
        <QuestCard key={quest.id} quest={quest} showAIBadge />
      ))}
    </View>
  );
}
```

---

## **⚡ Pro Tips for Day 1**

1. **Start with Event Join** - It's the missing critical piece
2. **Keep AI Simple** - Mock the intelligence, focus on UI
3. **Test Frequently** - Each feature should work in isolation
4. **Commit Often** - Small, working increments
5. **Don't Over-Engineer** - Demo quality, not production

---

## **🎯 Day 1 Success Metrics**

By end of Day 1, you should have:
- ✅ Working event join flow with persistence
- ✅ AI visible in at least 3 places
- ✅ Smooth app startup with event context
- ✅ All changes integrated and tested

Ready? Let's build! 🚀 