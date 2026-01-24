# Reading Test - Vaqt Tugamasidan Avval O'zidan-O'zi Chiqib Ketish Muammosi Tahlili

## 🔍 Muammo Tavsifi

Reading test ochilganda, vaqt tugamasidan oldin ba'zi userlarda testdan o'zidan-o'zi chiqib ketish holati kuzatilmoqda. Bu holat har doim emas, faqat ba'zi userlarda yuz bermoqda.

---

## 🎯 Muammo Sabablari (Root Causes)

### 1. **Timer Tugaganda Ikkita Navigation Ketma-ketligi** ⚠️ **ASOSIY MUAMMO**

**Joy:** `useTestLogic.ts:72-88`

```typescript
// Vaqt tugaganda avtomatik submit qilish
if (secondsLeft <= 0 && !isTestFinished && !hasSubmittedRef.current) {
  clearTimer();
  hasSubmittedRef.current = true;
  setIsTestFinished(true);
  toastService.error("The time limit has expired.");
  onSubmit(); // 1. Submit qiladi
  if (onFinish) {
    setTimeout(() => {
      onFinish(); // 2. finish() ni chaqiradi - BU NAVIGATION QILADI
    }, 100);
  }
}
```

**Muammo:**
- Timer tugaganda `onFinish()` chaqiriladi
- `onFinish()` = `finish()` = `navigate()` - Testdan chiqib ketadi
- Lekin mutation hali muvaffaqiyatli bo'lmagan bo'lishi mumkin
- Agar mutation onSuccess ham `finish()` ni chaqirsa, ikkita navigation bo'lishi mumkin

---

### 2. **usePreventPageLeave - Timer Tugaganda Bloklash O'chadi** ⚠️

**Joy:** `usePreventPageLeave.ts:73-81`

```typescript
const shouldBlockPage = useCallback((): boolean => {
  if (!isStudent || !shouldBlock) return false;
  
  const timerRunning = checkTimerRunning(); // timeLeft > 0 tekshiradi
  
  // Block if timer is running or if shouldBlock is true (test started)
  return timerRunning || shouldBlock;
}, [isStudent, shouldBlock, timeLeft]);
```

**Muammo:**
- `checkTimerRunning()` - `timeLeft > 0` tekshiradi
- Timer tugaganda `timeLeft = 0` bo'ladi
- `timerRunning = false` bo'ladi
- `shouldBlockPage` = `shouldBlock` qaytaradi
- Lekin `shouldBlock = !isTestFinished` 
- Agar `isTestFinished` bir lahzada `true` bo'lsa, `shouldBlock = false` bo'ladi
- Navigation bloklanmaydi va `finish()` navigation'ga ruxsat beradi

---

### 3. **useAutoLogout - Visibility/Blur Eventlar** ⚠️

**Joy:** `useAutoLogout.ts:83-119`

```typescript
const handleVisibilityChange = () => {
  if (document.hidden) {
    if (visibilityTimeout > 0) {
      visibilityTimer = setTimeout(() => {
        performLogout("tab hidden timeout"); // Logout qiladi
      }, visibilityTimeout);
    }
  }
};

const handleWindowBlur = () => {
  if (blurTimeout > 0) {
    blurTimer = setTimeout(() => {
      performLogout("window blur timeout"); // Logout qiladi
    }, blurTimeout);
  }
};
```

**Muammo:**
- `excludeTestPages` tekshiradi, lekin dependency array'da `location.pathname` bor
- Agar `location.pathname` o'zgarsa (masalan, navigation bo'lganda), effect qayta ishlaydi
- Test davomida user tab yashirsa yoki focus yo'qotsa, timeout boshlanadi
- Agar timer tugaganda ham visibility/blur event trigger bo'lsa, logout bo'lishi mumkin

---

### 4. **Reading Mutation onSuccess - Ikkinchi Navigation** ⚠️

**Joy:** `useReadingForm.ts:74-79`

```typescript
const readingMutation = useMutation({
  mutationFn: (data: AnswerPayload) => postReadingAnswers(id, data),
  onSuccess: (res) => {
    toastService.success("Successfully submitted!");
    handleNextStep(res); // finish() ni chaqiradi agar is_view !== true
  },
});
```

**Muammo:**
- Timer tugaganda `onSubmit()` chaqiriladi
- `onSubmit()` → mutation → `onSuccess` → `handleNextStep()` → `finish()` → `navigate()`
- Lekin `useTestLogic` ham `onFinish()` ni chaqirgan bo'ladi
- Ikki navigation bir vaqtda bo'lishi mumkin

---

### 5. **Race Condition - Timer va Mutation** ⚠️

**Muammo:**
- Timer tugaganda `onSubmit()` chaqiriladi (async)
- `onFinish()` 100ms kechikish bilan chaqiriladi
- Mutation hali muvaffaqiyatli bo'lmagan bo'lishi mumkin
- Lekin `onFinish()` navigation qiladi
- Keyin mutation muvaffaqiyatli bo'lsa, `onSuccess` ham `finish()` ni chaqiradi
- Ikki navigation conflict qilishi mumkin

---

## 🔧 Yechimlar

### Yechim 1: Timer Tugaganda Faqat Submit, Navigation Yo'q ❌ **REKOMENDATSIYA**

**O'zgartirish:** `useTestLogic.ts`

