# CHANGELOG — SI-POTA Mobile (SV UGM)

Semua perubahan signifikan pada aplikasi mobile didokumentasikan di sini. File ini
di-generate otomatis oleh [git-cliff](https://github.com/orhun/git-cliff) dari Conventional Commits.
Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.0.0/) dan
penomoran versi mengikuti [SemVer](https://semver.org/lang/id/).

---
## [1.0.0] — 2026-11-26


### ♻️ Refactor

- **ui:** Modularize monolithic App.tsx into dedicated screens and components (fase 1)


### ⚡ Performa & Rendering

- **mobile-motion:** Native-driver Splash progress, fix ProfileSheet double-close, add screen transitions
- **mobile-render:** Memoize core components, use granular Zustand selectors and stable callbacks
- **mobile-lists:** Virtualize AuditLogs, Alarms, Devices, and Users lists with FlatList


### ✅ Pengujian

- **setup:** Configure Jest, test scripts, and extract pure tank metrics utility (fase 1)
- **suite:** Add unit test suites for tank metrics and env configurations (fase 2)


### ✨ Fitur Baru

- Scaffold react native expo with zustand
- Build mobile dashboard UI connecting to web BFF
- **ui:** Implement mobile sliding drawer and custom header based on figma design
- **mobile:** Apply post-upgrade adjustments for safe-area, env config, and app metadata
- **mobile:** Integrate live VPS backend with auth flow and dynamic tank telemetry
- **ui:** Implement type safety, interactive navigation, and PRD placeholder screens (fase 2)
- **auth:** Eliminate transition glitches, streamline splash-to-login flow, and refine profile actions
- **tanks:** Implement quick threshold management
- **alerts:** Implement emergency alerts and resolution
- **reports:** Implement historical water level trends
- **audit:** Implement activity timeline
- **devices:** Implement F-05 connectivity status and LoRa signal screen
- **users:** Implement F-07 operator accounts management and emergency reset screen
- **mobile-ws:** Attach JWT token query, stop loop on 1008, and handle LEVEL_UPDATE/NODE_STATUS
- **mobile-theme:** Add shared RSA UGM design tokens and install @expo/vector-icons
- **mobile-motion:** Add MOTION tokens, useReducedMotion, ScreenTransition, and AnimatedPressable
- **mobile-ux:** Add native-driver SkeletonList loader across data screens
- **mobile-motion:** Animate TankCard water level, Reports sparkline, and EmergencyAlertBanner entrance
- **dashboard:** Revamp dashboard UI to match design.md and update location to Sekolah Vokasi UGM (DTEDI, DLIKES, DTK)
- **mobile:** Integrate @expo/vector-icons Ionicons and eliminate emojis on dashboard
- **mobile:** Replace remaining emojis in HomeScreen and Sidebar with Ionicons
- **mobile:** Eliminate emojis on LoginScreen and use Ionicons with SV UGM branding
- **mobile:** Remove emojis from SplashScreen and ProfileScreen and use Ionicons


### 🎨 UI / UX & Desain

- **ui:** Refine clean light theme, severity auto-sort, and UX ergonomics (fase 3)
- **mobile:** Replace water drop icon with official UGM emblem
- **mobile:** Enlarge UGM emblem fit and update favicon to UGM emblem
- **mobile-nav:** Unify Sidebar, Header, and AlertBanner with vector icons and Web palette
- **mobile-auth:** Renovate LoginScreen and SplashScreen with Feather icons and Web tokens
- **mobile-home:** Add EmptyState/ErrorBanner and renovate HomeScreen, TankCard, MetricsOverview
- **mobile-screens:** Standardize operational screens with Feather icons, EmptyState/ErrorBanner, and Web tokens
- **mobile-nav:** Remove redundant back-to-dashboard footer buttons and add Android hardware back handler
- **dashboard:** Refine color tokens, app bar typography, and SV UGM 4-tank layout according to latest design.md
- **mobile-brand:** Update institution branding from RSA UGM to Sekolah Vokasi UGM (SV UGM)


### 📝 Dokumentasi

- Add API contract and scaffolding roadmap
- Add local network testing instructions for team
- Update comprehensive README for users and developers
- **mobile:** Sync README and PRD specifications with Expo SDK 58 and PRD-MFE
- **mobile:** Update .env.example with Tailscale and production deployment notes
- **env:** Simplify env configuration and update developer onboarding guide in README
- **sync:** Synchronize README, PRD-Mobile, and PRD-MFE with current tech stack and multi-stage CI
- Sync PRD-Mobile, PRD-MFE and README with core backend contract
- Sync PRD-MFE platform matrix with root documentation repo
- Sync PRD-MFE platform matrix with latest SV pilot coordinates and map features from PR #48
- Sync PRD-MFE platform matrix with latest Web PR #49
- **mobile:** Sync PRD-MFE, PRD-Mobile, and README with latest UI/UX and motion upgrades


### 📦 Internal & CI

- **deps:** Upgrade dependencies to Expo SDK 58 and React Native 0.88
- **pipeline:** Implement multi-stage GitHub Actions workflow (fase 3)
- **deps:** Align expo sdk patch version
- **deps:** Align expo sdk patch versions
- **deps:** Align expo sdk 58 patch versions for expo-doctor
- **deps:** Upgrade axios 1.21.1, zustand 5.1.0, @types/react and fix critical/high audit
- **ci:** Consolidate mobile CI into single-install pipeline without redundancy
- **mobile-cleanup:** Remove unused PlaceholderScreen, polish App headers, and add expo-font peer
- **ci:** Upgrade CI runner to Node.js 22 LTS
- **deps:** Add expo-font peer dependency for @expo/vector-icons and expo-doctor
- **release:** Add git-cliff auto-versioning, changelog, and release workflow for protected branches


### 🛠️ Perbaikan Bug

- **mobile:** Align data consumption strictly through Web BFF and SecureStore per PRD-Mobile
- **mobile:** Update default BFF_URL to laptop Tailscale IP for mobile device access
- **ui:** Eliminate Android elevation shadow artifacts during auth transitions
- **ui:** Eliminate layout shifts using layered cross-dissolve and unified status bar
- **mobile-api:** Map ReadingRange to hours/limit query and trigger auto-logout on 401
- **mobile-types:** Align AuditLog detail/ipAddress and Tank calibration fields with backend
- **mobile-rbac:** Align Sidebar, AuditLogs, and Alarms role guards with Core BE
- **mobile-splash:** Ensure SplashScreen is visible on initial frame and extend display duration to ~2.1s

