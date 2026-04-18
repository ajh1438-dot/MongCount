# 12. 딥리서치 근거 카드 (Evidence Cards)

> **프로젝트**: MongCount2
> **목적**: Socrates 이전에 읽는 깊은 기초자료집
> **작성일**: 2026-04-18
> **방법론**: Tavily source pack + claude-peers 병렬 조사 + 기존 기획 문서 통합
> **범위**: 우선순위 비교군 10개 심층 카드
> **주의**: 이 문서는 단순 추천이 아니라, 제품 설계에 직접 쓰기 위한 근거 중심 분석 문서다.

---

## 1. 이번 문서의 성격

이 문서는 "어떤 앱이 좋다"를 정리하는 문서가 아니다.  
MongCount2를 설계하기 위해, 각 앱이 실제로 **어떤 문제를 어떤 UX로 해결하고, 왜 사람들에게 먹히거나 안 먹히는지**를 파고드는 기초자료다.

즉, 각 앱을 아래 기준으로 본다.

1. **공식 주장**: 앱이 스스로를 어떻게 설명하는가
2. **사용자 체감**: 사용자 리뷰와 커뮤니티 반응에서 반복되는 패턴은 무엇인가
3. **제3자 해석**: 리뷰 매체/연구/분석가가 본 구조적 장단점은 무엇인가
4. **MongCount2 시사점**: 무엇을 가져가고 무엇을 피해야 하는가

---

## 2. 방법론

### 2.1 소스 팩 구조
앱별로 가능한 한 아래 소스를 교차검증했다.

- **공식**: 공식 사이트, 앱 설명, 도움말, 창업자/기관 페이지
- **스토어**: App Store, Google Play 평점·리뷰·릴리즈 노트
- **커뮤니티**: Reddit 등 사용자 토론
- **리뷰 매체**: Lifehacker, ChoosingTherapy, TechRadar 등
- **연구/기관**: PMC, Yale 등
- **영상/인터뷰**: YouTube 리뷰, 데모, 인터뷰

### 2.2 근거 해석 규칙
- 스토어 리뷰와 공식 설명을 **1차 근거**로 둔다.
- Reddit/커뮤니티는 **반복되는 패턴 확인용**으로 쓴다.
- 리뷰 매체는 **구조적 해석 보조**로 쓴다.
- 연구/기관 자료는 **신뢰도와 포지셔닝**을 보강한다.

### 2.3 이 문서가 특히 보는 것
- 온보딩 마찰
- 체크인 부담
- 행동 유도 메커니즘
- 리텐션 장치
- 반복 불만
- 취약한 순간의 진입성
- 톤(위로/코치/관리/훈계)

---

## 3. 전체 비교 결론

### 3.1 가장 중요한 시장 관찰
정서 앱은 대체로 **사용자를 진정시키고 이해하게 만드는 데 강하지만**, 그 다음에 무엇을 할지까지 책임지지 않는다.  
생산성 앱은 대체로 **사용자를 움직이게 만드는 데 강하지만**, 왜 지금 못 움직이는지를 다루지 못한다.

MongCount2는 이 중간지대, 즉 아래 루프에 기회가 있다.

> **감정 수용 → 부담 감소 → 아주 작은 복귀 행동 → 미세 회복 확인**

### 3.2 설계에 바로 쓰일 핵심 명제
- 사용자는 "동기부여"보다 **정서적 허용감**을 먼저 원한다.
- 취약한 날에는 계획보다 **몸이 먼저 움직이는 아주 작은 행동**이 중요하다.
- 리텐션은 streak보다 **다시 돌아올 수 있는 경험**에서 나온다.
- 압박 없는 톤은 단순한 카피 문제가 아니라 **제품 철학**이다.

---

# PART A. 정서적 위로/코칭 앱 심층 카드

---

## 4. Finch

### 4.1 제품 논지
Finch는 self-care를 정서적 과제로 보지 않고, **디지털 반려새를 돌보는 경험**으로 바꾼다. 이 전환 덕분에 "나를 챙겨야 한다"는 부담이 "우리 새를 챙기자"는 감정으로 치환된다.

### 4.2 핵심 UX 루프
- 온보딩에서 새를 고르고 이름 짓는다
- 목표를 고른다
- 작은 행동을 완료한다
- 에너지/보상을 얻는다
- 새가 모험을 떠나고 성장한다
- 다시 돌아와 확인한다

이 구조는 단순 체크리스트가 아니라 **관계형 습관 루프**다.

### 4.3 공식/구조적 강점
- gamified self-care를 매우 잘 구조화했다
- 온보딩에서 실제 보상 구조를 바로 체험시킨다
- 선택지가 있어도 전체 톤이 부드럽다
- 실패해도 큰 처벌이 없다
- self-care를 "가볍고 fun"하게 만든다

### 4.4 사용자들이 실제로 좋아하는 이유
반복적으로 보이는 포인트는 다음이다.

- 판단받지 않는 따뜻한 톤
- "부담 없어서 열기 쉽다"
- ADHD/불안/우울 사용자에게 특히 진입이 쉽다
- 작은 행동을 체크하는 순간 정서적 보상이 따라온다
- 앱이 나를 밀어붙이지 않고 응원해주는 느낌이 있다

Finch가 강한 이유는 생산성 자체가 아니라 **부끄럽지 않은 self-care**를 만든 데 있다.

### 4.5 반복 불만과 약점
- 일부 사용자에게는 유치하거나 infantilizing하게 느껴진다
- billing/subscription 관련 불만이 보인다
- gamification이 깊은 회복보다 외형적 보상으로 읽힐 수 있다
- 장기 목표관리/실행 시스템으로는 약하다
- 지나치게 귀여운 톤이 성인 고관여 사용자에겐 이탈 요인이 된다

### 4.6 MongCount2가 배워야 할 것
**가져와야 할 것**
- 죄책감 없는 진입성
- 감정 체크인 뒤 바로 아주 작은 행동으로 연결하는 흐름
- optionality: 깊게 쓰고 싶으면 쓰고, 짧게 끝낼 수도 있게 하기

**피해야 할 것**
- 귀여움 의존
- 보상 장치가 제품의 본질보다 앞서는 구조
- self-care를 지나치게 유아화하는 톤