```typescript
// Vaqt tugaganda faqat submit qilish, finish() ni chaqirmaslik
if (secondsLeft <= 0 && !isTestFinished && !hasSubmittedRef.current) {
  clearTimer();
  hasSubmittedRef.current = true;
  setIsTestFinished(true);
  toastService.error("The time limit has expired.");
  onSubmit(); // Faqat submit qilish
  // onFinish() ni o'chirish - mutation onSuccess da finish() chaqiriladi
}
```

**Fayl:** `src/features/exams/hooks/useTestLogic.ts:72-88`

---

### Yechim 2: usePreventPageLeave - Test Tugaguncha Bloklashni Davom Ettirish ✅ **MUHIM**

**O'zgartirish:** `usePreventPageLeave.ts`

```typescript
const shouldBlockPage = useCallback((): boolean => {
  if (!isStudent || !shouldBlock) return false;
  
  // Test tugaguncha bloklashni davom ettirish
  // Timer tugaganda ham shouldBlock true bo'lsa, bloklash davom etsin
  // Faqat mutation muvaffaqiyatli bo'lgandan keyin bloklashni o'chirish
  return shouldBlock; // timerRunning tekshiruvini o'chirish yoki qo'shimcha shart qo'shish
}, [isStudent, shouldBlock]);
```

**Fayl:** `src/features/exams/hooks/usePreventPageLeave.ts:73-81`

---

### Yechim 3: useAutoLogout - Test Tugaguncha Timer'ni Bloklash ✅ **MUHIM**

**O'zgartirish:** `useAutoLogout.ts`

```typescript
useEffect(() => {
  // ... existing code ...
  
  // Test sahifada bo'lganda timer'larni bloklash
  if (excludeTestPages) {
    const isTestPage = location.pathname.includes('/exams/') || 
                       location.pathname.includes('/listenings/') ||
                       location.pathname.includes('/readings/') ||
                       location.pathname.includes('/writings/') ||
                       location.pathname.includes('/speakings/');
    
    if (isTestPage && user?.role === Role.STUDENT) {
      console.log("Auto logout disabled during test");
      
      // Cleanup: barcha timer'larni tozalash
      if (visibilityTimer) {
        clearTimeout(visibilityTimer);
        visibilityTimer = null;
      }
      if (blurTimer) {
        clearTimeout(blurTimer);
        blurTimer = null;
      }
      
      return; // Event listener'larni qo'shmasdan chiqish
    }
  }
  
  // ... existing event listeners ...
}, [/* dependencies - location.pathname ni o'chirish yoki test tugaganda bloklash */]);
```

**Fayl:** `src/hooks/useAutoLogout.ts:44-56`

---

### Yechim 4: Mutation onSuccess - Faqat Bir Marta finish() Chaqirish ✅

**O'zgartirish:** `useReadingForm.ts`

```typescript
const finishCalledRef = useRef(false);

const finish = () => {
  if (finishCalledRef.current) return; // Faqat bir marta chaqirish
  finishCalledRef.current = true;
  
  // ... existing finish logic ...
};

const handleNextStep = (res: object) => {
  if (test_type === "Thematic") {
    onNext?.({ ...res, material, finish });
  } else {
    if (user?.role === Role.TEACHER) {
      onNext?.({ ...res, material, finish });
    } else {
      if (is_view === true) {
        onNext?.({ ...res, material });
      } else {
        finish(); // Faqat bir marta chaqiriladi
      }
    }
  }
};
```

**Fayl:** `src/features/exams/hooks/useReadingForm.ts:33-72`

---

## 🎯 Eng Muhim Yechimlar

### 1. **useTestLogic.ts - Timer Tugaganda onFinish() ni O'chirish** ⭐⭐⭐

Timer tugaganda faqat `onSubmit()` chaqirish, `onFinish()` ni chaqirmaslik. Mutation `onSuccess` da `finish()` chaqiriladi.

### 2. **usePreventPageLeave.ts - shouldBlockPage Logikasini Yaxshilash** ⭐⭐⭐

Timer tugaganda ham `shouldBlock` true bo'lsa, navigation bloklash davom etsin. Faqat mutation muvaffaqiyatli bo'lgandan keyin bloklashni o'chirish.

### 3. **useAutoLogout.ts - Test Sahifada Timer'larni Bloklash** ⭐⭐

Test sahifada bo'lganda visibility/blur timer'larni to'liq bloklash va cleanup qilish.

---

## 📝 Debugging uchun Qo'shimcha Logging

```typescript
// useTestLogic.ts
console.log('Timer expired:', { secondsLeft, isTestFinished, hasSubmittedRef: hasSubmittedRef.current });

// useReadingForm.ts
console.log('finish() called:', { finishCalledRef: finishCalledRef.current, pathname: location.pathname });

// usePreventPageLeave.ts
console.log('shouldBlockPage:', { shouldBlock, timerRunning: checkTimerRunning(), isStudent });
```

---

## 🔍 Test Qilish

1. Reading test ochish
2. Timer tugashini kuzatish (dev tools'da timeLeft ni o'zgartirish)
3. Navigation'ni kuzatish (Network tab'da)
4. Console log'larni kuzatish
5. User'lardan feedback olish

---

## ⚠️ Ehtimoliy Muammolar

1. **Race Condition** - Timer va mutation bir vaqtda ishlashi
2. **Multiple Navigation** - Bir nechta `finish()` chaqirilishi
3. **Auto Logout** - Visibility/blur eventlar test davomida trigger bo'lishi
4. **Browser Back Button** - History manipulation muammolari
