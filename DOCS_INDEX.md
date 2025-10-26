# Documentation Index

## Quick Navigation

### 📋 Start Here
- **[COMPLETION_SUMMARY.md](COMPLETION_SUMMARY.md)** - Overview of what was completed this session
- **[LATEST_UPDATES.md](LATEST_UPDATES.md)** - What's new and how to use it

### 📚 Reference Guides
- **[HOOKS_REFERENCE.md](HOOKS_REFERENCE.md)** - Complete API reference for all 8 hooks (USE THIS FOR DEVELOPMENT)
- **[API_INTEGRATION.md](API_INTEGRATION.md)** - API configuration and setup
- **[WEBSOCKET_INTEGRATION.md](WEBSOCKET_INTEGRATION.md)** - WebSocket setup and real-time features

### 📖 Usage Examples
- **[USAGE_EXAMPLES.md](USAGE_EXAMPLES.md)** - 7 practical code examples
- **[TROLLEY_CONTENTS.md](TROLLEY_CONTENTS.md)** - Complete trolley inventory API guide (5 practical examples)
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Technical implementation details

### 🔄 Migration & Updates
- **[MODELO_UPDATES.md](MODELO_UPDATES.md)** - Model updates and breaking changes
- **[IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md)** - Original completion report

---

## By Use Case

### I want to...

#### 🚀 Get Started Quickly
1. Read [COMPLETION_SUMMARY.md](COMPLETION_SUMMARY.md) - 5 min read
2. Check [LATEST_UPDATES.md](LATEST_UPDATES.md) - 10 min read
3. Look at examples in [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) - 15 min

#### 📖 Understand Hook APIs
1. Start with [HOOKS_REFERENCE.md](HOOKS_REFERENCE.md)
2. Find your hook (useTrolleyWebSocket, useDrawer, useSensorData, etc.)
3. Copy examples and adapt to your use case

#### 🔌 Integrate WebSocket
1. Read [WEBSOCKET_INTEGRATION.md](WEBSOCKET_INTEGRATION.md) - Architecture & flow
2. Look at `useTrolleyWebSocket` section in [HOOKS_REFERENCE.md](HOOKS_REFERENCE.md)
3. Use example from [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md)

#### 📊 Monitor Sensors
1. Read `useSensorData` section in [HOOKS_REFERENCE.md](HOOKS_REFERENCE.md)
2. Check usage examples for sensor monitoring
3. Implement your monitoring component

#### 🔲 Manage Drawers
1. Read `useDrawer` section in [HOOKS_REFERENCE.md](HOOKS_REFERENCE.md)
2. Use the drawer management examples
3. Integrate drawer selection UI

#### 📦 Verify Trolley Inventory
1. Read [TROLLEY_CONTENTS.md](TROLLEY_CONTENTS.md) - Complete guide
2. Use `useTrolleyContents` hook for state management
3. Check 5 practical examples included in the documentation

#### 🎯 Debug Issues
1. Check error handling section in [HOOKS_REFERENCE.md](HOOKS_REFERENCE.md)
2. Review the specific hook's error handling
3. Check WebSocket debugging in [WEBSOCKET_INTEGRATION.md](WEBSOCKET_INTEGRATION.md)

---

## Documentation Overview

### 📄 COMPLETION_SUMMARY.md
**When to read**: First thing - session overview
- What was completed this session
- Build status
- Integration architecture
- File summary
- Next steps
**Time**: 5-10 minutes

### 📄 LATEST_UPDATES.md
**When to read**: After completion summary
- New features overview
- Hook additions
- Integration flows
- Testing checklist
**Time**: 10-15 minutes

### 📄 HOOKS_REFERENCE.md ⭐ MOST IMPORTANT
**When to read**: When developing
- All 8 hooks documented
- Method signatures and returns
- Complete usage examples
- Data structures
- Best practices
- Common patterns
- Error handling
**Time**: Reference guide (use as needed)

### 📄 API_INTEGRATION.md
**When to read**: Setting up API
- Configuration
- Environment variables
- Hook usage basics
- Troubleshooting
**Time**: 10 minutes

### 📄 WEBSOCKET_INTEGRATION.md
**When to read**: Implementing WebSocket features
- Architecture overview
- Connection flow
- Message types
- Error handling
- Local testing guide
**Time**: 15 minutes

### 📄 USAGE_EXAMPLES.md
**When to read**: Need code examples
- 7 practical examples
- Common patterns
- Error handling examples
- Real-world use cases
**Time**: 20-30 minutes

### 📄 IMPLEMENTATION_COMPLETE.md
**When to read**: Full technical details
- Original implementation report
- 33 endpoints documented
- Service structure
- Troubleshooting guide
**Time**: Reference guide

### 📄 IMPLEMENTATION_SUMMARY.md
**When to read**: Need technical summary
- Project structure
- Features overview
- Endpoints list
- Next steps
**Time**: 15 minutes

### 📄 MODELO_UPDATES.md
**When to read**: Need migration info
- Model changes
- Breaking changes
- Migration guide
**Time**: 10 minutes

---

## File Structure Reference