### 4.7 MongCount2에 주는 핵심 시사점
Finch의 진짜 경쟁력은 펫이 아니라 **shame-free loop**다.  
MongCount2도 사용자가 앱을 열었을 때 "또 관리받는구나"가 아니라 **"여긴 그냥 들어와도 되는 곳이구나"**를 느끼게 해야 한다.

### 4.8 주요 근거
- App Store: https://apps.apple.com/us/app/finch-self-care-pet/id1528595748
- Google Play: https://play.google.com/store/apps/details?id=com.finch.finch&hl=en_US
- Lifehacker review: https://lifehacker.com/tech/finch-app-review
- Retention analysis: https://www.retention.blog/p/life-of-a-birb
- Gamification analysis: https://naavik.co/deep-dives/deep-dives-new-horizons-in-gamification/
- Reddit infantilization thread: https://www.reddit.com/r/finch/comments/1mdk4ch/liked_a_lot_of_the_features_but_felt_infantilised/

---

## 5. How We Feel

### 5.1 제품 논지
How We Feel은 감정을 단순히 좋음/나쁨으로 기록하는 것이 아니라, **정확한 감정 언어를 찾게 만드는 감정 해상도 도구**다. Yale Center for Emotional Intelligence와의 연결이 신뢰를 만든다.

### 5.2 핵심 UX 루프
- 지금 감정을 체크인한다
- 구체적인 감정 단어를 고른다
- 원인/상황을 태그하거나 적는다
- regulation tool 또는 activity를 본다
- 시간이 지나며 패턴을 본다
- 친구 공유 / 주간 리뷰 등으로 확장한다

### 5.3 공식/구조적 강점
- 과학 기반 포지셔닝이 강하다
- 144개 감정 단어 등 감정 분류가 정교하다
- 체크인 후 tool/활동 연결이 자연스럽다
- 무료라는 점이 신뢰와 호감도를 높인다
- weekly review, friend feature, analysis 축이 있다

### 5.4 사용자들이 실제로 좋아하는 이유
- "내 감정을 정확히 붙잡을 수 있다"
- "막연한 불편감이 구체화된다"
- "감정이 덜 맴돈다"
- "생각 정리에 도움된다"
- "치료사/상담사가 추천할 만한 느낌"

How We Feel은 감정을 해결하기보다 **감정과의 거리감**을 만드는 데 탁월하다.

### 5.5 반복 불만과 약점
- 기록은 잘 되지만 행동 전환이 약하다는 한계가 있다
- 반복 사용 동력이 충분히 강한지는 사용자마다 갈린다
- 감정 인식 이후 장기 습관/복귀 메커니즘은 약하다
- 분석/정리에는 좋지만, "그래서 지금 뭘 하지"가 약해질 수 있다

### 5.6 MongCount2가 배워야 할 것
**가져와야 할 것**
- 감정 라벨링의 정교함
- 감정이 "좋다/나쁘다"가 아니라는 프레이밍
- low-effort emotional check-in UX

**피해야 할 것**
- 기록에서 멈추는 구조
- 자기이해는 높지만 삶의 움직임은 바꾸지 못하는 상태

### 5.7 MongCount2에 주는 핵심 시사점
How We Feel은 MongCount2에게 감정 입력부의 수준을 끌어올리라고 말한다.  
하지만 MongCount2는 거기서 멈추지 말고, **감정 해상도 + 복귀 행동**을 붙여야 한다.

### 5.8 주요 근거
- App Store: https://apps.apple.com/us/app/how-we-feel/id1562706384
- App Store reviews: https://apps.apple.com/us/app/how-we-feel/id1562706384?see-all=reviews&platform=iphone
- Yale article: https://medicine.yale.edu/news-article/the-how-we-feel-app-helping-emotions-work-for-us-not-against-us/
- Marc Brackett page: https://marcbrackett.com/how-we-feel-app-3/
- Google Play: https://play.google.com/store/apps/details?id=org.howwefeel.moodmeter&hl=en_US

---

## 6. Wysa

### 6.1 제품 논지
Wysa는 자유 저널링이 아니라 **챗봇을 통한 공감 + CBT 개입**을 제공한다. 사람에게 말하기 힘든 감정을 익명적이고 저비용으로 다룰 수 있다는 점이 강점이다.

### 6.2 핵심 UX 루프
- 채팅을 연다
- 감정을 털어놓는다
- 챗봇이 공감/질문/CBT 도구를 제안한다
- 사용자가 도구를 수행한다
- 반복 체크인과 coaching upsell로 이어진다

### 6.3 공식/구조적 강점
- evidence-based positioning이 강하다
- 24/7, anonymous, low-pressure라는 가치가 분명하다
- CBT, DBT, mindfulness 등의 도구가 체계적이다
- 인간 코치 upsell까지 이어지는 구조가 있다

### 6.4 사용자들이 실제로 좋아하는 이유
- "누군가 들어주는 느낌이 난다"
- "실제 사람 앞에서 말하는 압박이 없다"
- "불안하거나 외로울 때 바로 열 수 있다"
- "판단받지 않는 공간 같다"
- "펭귄 캐릭터가 위협적이지 않다"

### 6.5 반복 불만과 약점
- scripted, repetitive하다는 지적이 강하다
- long-term memory 부족으로 같은 질문을 반복하는 인상이 있다
- free-form conversation처럼 보이지만 실제론 decision tree에 가까운 순간이 있다
- premium coaching 가격과 가치 인식이 엇갈린다
- 깊은 문제에는 한계가 분명하다

### 6.6 MongCount2가 배워야 할 것
**가져와야 할 것**
- no-judgment space 감각
- 혼자이지만 완전히 혼자는 아닌 느낌
- 챗이 아니라도 대화적인 공감 톤을 줄 수 있다는 점

**피해야 할 것**
- 길고 피곤한 대화
- 반복적/템플릿 같은 응답
- 사람처럼 보이지만 실제로는 기계적으로 느껴지는 실망감

### 6.7 MongCount2에 주는 핵심 시사점
MongCount2는 Wysa처럼 "말 걸 곳이 있는 느낌"은 주되, **자유 채팅 제품이 되어선 안 된다.**  
지친 사용자는 대화보다 **짧은 인정과 짧은 전환**을 더 원한다.

