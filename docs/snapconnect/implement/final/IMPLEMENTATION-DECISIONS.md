# 🎯 Implementation Decisions & Clarifications

## **Overview**
This document captures all technical decisions made to simplify the SnapConnect demo implementation while maintaining a compelling user experience.

---

## **1. Event Join Architecture**

### Decision: Single Event, Simple Code
- **Event Code**: `SNAP24` (hardcoded)
- **Behavior**: One event at a time only
- **Persistence**: Yes, event context and game progress persist across app sessions

### Implementation:
```typescript
// Simple event join
const DEMO_EVENT_CODE = 'SNAP24';

// Store in AsyncStorage
await AsyncStorage.setItem('eventContext', JSON.stringify({
  ...DEMO_EVENT_CONTEXT,
  joinedAt: new Date().toISOString()
}));
```

---

## **2. Data Strategy**

### Decision: Hybrid Mock/Real Approach
- **Mock Data**:
  - Other users on leaderboard
  - Initial quest list
  - Other users' activities
  
- **Real Data**:
  - Your quest completions
  - Your points earned  
  - Your photos taken
  - Your progress

### Storage:
- Quest completions stored in AsyncStorage
- Points calculated from real completions + mock base

---

## **3. AI Integration**

### Decision: Focus Only on Photo Verification
- **Skip**: Proactive quest recommendations
- **Skip**: AI-powered user suggestions
- **Skip**: Artificial delays
- **Implement**: AI photo verification for quest completion

### Rationale:
- Reduces complexity
- Shows concrete AI value
- Low latency experience

---

## **4. State Management**

### Decision: Simple AsyncStorage + Local State
- **No Context API** (unnecessary for single event)
- **No Redux/Zustand** (overkill for demo)
- **AsyncStorage for**:
  - Event context
  - Quest completions
  - User points/progress
- **Local state for**:
  - UI states
  - Temporary data

### Flow:
```typescript
// App startup (_layout.tsx)
const eventContext = await AsyncStorage.getItem('eventContext');
if (!eventContext) {
  // Redirect to join-event screen
} else {
  // Continue to main app
}
```

---

## **5. UI/Animation Approach**

### Decision: Simple & Functional
- **Use existing shadcn components**
- **Skip complex animations** (no confetti, no Lottie)
- **Simple success states**:
  - Checkmark for completion
  - Basic fade transitions
  - Native loading spinners

### Example:
```tsx
// Simple success state
{questCompleted && (
  <View className="bg-green-500 p-4 rounded-lg">
    <Text>Quest Completed! ✓</Text>
    <Text>+{quest.points_reward} points</Text>
  </View>
)}
```

---

## **6. Photo Verification Architecture**

### Decision: Separate Edge Function
- **New function**: `verify-quest-photo`
- **Triggered by**: "Take Photo" button on quest detail
- **Returns**: Verification result with confidence

### Implementation:
```typescript
// supabase/functions/verify-quest-photo/index.ts
export async function verifyQuestPhoto(req: Request) {
  const { photoBase64, questRequirements } = await req.json();
  
  // Call OpenAI Vision API
  const result = await callOpenAIVision(photoBase64, questRequirements);
  
  // Return structured response
  return {
    verified: boolean,
    confidence: number, // 0-1, logged to console
    reason: string
  };
}
```

### Client Integration:
```typescript
// In quest-detail.tsx
const handlePhotoCapture = async (photoUri: string) => {
  setVerifying(true);
  
  const { data } = await supabase.functions.invoke('verify-quest-photo', {
    body: { photoBase64, questRequirements: quest.description }
  });
  
  console.log('AI Confidence:', data.confidence); // For debugging
  
  if (data.verified) {
    await completeQuest(quest.id, { photoUrl: photoUri });
    // Show success UI
  } else {
    // Show retry option
  }
};
```

---

## **📋 Simplified Implementation Priorities**

### Must Have:
1. ✅ Event join with code `SNAP24`
2. ✅ Persist event/progress in AsyncStorage
3. ✅ Photo capture → AI verification → Quest completion
4. ✅ Real points tracking merged with mock leaderboard
5. ✅ Simple, clean UI with existing components

### Nice to Have (if time):
1. ⏳ Multiple demo event codes
2. ⏳ Animated transitions
3. ⏳ AI chat improvements

### Explicitly Skipping:
1. ❌ Complex animations
2. ❌ AI recommendations
3. ❌ Multiple simultaneous events
4. ❌ Real-time updates
5. ❌ Production-grade error handling

---

## **🚀 Development Approach**

1. **Start Simple**: Get basic flow working end-to-end
2. **Test Often**: Each feature should work in isolation
3. **Console Logging**: Liberal use for demo purposes
4. **Mock Smartly**: Only mock what we're not demonstrating
5. **Polish Later**: Function over form initially

---

## **📝 Key Technical Notes**

- **Photo Conversion**: Use expo-file-system for base64 conversion
- **AsyncStorage Keys**:
  - `eventContext`: Current event info
  - `questCompletions`: Array of completed quest IDs
  - `userPoints`: Total points earned
- **Mock User ID**: Use consistent ID for demo user
- **Error States**: Simple alert() for demo

This approach balances demo impressiveness with implementation simplicity! 