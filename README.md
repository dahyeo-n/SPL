<div align="center">
<h1>SPL (Study PLace, 스플)</h1>
<img width="300" alt="image" src="https://github.com/dahyeo-n/SPL/blob/main/public/images/default-profile.jpg">
</div>

## 목차
- [배포 주소](#배포-주소)
- [0. 프로젝트 소개](#0-프로젝트-소개)
- [1. Stacks 🐈](#1-stacks-)
- [2. 화면 구성](#2-화면-구성)
- [3. 주 기능](#3-주-기능)
- [4. 아키텍처](#4-아키텍처)


## 배포 주소

https://studyplace.vercel.app

## 0. 프로젝트 소개

> **집중 개발 기간: 2024. 3. 26 ~ 5. 1**
> (기능 추가 및 리팩토링은 매주 진행 중)

스플은 '**사용자의 니즈에 따른 카테고리로, 공부 장소를 추천해드리는 서비스**'입니다.

- [개발 계기] 외부에서 공부 혹은 작업할 때마다 노트북은 이용할 수 있는지, 조용한지 등 원하는 요소에 맞는 장소를 블로그와 장소 정보를 통해 일일이 알아봐야 함에 불편함을 느꼈습니다. 저와 같은 고민을 가진 분들의 문제를 해결하고, 서비스를 제공해드리고자 개발하였습니다.
- [제공하는 서비스] 카테고리별로 사용자 니즈에 맞는 공부 장소를 추천하고 있습니다.

## 1. Stacks 🐈

### Environment

![Visual Studio Code](https://img.shields.io/badge/Visual%20Studio%20Code-007ACC?style=for-the-badge&logo=Visual%20Studio%20Code&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=Git&logoColor=white)
![Github](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=GitHub&logoColor=white)

### Config

![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)

### Development

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=Javascript&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=Next.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### Server Asynchronous Communication
![Tanstack Query](https://img.shields.io/badge/Tanstack_Query-FF4000?style=for-the-badge&logo=tanstackquery&logoColor=white)

### Client State Management
![Zustand](https://img.shields.io/badge/Zustand-FACC2E?style=for-the-badge&logo=zustand&logoColor=white)

### Design

![Figma](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)

### Database

![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white)

### Document Organizer

![Notion](https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=Notion&logoColor=white)

---

## 2. 화면 구성

|        메인 페이지        |       디테일 페이지       |
| :-----------------------: | :-----------------------: |
| <img width="500" src="https://github.com/dahyeo-n/SPL/blob/main/public/images/main-page.png"/> | <img width="500" src="https://github.com/dahyeo-n/SPL/blob/main/public/images/detail-page.png"/> |
|        마이 페이지        |       로그인 페이지       |
| <img width="500" src="https://github.com/dahyeo-n/SPL/blob/main/public/images/my-page.png"/> | <img width="500" src="https://github.com/dahyeo-n/SPL/blob/main/public/images/login-page.png"/> |


## 3. 주 기능
![001](https://github.com/user-attachments/assets/c7a5820c-4b8f-4745-afcb-6c0d493bd911)
![002](https://github.com/user-attachments/assets/7c031ab0-fe77-43ed-9e4e-c330751d4834)
![003](https://github.com/user-attachments/assets/2055a792-b193-413c-8244-f8b547dc24e9)
![004](https://github.com/user-attachments/assets/3b099473-82ea-47df-ba84-4427c290d752)
![005](https://github.com/user-attachments/assets/eca0507f-6af3-4373-b878-23c7817d8849)

---

## 4. 아키텍처

### 디렉토리 구조

```bash
📦src
 ┣ 📂app
 ┃ ┣ 📂detail
 ┃ ┃ ┗ 📂[id]
 ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┣ 📂my
 ┃ ┃ ┣ 📜layout.tsx
 ┃ ┃ ┗ 📜page.tsx
 ┃ ┣ 📂sign
 ┃ ┃ ┣ 📂signin
 ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┣ 📂signup
 ┃ ┃ ┃ ┗ 📜page.tsx
 ┃ ┃ ┣ 📜EyeFilledIcon.jsx
 ┃ ┃ ┣ 📜EyeSlashFilledIcon.jsx
 ┃ ┃ ┗ 📜layout.tsx
 ┃ ┣ 📜globals.css
 ┃ ┣ 📜layout.tsx
 ┃ ┣ 📜page.tsx
 ┃ ┗ 📜provider.tsx
 ┣ 📂components
 ┃ ┣ 📂common
 ┃ ┃ ┣ 📜CustomDetailCard.jsx
 ┃ ┃ ┣ 📜CustomMainCard.jsx
 ┃ ┃ ┣ 📜EmblaCarousel.tsx
 ┃ ┃ ┣ 📜EmblaCarouselArrowButtons.tsx
 ┃ ┃ ┣ 📜EmblaCarouselDotButton.tsx
 ┃ ┃ ┣ 📜Footer.tsx
 ┃ ┃ ┣ 📜Header.tsx
 ┃ ┃ ┣ 📜Navbar.tsx
 ┃ ┃ ┣ 📜NotificationIcon.tsx
 ┃ ┃ ┣ 📜SearchIcon.tsx
 ┃ ┃ ┗ 📜SkeletonCard.tsx
 ┃ ┣ 📂css
 ┃ ┃ ┣ 📜base.css
 ┃ ┃ ┣ 📜embla.css
 ┃ ┃ ┗ 📜sandbox.css
 ┃ ┣ 📂theme
 ┃ ┃ ┗ 📜ThemeSwitcher.tsx
 ┃ ┣ 📜GithubLoginButton.tsx
 ┃ ┣ 📜GoogleLoginButton.tsx
 ┃ ┣ 📜KakaoLoginButton.tsx
 ┃ ┗ 📜Map.tsx
 ┣ 📂constants
 ┃ ┗ 📜errorCode.ts
 ┣ 📂hooks
 ┃ ┣ 📜useStudyPlaces.ts
 ┃ ┗ 📜useUserSession.ts
 ┗ 📜supabaseClient.ts
```

<div align="right">
  
[목차로 가기](#목차)

</div>