### 6.8 주요 근거
- App Store: https://apps.apple.com/us/app/wysa-mental-wellbeing-ai/id1166585565?see-all=reviews
- ChoosingTherapy review: https://www.choosingtherapy.com/wysa-app-review/
- PMC mixed methods study: https://pmc.ncbi.nlm.nih.gov/articles/PMC6286427/
- PMC user perceptions study: https://pmc.ncbi.nlm.nih.gov/articles/PMC11304096/
- PMC thematic analysis: https://pmc.ncbi.nlm.nih.gov/articles/PMC9044157/
- Trustpilot: https://www.trustpilot.com/review/www.wysa.com

---

## 7. Stoic

### 7.1 제품 논지
Stoic는 감정 조절보다는 **차분한 자기 성찰과 삶의 정돈**을 돕는 앱이다. journaling, prompt, quote, habit, reflection이 통합된 미니멀한 자기관리 도구에 가깝다.

### 7.2 핵심 UX 루프
- prompt 또는 journal entry를 연다
- 생각과 감정을 적는다
- reflection/quote/mindfulness 요소를 소비한다
- 기록이 쌓이며 자기 서사가 형성된다

### 7.3 공식/구조적 강점
- 톤이 성숙하고 정제되어 있다
- UI가 미니멀해 진입 거부감이 적다
- journaling을 삶의 철학과 연결한다
- 사색형 사용자에게 높은 미적 만족을 준다

### 7.4 사용자들이 실제로 좋아하는 이유
- "차분하다"
- "생각을 정리하게 된다"
- "일기 앱보다 더 의미 있게 느껴진다"
- "미니멀해서 계속 열기 좋다"

### 7.5 반복 불만과 약점
- 실제 행동 전환으로 이어지는 힘은 약하다
- subscription/wall 관련 불만이 존재한다
- 기능이 미니멀한 대신 추진력이 부족해질 수 있다
- 사색은 쌓이지만 복귀 행동은 약하다

### 7.6 MongCount2가 배워야 할 것
**가져와야 할 것**
- 성숙한 톤
- 덜 시끄러운 디자인
- 자기 성찰 욕구를 존중하는 방식

**피해야 할 것**
- 기록만 하고 끝나는 상태
- 통찰은 주지만 삶의 작은 움직임으로 연결되지 않는 구조

### 7.7 MongCount2에 주는 핵심 시사점
MongCount2는 Stoic의 차분함을 가져가되, **기록 직후 바로 1-step recovery action**으로 넘어가야 한다.

### 7.8 주요 근거
- App Store: https://apps.apple.com/us/app/stoic-journal-mental-health/id1312926037
- App Store reviews: https://apps.apple.com/us/app/stoic-journal-mental-health/id1312926037?see-all=reviews&platform=iphone
- Stoic testimonials: https://www.getstoic.com/testimonials
- Help Center plans: https://help.getstoic.com/getting-started/nMb4jABmc8oatYuUUyT5Q5/subscription--plans/6f9eBdDY7ngGS3y5u7kPU6
- Reddit discussion: https://www.reddit.com/r/Stoicism/comments/104jopi/the_stoic_app/

---

## 8. Headspace

### 8.1 제품 논지
Headspace는 감정 위로형 앱이라기보다 **신뢰 가능한 명상/수면/스트레스 관리 플랫폼**이다. 대규모 콘텐츠 라이브러리와 브랜드 신뢰가 핵심이다.

### 8.2 핵심 UX 루프
- 스트레스/수면/집중 등의 목적을 선택한다
- 가이드 콘텐츠를 소비한다
- 진정/이완을 경험한다
- 다시 콘텐츠로 돌아온다

### 8.3 공식/구조적 강점
- 콘텐츠 라이브러리가 크다
- 브랜드 신뢰가 높다
- 초심자에게도 설명이 친절하다
- 수면/불안/마음챙김에 대한 포지셔닝이 명확하다

### 8.4 사용자들이 실제로 좋아하는 이유
- "불안이 줄어든다"
- "수면에 도움이 된다"
- "차분한 목소리와 구조가 안정감을 준다"
- "기본적인 명상 앱으로 믿을 만하다"

### 8.5 반복 불만과 약점
- 구독/환불/가격 관련 불만이 반복된다
- 콘텐츠 반복/신선도 저하 지적이 있다
- 실제 행동 복귀로 이어지지 않는다는 한계가 있다
- 앱 내 소비가 끝나면 현실의 다음 행동까지는 연결이 약하다

### 8.6 MongCount2가 배워야 할 것
**가져와야 할 것**
- 심리적 안전감
- 낮은 위협도
- "이 앱은 나를 해치지 않는다"는 느낌

**피해야 할 것**
- 콘텐츠 소비에서 끝나는 구조
- 회복이 현실 복귀로 닫히지 않는 상태

### 8.7 MongCount2에 주는 핵심 시사점
Headspace는 "진정"의 신뢰를 보여준다. MongCount2는 여기에 더해 **진정 후 다시 삶으로 연결되는 인터페이스**가 되어야 한다.

### 8.8 주요 근거
- Official app page: https://www.headspace.com/app
- App Store: https://apps.apple.com/us/app/headspace-meditation-sleep/id493145008
- Trustpilot: https://www.trustpilot.com/review/headspace.com
- Review article: https://makeheadway.com/blog/headspace-app-review/
- Wirecutter meditation apps: https://www.nytimes.com/wirecutter/reviews/best-meditation-apps/

---

# PART B. 생산성/자기관리 앱 심층 카드

---

## 9. Fabulous

### 9.1 제품 논지
Fabulous는 사용자를 더 나은 루틴으로 이끄는 **코치형 habit product**다. 단순 체크박스가 아니라, 정체성과 여정을 설계하는 느낌이 강하다.

### 9.2 핵심 UX 루프
- 온보딩에서 목표와 정체성을 묻는다
- 작은 루틴을 추천한다
- 루틴을 수행하면 다음 단계가 열린다
- coaching copy와 reminder로 연속성을 만든다
- 더 긴 journey로 확장한다

### 9.3 공식/구조적 강점
- 행동 설계가 강하다
- 작은 습관을 여정 구조로 만든다
- onboarding의 설득력이 높다
- motivation과 structure를 함께 준다

