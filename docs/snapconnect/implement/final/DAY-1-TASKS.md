# 📅 Simplified Implementation Tasks

## **🎯 Goal: Event Join Flow + Photo Verification AI**

### **Morning Session: Event Join & Persistence**

#### **Task 1: Create Event Join Screen** 
```typescript
// app/join-event.tsx
```
- [ ] Simple event code input UI (accepts "SNAP24")
- [ ] Validation (show error if not "SNAP24")
- [ ] Loading state during join
- [ ] Save to AsyncStorage and navigate to main app

#### **Task 2: AsyncStorage Service** 
```typescript
// lib/storage.ts (new file)
```
- [ ] `saveEventContext(context)` - Save event + joined timestamp
- [ ] `getEventContext()` - Retrieve on app start
- [ ] `saveQuestCompletion(questId, data)` - Track completions
- [ ] `getQuestCompletions()` - Get all completions
- [ ] `getUserPoints()` - Calculate from completions

#### **Task 3: Update App Entry Point** 
```typescript
// app/_layout.tsx (root layout)
```
- [ ] Check AsyncStorage for event context on startup
- [ ] Redirect to join-event if no context
- [ ] Pass to protected routes (simple prop)

#### **Task 4: Enhance Welcome Screen** 
```typescript
// app/welcome.tsx (update existing)
```
- [ ] Add "Join Event" button
- [ ] Brief value prop text
- [ ] Navigate to join-event screen

---

### **Afternoon Session: Photo Verification AI**

#### **Task 5: Create Photo Verification Edge Function** 
```typescript
// supabase/functions/verify-quest-photo/index.ts (new)
```
- [ ] Set up new edge function
- [ ] Accept base64 photo + quest requirements
- [ ] Call OpenAI Vision API
- [ ] Return verified status + confidence

#### **Task 6: Update Quest Detail Screen**
```typescript
// app/(protected)/quest-detail.tsx
```
- [ ] Add camera capture for photo quests
- [ ] Convert photo to base64
- [ ] Call verification edge function
- [ ] Show "Verifying..." state
- [ ] Handle success (save completion) or retry

#### **Task 7: Create Quest Completion Flow**
```typescript
// components/quests/QuestCompletionCard.tsx (new)
```
- [ ] Success state UI (simple green card)
- [ ] Points earned display
- [ ] "Continue" button to quest list

---

### **Evening Session: Points & Progress Integration**

#### **Task 8: Update Points System** 
```typescript
// lib/api.ts (update getUserEventStats)
```
- [ ] Read completions from AsyncStorage
- [ ] Calculate real points from completions
- [ ] Merge with mock leaderboard data

#### **Task 9: Update Quest List** 
```typescript
// app/(protected)/(tabs)/quests.tsx
```
- [ ] Show completed quests with checkmark
- [ ] Disable already completed quests
- [ ] Update quest count from AsyncStorage

#### **Task 10: Test Full Flow** 
- [ ] Join event with "SNAP24"
- [ ] Complete a photo quest
- [ ] Verify points update
- [ ] Restart app - ensure persistence
- [ ] Check leaderboard shows your real points

---

## **📝 Simplified Code Templates**

### **Event Join Screen:**
```tsx
// app/join-event.tsx
export default function JoinEventScreen() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  
  const handleJoin = async () => {
    if (code !== 'SNAP24') {
      setError('Invalid event code');
      return;
    }
    
    await saveEventContext({
      ...DEMO_EVENT_CONTEXT,
      joinedAt: new Date().toISOString()
    });
    
    router.replace('/(protected)/(tabs)');
  };
  
  return (
    <SafeAreaView className="flex-1 p-4">
      <Text className="text-2xl font-bold mb-4">Join Event</Text>
      <Input 
        value={code} 
        onChangeText={setCode}
        placeholder="Enter event code"
      />
      {error && <Text className="text-red-500">{error}</Text>}
      <Button onPress={handleJoin}>Join Event</Button>
    </SafeAreaView>
  );
}
```

### **Photo Verification Call:**
```tsx
// In quest-detail.tsx
const verifyAndCompleteQuest = async (photoUri: string) => {
  setVerifying(true);
  
  try {
    // Convert to base64
    const base64 = await FileSystem.readAsStringAsync(photoUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Call edge function
    const { data, error } = await supabase.functions.invoke('verify-quest-photo', {
      body: {
        photoBase64: base64,
        questRequirements: quest.description
      }
    });
    
    console.log('Verification result:', data);
    
    if (data.verified) {
      // Save completion
      await saveQuestCompletion(quest.id, {
        photoUrl: photoUri,
        completedAt: new Date().toISOString(),
        pointsEarned: quest.points_reward
      });
      
      setCompleted(true);
    } else {
      Alert.alert('Try Again', 'Photo doesn\'t match quest requirements');
    }
  } finally {
    setVerifying(false);
  }
};
```

---

## **⚡ Key Simplifications from Original Plan**

1. ✅ **No AI recommendations** - Just photo verification
2. ✅ **Single event code** - "SNAP24" only
3. ✅ **Simple state** - AsyncStorage + local state
4. ✅ **Basic UI** - No complex animations
5. ✅ **Focused scope** - Core flow only

---

## **🎯 Success Metrics**

By end of implementation:
- ✅ Can join event with code "SNAP24"
- ✅ Can complete a photo quest with AI verification
- ✅ Points persist across app restarts
- ✅ Leaderboard shows real + mock data
- ✅ Clean, simple UI throughout

Ready to build! 🚀 