```
hackmty-front/
├── src/
│   ├── hooks/
│   │   ├── useTrolleyWebSocket.ts    ✨ Enhanced
│   │   ├── useDrawer.ts              ⭐ NEW
│   │   ├── useSensorData.ts          ⭐ NEW
│   │   ├── useTrolleys.ts
│   │   ├── useItems.ts
│   │   ├── useLevels.ts
│   │   ├── useQRData.ts
│   │   └── useWebSocket.ts
│   ├── services/
│   │   ├── drawer.service.ts         (Uses API v1)
│   │   ├── sensor-data.service.ts    (Uses API v1)
│   │   ├── trolley.service.ts
│   │   ├── item.service.ts
│   │   ├── level.service.ts
│   │   └── qr-data.service.ts
│   ├── types/
│   │   └── api.ts                    (TypeScript types)
│   ├── lib/
│   │   └── api-client.ts             (HTTP client)
│   └── components/
│       └── trolley-manager.tsx
│
├── docs/
│   ├── DOCS_INDEX.md                 ← YOU ARE HERE
│   ├── COMPLETION_SUMMARY.md         ✨ Session summary
│   ├── LATEST_UPDATES.md             ✨ What's new
│   ├── HOOKS_REFERENCE.md            ⭐ Main reference
│   ├── API_INTEGRATION.md
│   ├── WEBSOCKET_INTEGRATION.md
│   ├── USAGE_EXAMPLES.md
│   ├── IMPLEMENTATION_COMPLETE.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   └── MODELO_UPDATES.md
│
└── README.md
```

---

## Search Guide

### If you need to find...

**A specific hook**
→ [HOOKS_REFERENCE.md](HOOKS_REFERENCE.md) - Ctrl+F hook name

**API endpoint information**
→ [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md) - Lists all 33 endpoints

**Code examples**
→ [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) - 7 practical examples

**Error handling**
→ [HOOKS_REFERENCE.md](HOOKS_REFERENCE.md) - Error handling section

**WebSocket details**
→ [WEBSOCKET_INTEGRATION.md](WEBSOCKET_INTEGRATION.md)

**Setup instructions**
→ [API_INTEGRATION.md](API_INTEGRATION.md)

**Breaking changes**
→ [MODELO_UPDATES.md](MODELO_UPDATES.md)

**Current status**
→ [COMPLETION_SUMMARY.md](COMPLETION_SUMMARY.md)

---

## Quick Links

### Development Resources
- [HOOKS_REFERENCE.md - useTrolleyWebSocket](HOOKS_REFERENCE.md#1-usetrolleywebsocket)
- [HOOKS_REFERENCE.md - useDrawer](HOOKS_REFERENCE.md#6-usedrawer--new)
- [HOOKS_REFERENCE.md - useSensorData](HOOKS_REFERENCE.md#7-usesensordata--new)

### Examples
- [USAGE_EXAMPLES.md - Complete Examples](USAGE_EXAMPLES.md)
- [HOOKS_REFERENCE.md - Usage Examples](HOOKS_REFERENCE.md#usage-examples)

### Integration Details
- [WEBSOCKET_INTEGRATION.md - WebSocket Flow](WEBSOCKET_INTEGRATION.md#flujo-completo-de-ejemplo)
- [API_INTEGRATION.md - API Setup](API_INTEGRATION.md)

### Troubleshooting
- [WEBSOCKET_INTEGRATION.md - Troubleshooting](WEBSOCKET_INTEGRATION.md#troubleshooting)
- [IMPLEMENTATION_COMPLETE.md - Troubleshooting](IMPLEMENTATION_COMPLETE.md#troubleshooting-rápido)

---

## Sessions

### This Session (Session 2)
**Date**: 2025-10-26
**Focus**: WebSocket Enhancement + New Hooks
**Changes**:
- Fixed missing `handleQRDataTrolleys()` function
- Created `useDrawer` hook
- Created `useSensorData` hook
- Added comprehensive documentation

**Docs**:
- [COMPLETION_SUMMARY.md](COMPLETION_SUMMARY.md)
- [LATEST_UPDATES.md](LATEST_UPDATES.md)
- [HOOKS_REFERENCE.md](HOOKS_REFERENCE.md)

### Previous Sessions
**Session 1**: Initial API integration (33 endpoints, 4 services, 4 hooks)
- See [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md)

---

## Tips for Success

1. **Start with COMPLETION_SUMMARY.md** - Understand what changed
2. **Keep HOOKS_REFERENCE.md open** - Use as IDE reference
3. **Check examples first** - Copy and adapt from USAGE_EXAMPLES.md
4. **Use TypeScript** - Full type safety available
5. **Check error messages** - Hooks provide detailed error info
6. **Read inline comments** - Code is well-documented

---

## Questions Answered Here

**Q: How do I use the new hooks?**
A: See [HOOKS_REFERENCE.md](HOOKS_REFERENCE.md)

**Q: What changed this session?**
A: See [COMPLETION_SUMMARY.md](COMPLETION_SUMMARY.md)

**Q: How do I handle WebSocket?**
A: See [WEBSOCKET_INTEGRATION.md](WEBSOCKET_INTEGRATION.md)

**Q: What are the endpoints?**
A: See [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md)

**Q: Need code examples?**
A: See [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md)

**Q: How to set up the API?**
A: See [API_INTEGRATION.md](API_INTEGRATION.md)

**Q: How are models structured?**
A: See [MODELO_UPDATES.md](MODELO_UPDATES.md)

---

**Last Updated**: 2025-10-26
**Version**: 2.0.0
**Status**: ✅ Complete and Production Ready