### 9.4 사용자들이 실제로 좋아하는 이유
- "지금 뭘 해야 하는지가 분명하다"
- "작은 루틴으로 시작하게 해준다"
- "삶을 재정비하는 느낌이 있다"
- "ADHD/무기력 사용자에게 첫 계단이 된다"

### 9.5 반복 불만과 약점
- 구독/과금/자동결제 관련 불만이 많다
- 과한 코치 톤이 압박처럼 느껴질 수 있다
- 일부 사용자에겐 설교나 manipulation처럼 읽힌다
- 감정적으로 무너진 날에는 너무 생산성스럽다

### 9.6 MongCount2가 배워야 할 것
**가져와야 할 것**
- 다음 행동을 명확하게 닫아주는 힘
- journey형 작은 진입 단계
- 행동 설계의 명확함

**피해야 할 것**
- pushy한 온보딩
- 과한 자기계발 톤
- subscription 신뢰를 해치는 설계

### 9.7 MongCount2에 주는 핵심 시사점
MongCount2는 Fabulous의 행동성은 필요하지만, 감정적으로는 훨씬 더 **허락적이고 비판 없는 코치**여야 한다.

### 9.8 주요 근거
- App Store: https://apps.apple.com/us/app/fabulous-daily-habit-tracker/id1203637303
- App Store reviews: https://apps.apple.com/us/app/fabulous-daily-habit-tracker/id1203637303?see-all=reviews
- ChoosingTherapy review: https://www.choosingtherapy.com/fabulous-app-review/
- Reddit complaints: https://www.reddit.com/r/ProductivityApps/comments/1piuxev/the_fabulous_app_is_a_lie_and_a_scam/
- Reddit complaints: https://www.reddit.com/r/ProductivityApps/comments/196g4cx/fabulous_app_scam/

---

## 10. Todoist

### 10.1 제품 논지
Todoist는 생각을 빠르게 외부화하고 정리하게 만드는 **압축형 계획 도구**다. 감정보다 정리의 힘으로 사용자를 움직인다.

### 10.2 핵심 UX 루프
- 빠르게 task를 캡처한다
- 프로젝트/우선순위를 정리한다
- 체크 완료한다
- karma 등으로 작은 성취를 본다
- 다시 입력하고 정리한다

### 10.3 공식/구조적 강점
- quick capture가 강력하다
- 신뢰성과 cross-platform sync가 높다
- 단순하면서도 확장성이 있다
- 많은 사용자가 "기본 도구"처럼 쓴다

### 10.4 사용자들이 실제로 좋아하는 이유
- "생각을 바로 꺼낼 수 있다"
- "깔끔하다"
- "믿고 오래 쓸 수 있다"
- "계획과 정리가 안정적이다"

### 10.5 반복 불만과 약점
- 캘린더 등 일부 기능이 paywall에 묶인다
- 번아웃 상태에서는 차갑고 기능적이다
- 할 일이 쌓이면 압박 자체가 더 또렷해질 수 있다
- karma/생산성 지표가 어떤 사용자에게는 피로를 줄 수 있다

### 10.6 MongCount2가 배워야 할 것
**가져와야 할 것**
- quick capture의 속도
- 신뢰감 있는 미니멀 구조
- 생각을 밖으로 꺼내게 하는 UX

**피해야 할 것**
- 분류/우선순위 중심 사고를 회복 순간에 가져오는 것
- 감정을 다루지 않는 차가운 인터페이스

### 10.7 MongCount2에 주는 핵심 시사점
회복 순간에는 Todoist처럼 많이 정리하게 하면 안 된다.  
MongCount2는 한 줄 기록 후 **정리보다 회복과 복귀**를 먼저 다뤄야 한다.

### 10.8 주요 근거
- App Store: https://apps.apple.com/us/app/todoist-to-do-list-calendar/id572688855
- Trustpilot: https://www.trustpilot.com/review/todoist.com
- Reddit: https://www.reddit.com/r/todoist/
- Reviews: https://nathanojaokomo.com/blog/todoist-review

---

## 11. Habitica

### 11.1 제품 논지
Habitica는 생산성을 **RPG 게임의 퀘스트와 성장**으로 번역한다. 외적 동기와 커뮤니티가 핵심 엔진이다.

### 11.2 핵심 UX 루프
- 할 일을 quest처럼 등록한다
- 완료하면 보상/성장을 얻는다
- 파티/책임 구조가 유지 압력을 만든다
- 더 많은 행동을 게임 시스템에 편입시킨다

### 11.3 공식/구조적 강점
- 보상형/책임형 메커니즘이 강하다
- community retention이 존재한다
- task completion을 재미로 바꾼다
- customization과 worldbuilding이 강하다

### 11.4 사용자들이 실제로 좋아하는 이유
- "재미있다"
- "지속성이 생긴다"
- "혼자보다 오래 붙잡힌다"
- "성장하는 느낌이 있다"

### 11.5 반복 불만과 약점
- 설정과 구조가 복잡하다
- game layer가 생산성 자체보다 앞설 수 있다
- novelty가 사라지면 grind처럼 느껴질 수 있다
- 감정적으로 지친 날에는 부담이 커진다

### 11.6 MongCount2가 배워야 할 것
**가져와야 할 것**
- 작은 보상/성장 감각
- task completion을 시각적으로 체감하게 하는 힘

**피해야 할 것**
- 복잡한 시스템
- 실패 페널티
- 취약한 날에 더 부담을 주는 구조

### 11.7 MongCount2에 주는 핵심 시사점
MongCount2는 Habitica처럼 사용자를 오래 붙들 수는 있어도, **그 방식이 경쟁/퀘스트/벌점**이어서는 안 된다. 복귀는 게임보다 더 다정해야 한다.

### 11.8 주요 근거
- App Store: https://apps.apple.com/us/app/habitica-gamified-taskmanager/id994882113
- App Store reviews: https://apps.apple.com/us/app/habitica-gamified-taskmanager/id994882113?see-all=reviews
- Trustpilot: https://www.trustpilot.com/review/habitica.com
- TechRadar review: https://www.techradar.com/reviews/habitica
- Reddit struggles: https://www.reddit.com/r/habitica/comments/1k2a2hv/my_struggles_with_habitica/

