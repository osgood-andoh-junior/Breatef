# Testing Checklist for https://breate.vercel.app/

## Test Credentials
- **Email**: osgoodandoh777@gmail.com
- **Password**: Hehasdoneit

---

## Test Scenarios

### 1. Login Test ✅
**Steps:**
1. Go to https://breate.vercel.app/
2. Click "Log In"
3. Enter credentials
4. Click "Login"

**Expected:**
- ✅ Login successful message appears
- ✅ Redirects to homepage after 1.5 seconds
- ✅ Homepage shows search bar (not login buttons)

**If Fails:**
- Check browser console (F12) for errors
- Check Network tab for `/users/login` request
- Verify response contains `access_token`

---

### 2. Homepage After Login ✅
**Steps:**
1. After successful login, you should be on homepage
2. Check if search bar is visible

**Expected:**
- ✅ Search bar visible
- ✅ "Search Users" heading visible
- ✅ No login/signup buttons visible

**If Fails:**
- Open DevTools → Application → Local Storage
- Check if `access_token` exists
- Check if `user` object exists
- If missing, login didn't complete properly

---

### 3. User Search Test ✅
**Steps:**
1. On homepage (after login)
2. Type a username in search box
3. Wait 300ms (debounce)

**Expected:**
- ✅ API call to `/discover/users?username=...`
- ✅ Results appear below search box
- ✅ Current user highlighted if found

**If Fails:**
- Check Network tab for `/discover/users` request
- Verify request includes Authorization header
- Check response status and data

---

### 4. Profile View Test ✅
**Steps:**
1. Search for a user
2. Click "View Profile" button
3. Profile page loads

**Expected:**
- ✅ Profile page shows user details
- ✅ Email, username, archetype, tier visible
- ✅ "Edit Profile" button if viewing own profile

**If Fails:**
- Check Network tab for `/profile/{username}` request
- Verify request includes Authorization header
- Check response status

---

### 5. Project Creation Test ✅
**Steps:**
1. Go to Collab Hub
2. Click "Post New Project"
3. Fill form and submit

**Expected:**
- ✅ Project appears immediately in list
- ✅ No page refresh needed
- ✅ Project persists after refresh

**If Fails:**
- Check Network tab for POST `/projects/` request
- Verify request includes Authorization header
- Check response status

---

## Common Issues & Quick Fixes

### Issue: Login works but homepage still shows login buttons
**Fix:** Check localStorage - user data might not be saved. Re-login.

### Issue: Search returns no results
**Fix:** Check if backend `/discover/users` endpoint is working. Test directly:
```javascript
fetch("https://breatebackend.onrender.com/api/v1/discover/users?username=test")
```

### Issue: 401 Unauthorized errors
**Fix:** Token expired or invalid. Re-login to get fresh token.

### Issue: CORS errors
**Fix:** Backend CORS not configured for `https://breate.vercel.app`. Update backend CORS settings.

---

## Browser Console Commands

### Check Login Status:
```javascript
console.log({
  token: localStorage.getItem("access_token"),
  user: JSON.parse(localStorage.getItem("user") || "null")
});
```

### Test API Connection:
```javascript
fetch("https://breatebackend.onrender.com/health")
  .then(r => r.json())
  .then(console.log);
```

### Test Login Endpoint:
```javascript
const formData = new URLSearchParams();
formData.append("username", "osgoodandoh777@gmail.com");
formData.append("password", "Hehasdoneit");

fetch("https://breatebackend.onrender.com/api/v1/users/login", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  credentials: "include",
  body: formData.toString(),
})
.then(r => r.json())
.then(console.log);
```

---

## What to Check

1. ✅ **Browser Console** - Any red errors?
2. ✅ **Network Tab** - Are API calls succeeding?
3. ✅ **Local Storage** - Token and user data saved?
4. ✅ **Backend Status** - Is backend running?
5. ✅ **CORS** - Any CORS errors in console?

---

**Please share:**
- What specific issue you're seeing
- Browser console errors (if any)
- Network tab screenshots of failed requests
- What happens vs. what should happen