---

## 12. Routinery

### 12.1 제품 논지
Routinery는 사용자가 생각할 틈 없이 다음 행동으로 넘어가게 하는 **구조형 실행 제품**이다. 시작만 하면 강하다.

### 12.2 핵심 UX 루프
- routine을 만든다
- 시작한다
- 타이머와 순서가 다음 행동을 밀어준다
- routine complete가 된다
- 같은 구조를 반복한다

### 12.3 공식/구조적 강점
- 실행 마찰 제거에 매우 강하다
- 순차 흐름과 타이머가 좋다
- ADHD/실행 장애 사용자에게 강하게 먹힌다
- "무엇부터 하지?"를 없애준다

### 12.4 사용자들이 실제로 좋아하는 이유
- "시작만 하면 술술 간다"
- "루틴에 들어가면 생각을 덜 하게 된다"
- "행동을 자동화하는 느낌이 있다"

### 12.5 반복 불만과 약점
- rigid하다는 비판이 있다
- 감정적으로 힘든 날엔 앱을 켜는 것 자체가 어렵다
- subscription/광고/유연성 관련 불만이 있다
- 루틴에 못 들어가는 순간은 해결 못 한다

### 12.6 MongCount2가 배워야 할 것
**가져와야 할 것**
- 실행 단계에서의 마찰 제거
- "다음 행동 하나만" 보여주는 구조
- 시작 후 흐름을 끊지 않는 설계

**피해야 할 것**
- 시작 전 감정 저항을 무시하는 것
- 너무 기계적인 루틴 강제

### 12.7 MongCount2에 주는 핵심 시사점
MongCount2는 Routinery처럼 행동을 밀 수 있어야 하지만, 그 전에 반드시 **정서적 문턱을 낮춰야 한다.**  
이 제품은 설정형보다 **반응형 제품**이어야 한다.

### 12.8 주요 근거
- Official site: https://www.routinery.app/
- App Store: https://apps.apple.com/us/app/routinery-happy-daily-rituals/id1567733655
- App Store reviews: https://apps.apple.com/us/app/routine-planner-habit-tracker/id1450486923?see-all=reviews&platform=undefined
- Behavioral Scientist critique: https://www.thebehavioralscientist.com/articles/routinery-product-critique
- Ness Labs interview: https://nesslabs.com/routinery-featured-tool
- Reddit ADHD thread: https://www.reddit.com/r/ADHD/comments/rm2b5k/the_routinery_app_is_so_good_omg/

---

## 13. Sunsama

### 13.1 제품 논지
Sunsama는 productivity를 "더 많이 하기"가 아니라 **오늘 감당 가능한 만큼만 계획하기**로 재정의한다. 이 점에서 self-compassion에 가장 가까운 생산성 앱 중 하나다.

### 13.2 핵심 UX 루프
- 오늘의 계획을 세운다
- 할 일을 캘린더/시간 블록에 넣는다
- 현실적인 하루를 설계한다
- review를 통해 조정한다

### 13.3 공식/구조적 강점
- calm productivity 포지셔닝이 선명하다
- burnout 방지 메시지가 있다
- intentional planning 프레임이 강하다
- 과한 할 일 accumulation을 경계한다

### 13.4 사용자들이 실제로 좋아하는 이유
- "오늘 감당 가능한 계획을 세우게 된다"
- "덜 불안하다"
- "계획을 줄이는 데 도움이 된다"
- "일-삶 경계를 좀 더 의식하게 된다"

### 13.5 반복 불만과 약점
- 가격이 높다는 지적이 많다
- methodology-driven이라 사용자에 따라 답답할 수 있다
- 여전히 planning tool이기 때문에 취약한 순간의 즉시 회복에는 약하다
- 앱이 삶을 관리하는 느낌이 날 수 있다

### 13.6 MongCount2가 배워야 할 것
**가져와야 할 것**
- calm productivity라는 철학
- 감당 가능성을 우선하는 태도
- 과한 계획을 줄이는 UX

**피해야 할 것**
- 고관여 계획 시스템으로 무거워지는 것
- 회복 순간에 planning을 요구하는 것

### 13.7 MongCount2에 주는 핵심 시사점
Sunsama는 "덜 몰아붙이는 생산성"의 좋은 사례다.  
하지만 MongCount2는 그보다 더 앞선 단계, 즉 **아예 움직일 수 없는 순간의 복귀**를 다뤄야 한다.

### 13.8 주요 근거
- Sunsama blog: https://www.sunsama.com/blog/daily-schedule
- Reddit pricing thread: https://www.reddit.com/r/productivity/comments/x6357l/sunsama_price_worth_it/
- Reddit criticism: https://www.reddit.com/r/productivity/comments/y0fmaa/what_do_you_not_like_about_sunsama/
- Review: https://thebusinessdive.com/sunsama-review
- Review: https://brainsensei.com/sunsama-review/

---

# PART C. MongCount2 설계 결론

---

## 14. 실제로 가져와야 할 것 vs 버려야 할 것

### 14.1 가져와야 할 것
- Finch의 shame-free entry
- How We Feel의 감정 해상도
- Wysa의 no-judgment space 감각
- Stoic의 차분한 톤
- Fabulous의 action-closing power
- Todoist의 quick capture 속도
- Routinery의 next-step clarity
- Sunsama의 calm productivity 철학

### 14.2 버려야 할 것
- Finch의 유아화 위험
- Wysa/Woebot의 scripted fatigue
- Headspace의 소비형 종료점
- Fabulous의 pushy coaching
- Habitica의 시스템 피로
- Todoist/TickTick 계열의 차가운 관리감
- streak/overdue/실패 누적 중심 UX

---

## 15. MongCount2의 제품 정의를 더 날카롭게 쓰면

> MongCount2는 사용자가 흔들린 순간에도 죄책감 없이 감정을 받아들이고, 몸이 먼저 움직일 수 있는 가장 작은 행동으로 다시 삶에 연결되게 돕는 회복 인터페이스다.

이 정의에서 중요한 단어는 세 개다.

- **죄책감 없이**
- **가장 작은 행동으로**
- **다시 연결되게**

---

## 16. Socrates 전에 꼭 합의해야 할 것

1. MongCount2의 첫 질문은 "지금 어떤 상태인가요?"가 맞는가?
2. 감정 입력은 자유서술보다 칩 선택 중심이 맞는가?
3. 행동 제안은 선택지 3개보다 **주 CTA 1개**가 맞는가?
4. 성공은 streak가 아니라 "오늘 다시 연결됨"으로 정의할 것인가?
5. 기록은 자기 분석보다 자기 회복 자산으로 포지셔닝할 것인가?
6. 앱의 말투는 코치보다 동반자에 가까워야 하는가?
7. 가장 약한 순간에도 열 수 있게 하려면 무엇을 덜어내야 하는가?

---

## 17. 다음 리서치 단계

이 문서는 우선순위 10개 앱의 심층 카드다.  
다음 단계에서는 아래를 추가하면 Socrates 입력 자료로 더 강해진다.

1. 나머지 10개 비교군에 대한 동일 포맷 카드 확장
2. 앱별 실제 리뷰 문장 발췌집 별도 정리
3. 체크인/CTA/회복 확인 마이크로카피 레퍼런스 수집
4. App Store/Play Store 기준 반복 불만 키워드 빈도 정리
5. 감정 상태별 1-step action taxonomy 설계

---

## 18. 근거 표 부록 v1 — 감정 위로/코칭 앱

아래 표는 peer source pack과 현재 접근 가능한 공개 소스를 바탕으로 만든 1차 evidence appendix다. 이 표는 카드 본문보다 더 거칠지만, 반복 호불호와 retention risk를 빠르게 비교하는 데 유용하다.

### 18.1 How We Feel

| 항목 | 내용 |
|---|---|
| source type | 공식: howwefeel.org / 스토어: App Store, Google Play / 커뮤니티: Reddit / 기관: Yale / 리뷰 프록시: JustUseApp, AppsHunter |
| 반복 호평 | 감정 라벨링이 정교함, simple design, free, journaling보다 부담 적음 |
| 반복 불만 | 직접적 부정 리뷰 근거는 아직 약함. 현재까지는 장기 행동 루프의 부재가 잠재 리스크 |
| retention risk | 감정 인식은 강하지만, 그 다음 행동이나 습관 서사가 약하면 기록 도구로만 남을 가능성 |
| MongCount2 implication | 감정 입력부는 How We Feel 수준으로 정교해야 하지만, 반드시 1~3분 행동 CTA로 이어져야 함 |

### 18.2 Wysa

| 항목 | 내용 |
|---|---|
| source type | 공식: wysa.com / 스토어: App Store, Google Play / 커뮤니티: Reddit / 리뷰: ChoosingTherapy, HealthyMinded / 인터뷰: speakingoftoday |
| 반복 호평 | judgment 없이 털어놓기 좋음, 밤중에도 접근 가능, anxiety 때 quick exercise가 도움됨 |
| 반복 불만 | scripted/repetitive, direct question에 정확히 답하지 않음, 인간적 상호작용 욕구를 충족시키지 못함 |
| retention risk | 초반 몰입은 좋지만 반복성과 기계적 흐름이 감지되면 빠르게 식을 수 있음 |
| MongCount2 implication | 공감 톤은 가져오되 자유 채팅은 피하고, 짧은 인정 + 짧은 행동 제안으로 닫아야 함 |

### 18.3 Woebot

| 항목 | 내용 |
|---|---|
| source type | 공식: woebothealth.com / 스토어: App Store, Google Play / 커뮤니티: Reddit / 리뷰: trytherapy.ai / 연구: Springer, 기타 리뷰 프록시 |
| 반복 호평 | 사고 패턴을 멈추고 보게 함, humor와 human-like dialogue 덕분에 CBT가 덜 딱딱함, daily check-in이 유지에 도움 |
| 반복 불만 | 프로그램을 밟는 느낌, 구조화된 개입이 강함, 신규 접근성 자체가 제한적임 |
| retention risk | 제품 접근 장벽과 과도한 구조화가 결합되면 일상적 사용보다 특수 상황용 도구로 남을 가능성 |
| MongCount2 implication | 분석형 개입보다 먼저 정서적 문턱을 낮추고, 행동은 더 작고 즉시 가능한 형태여야 함 |

### 18.4 Reflectly

| 항목 | 내용 |
|---|---|
| source type | 공식: reflectlyapp.com / 스토어: App Store, Google Play / 커뮤니티: Reddit / 인터뷰: AppGuardians / 리뷰: ChoosingTherapy, JustUseApp |
| 반복 호평 | aesthetic함, 기록 경험이 부드럽고 enjoyable함, fun to write, relaxing한 감각 |
| 반복 불만 | sync/logout/data loss 계열 신뢰성 문제, 감성은 좋지만 실질 행동 변화 고리가 약하다는 우려 |
| retention risk | 초반 감성 만족은 높아도, 신뢰성 문제나 행동 연결 부재가 누적되면 "예쁜 저널"로 남을 수 있음 |
| MongCount2 implication | 시각적/정서적 부드러움은 중요하지만, 안정성과 행동 연결이 더 우선되어야 함 |

### 18.5 Daylio

| 항목 | 내용 |
|---|---|
| source type | 스토어: App Store, Google Play / 커뮤니티: Reddit / 리뷰: ChoosingTherapy, MoodTrackers, TrackingHappiness, Android Police |
| 반복 호평 | 입력 마찰이 매우 낮음, customization과 stats가 강함, journaling이 귀찮은 사람도 사용 가능 |
| 반복 불만 | premium nudges, 다소 오래된 디자인 인상, 정서적 위로나 공감 경험은 약함 |
| retention risk | tracking satisfaction으로는 유지되지만, 힘든 순간의 emotional pull은 약할 수 있음 |
| MongCount2 implication | 체크인은 Daylio 수준으로 짧아야 하지만, 로그 직후 공감과 회복 행동을 붙여야 함 |

## 19. 내부 메모

현재까지 가장 유의미한 패턴은 다음과 같다.

- 사람들은 위로만으로 오래 남지 않는다.
- 행동만 밀면 취약한 날에 떠난다.
- 진입 마찰이 10초를 넘는 순간 숙제가 된다.
- 회복 앱의 진짜 경쟁력은 productivity boost가 아니라 **returnability**다.
- 즉, 사용자가 가장 약할 때도 다시 열 수 있어야 한다.

---

## 20. UX 메커니즘 비교 표

| 메커니즘 | 시장에서 강하게 보인 사례 | 왜 먹히는가 | 자주 깨지는 지점 | MongCount2 적용 원칙 |
|---|---|---|---|---|
| shame-free entry | Finch, How We Feel, Wysa | 사용자가 이미 지쳐 있는 상태에서도 열 수 있게 만든다 | 귀여움 과잉, 위로 문구의 상투성, 심리 앱 느낌 과다 | 첫 화면은 평가가 아니라 허용이어야 한다. "지금도 들어와도 된다"는 인상을 줘야 한다 |
| 감정 라벨링 | How We Feel, Daylio, Stoic | 막연한 혼란을 이름 붙일 수 있게 해 통제감을 회복시킨다 | 너무 많은 선택지, 자기분석 과잉, 기록으로 끝남 | 감정 칩은 빠르게 고르게 하되 3초 안에 끝나야 한다. 입력은 깊이보다 진입성을 우선한다 |
| no-judgment tone | Wysa, Finch, Headspace | 사용자가 방어적이 되지 않고 머무르게 한다 | AI가 사람인 척할 때 실망이 커짐, 코치 톤이 설교처럼 느껴짐 | 말투는 조언보다 동행에 가깝게 설계한다. 진단·평가·훈계 문장을 피한다 |
| tiny action closure | Fabulous, Routinery, Finch | 감정 상태를 현실 행동으로 닫아준다 | 행동이 크거나 추상적이면 바로 이탈한다 | 행동 제안은 1개를 기본으로 하고 1~3분 내 가능한 것만 기본값으로 둔다 |
| next-step clarity | Todoist, Routinery, Fabulous | 사용자가 "그래서 지금 뭘 하지"를 고민하지 않게 한다 | 선택지가 많아지면 다시 생각해야 해서 피로가 커짐 | CTA는 주 행동 1개 중심, 나머지는 숨김 옵션으로 둔다 |
| return ritual | Finch, Daylio, Sunsama | 앱을 한 번 쓰고 끝내지 않고 다시 오게 한다 | streak·overdue·missed reminder가 죄책감을 만든다 | 복귀 메시지는 "다시 시작"보다 "지금 여기서 1분만"에 가깝게 설계한다 |
| calm structure | Stoic, Sunsama, Headspace | 혼란한 상태에서도 UI 자체가 안정감을 준다 | 지나치게 차분하면 무기력한 날엔 움직임이 약하다 | 화면은 차분하되 항상 마지막엔 아주 작은 행동으로 닫는다 |
| progress visibility | Finch, Habitica, Todoist | 사용자가 회복이나 실행의 흔적을 느끼게 한다 | 수치 경쟁, 누적 실패 강조, 강박 유도 | 회복의 성과는 achievement가 아니라 reconnect 횟수와 회복 자산으로 보여준다 |

---

## 21. 행동심리 패턴 표

| 행동심리 레버 | 시장에서 확인된 작동 방식 | 대표 사례 | 역효과 패턴 | MongCount2 설계 시사점 |
|---|---|---|---|---|
| 자기연민 허용감 | 사용자가 스스로를 밀어붙이지 않아도 된다고 느낄 때 오히려 재진입률이 올라간다 | Finch, Sunsama | 너무 부드러우면 실행력이 약해질 수 있음 | 위로 직후 바로 아주 작은 행동을 붙여 연민이 정지 상태로 끝나지 않게 해야 한다 |
| 외부화 | 감정이나 할 일을 밖으로 꺼내는 순간 머리 부하가 줄어든다 | Todoist, How We Feel, Stoic | 입력 구조가 길면 오히려 숙제가 된다 | 텍스트보다 칩·짧은 캡처를 우선하고, 자유서술은 선택형으로 둔다 |
| 구현 의도 감소 | 큰 목표보다 즉시 가능한 작은 다음 행동이 실제 실행을 만든다 | Routinery, Fabulous | 행동 제안이 추상적이거나 많으면 무력화된다 | "심호흡 3번" "자리에서 일어나 물 한 잔" 같은 마찰 낮은 행동 taxonomy가 핵심이다 |
| 정체성 프레이밍 | 사용자는 단발 행동보다 "나는 이런 사람"이라는 내러티브에 오래 반응한다 | Fabulous, Finch, Stoic | 자기계발 서사가 과하면 취약한 날에 수치심을 자극한다 | MongCount2의 정체성은 성취자가 아니라 회복할 줄 아는 사람에 가까워야 한다 |
| 관계감 | 혼자가 아니라는 느낌이 체류 시간을 늘린다 | Wysa, Finch | 캐릭터/챗봇이 과하면 유치함 또는 가짜 친밀감 문제가 생긴다 | companion 느낌은 주되 캐릭터 의존이나 인간 흉내는 줄여야 한다 |
| 마찰 없는 재개 | 사용자는 중단 후 다시 돌아올 때 가장 큰 장벽을 느낀다 | Daylio, Finch, Todoist | missed streak, overdue, guilt reminder가 재개를 막는다 | 복귀 UX는 과거 실패를 보여주지 말고 현재 1-step만 보여줘야 한다 |
| 가시적 진전 | 작은 진전이 보일 때 재방문 동기가 생긴다 | Finch, Habitica, Todoist | 수치화가 경쟁과 압박으로 전환될 수 있다 | 연속일수보다 "최근 회복 패턴" "나에게 먹힌 회복법"처럼 자기이해형 지표가 적합하다 |
| 신뢰감 | 심리 취약 상황일수록 가격·데이터·알림의 신뢰가 잔존에 직결된다 | Headspace, How We Feel | 과금 트랩, 환불 불만, 데이터 불안이 생기면 감정 앱은 즉시 배신처럼 느껴진다 | pricing/permission/privacy는 과도하게 친절하고 명확해야 한다 |

---

## 22. 윤리 리스크 체크리스트

| 리스크 | 시장에서 반복 관찰된 형태 | 왜 치명적인가 | MongCount2 가드레일 |
|---|---|---|---|
| 취약한 순간 과금 압박 | trial trap, 자동결제 불만, paywall surprise | 감정 회복을 약속한 제품이 신뢰를 잃는 가장 빠른 경로다 | 무료 핵심 루프를 분명히 보장하고, 결제는 회복 흐름 바깥에서만 제안한다 |
| 가짜 공감 / 가짜 인간성 | scripted chatbot, 사람 같은 척하는 AI | 초기 친밀감 뒤에 실망과 배신감이 크게 온다 | 사람처럼 연기하지 말고, 짧고 정직한 companion tone을 유지한다 |
| 과도한 죄책감 유도 | streak, missed goal, overdue 중심 카피 | 취약한 사용자를 더 위축시키고 이탈을 만든다 | 실패를 기록하지 말고 복귀를 기록한다 |
| 유아화 | 귀여움이 성인 사용자의 자존감을 건드림 | 단기 호감은 얻어도 장기 고관여 사용자를 잃을 수 있다 | 시각 언어는 부드럽되 존중감을 유지한다 |
| 과도한 자기분석 요구 | 긴 체크인, 깊은 journaling 강제 | 가장 힘든 날일수록 실행 불가능하다 | 기본 루프는 10초 체크인 + 1개 행동 제안으로 고정한다 |
| 알림 남용 | 반복 리마인더, 압박형 nudging | 회복 앱이 감시 장치처럼 느껴진다 | 알림은 빈도보다 맥락, pressure보다 invitation 중심이어야 한다 |
| 치료 대체처럼 보이는 포지셔닝 | evidence-based 문구의 과장, 증상 해결 암시 | 법적·윤리적 리스크뿐 아니라 사용자 기대를 왜곡한다 | 치료·진단·치유를 약속하지 않고 일상 회복 지원 도구로 명확히 말한다 |
| 데이터/프라이버시 불안 | 감정 기록의 저장·공유 불투명성 | 감정 데이터는 배신 비용이 매우 크다 | 저장 범위, 삭제 방식, 공유 여부를 첫 사용부터 명확히 제시한다 |

---

## 23. MongCount2 핵심 UX/기능/가치 전략

### 23.1 핵심 UX 전략
1. **입장 허용감**: 앱을 열자마자 사용자가 평가받는 느낌을 받지 않아야 한다.
2. **초저마찰 체크인**: 감정 입력은 10초 안에 끝나야 한다.
3. **주 CTA 1개**: 현재 상태에서 가장 쉬운 복귀 행동 하나만 먼저 보여줘야 한다.
4. **회복 확인**: 행동 뒤에는 "해냈다"보다 "조금 돌아왔다"는 감각을 남겨야 한다.
5. **복귀 친화 리텐션**: 연속성보다 재진입성을 우선해야 한다.

### 23.2 핵심 기능 전략
- 감정 상태 칩 선택
- 맥락 태그 1개 선택(회사/사람/피곤/불안/분노 등)
- 상태별 1~3분 회복 행동 추천
- 행동 후 짧은 회복 확인(나아짐/그대로/다른 것이 필요함)
- 나에게 먹힌 회복법 기록
- guilt-free re-entry 홈

### 23.3 핵심 가치 전략
- 사용자는 이 앱에서 "더 열심히 살아라"가 아니라 **"지금도 다시 돌아올 수 있다"**를 느껴야 한다.
- 가치의 본질은 생산성 향상이 아니라 **복잡한 마음에서 빠져나와 다시 연결되는 능력**이다.
- 생산성은 전면 메시지가 아니라 결과로 체감되어야 한다.
- MongCount2의 차별점은 위로나 계획이 아니라 **정서적 수용과 행동 복귀를 한 화면 안에서 닫는 것**이다.

### 23.4 한 줄 포지셔닝 초안
> MongCount2는 흔들린 순간의 마음을 짧게 받아주고, 다시 삶으로 돌아가는 가장 작은 행동까지 함께 닫아주는 회복 앱이다.

---

## 24. 설계 원칙과 금지 원칙

### 24.1 설계 원칙
- **위로가 먼저, 분석은 나중**: 가장 취약한 순간에는 해석보다 안정감이 먼저다.
- **행동은 작고 구체적으로**: 실행은 의지보다 마찰 수준에 좌우된다.
- **성공은 달성이 아니라 복귀**: 이 제품의 KPI는 몰입 시간이 아니라 다시 연결된 횟수에 가깝다.
- **기록은 데이터가 아니라 회복 자산**: 과거 로그는 분석용보다 "나에게 먹혔던 방식"을 되살리는 용도로 써야 한다.
- **톤은 코치보다 동반자**: 사용자를 움직이게 하되 밀어붙이지 않아야 한다.
- **기본 루프는 언제나 짧게**: 열기 → 상태 표시 → 1-step action → 회복 확인까지가 한 호흡 안에 끝나야 한다.

### 24.2 금지 원칙
- streak, overdue, missed goal 같은 죄책감 중심 장치
- 긴 온보딩과 자기분석 강요
- 취약한 순간의 결제 유도
- 사람인 척하는 AI 연기
- 회복보다 예쁜 기록에 치우친 인터페이스
- 계획/생산성 기능이 핵심 루프를 압도하는 구조
- "더 잘해야 한다"는 자기계발 톤의 전면화

---

## 25. Socrates 입력용 압축 결론

MongCount2가 시장에서 가져와야 하는 것은 감정 앱의 따뜻함이나 생산성 앱의 실행성 각각이 아니다. 중요한 것은 **감정적으로 무너진 상태에서도 들어올 수 있게 만드는 허용감**과, 그 직후 **몸이 먼저 움직일 수 있는 가장 작은 행동으로 닫는 설계**를 하나의 짧은 루프로 결합하는 것이다.

따라서 Socrates 단계에서는 기능 나열보다 먼저 아래 질문에 답하는 것이 맞다.

1. 가장 약한 순간에도 열 수 있을 정도로 홈 화면이 가벼운가?
2. 감정 입력이 빠르면서도 피상적이지 않은가?
3. 추천 행동이 충분히 작고 즉시 가능한가?
4. 복귀 성공을 achievement가 아니라 reconnect로 정의하는가?
5. 과금, 알림, 기록 구조가 사용자의 취약성을 착취하지 않는가?
