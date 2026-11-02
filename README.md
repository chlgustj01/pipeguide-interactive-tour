# PipeGuide Interactive Tour

PipeGuide Twin v10.4 기반 비영리 교육용 인터랙티브 가이드입니다.

- index.html: 튜토리얼
- program.html: 샘플 프로그램 복사본과 샘플 도면
- manual.html: 사용 설명
- 학습 40단계 / 발표 12장면, 모바일 확대와 플로팅 안내 지원

도면 출처: AI Hub P&ID, CC BY-NC. 원본에 포함된 출처 표기를 유지했습니다.
자연어 시연은 외부 LLM API를 호출하지 않는 규칙 해석 모드입니다.

GitHub Pages: Settings → Pages → Deploy from a branch → main / (root) → Save.

## Guided Live Presentation

`presentation.html`은 첨부 발표의 22장과 내장 영상을 유지한 발표 진입점입니다.

```sh
cd /workspace/pipeguide-interactive-tour
python3 -m http.server 8000 --bind 127.0.0.1
```

브라우저에서 `presentation.html`을 열고 7~11장의 `STEP LIVE` 버튼을 순서대로 사용합니다. `file://` 대신 같은 출처의 HTTP 서버가 필요합니다.

- 자동 가이드: 가상 커서와 Spotlight가 실제 컨트롤을 가리키고 계산을 실행합니다.
- 직접 시연: 강조된 실제 컨트롤을 클릭하거나 안내 패널의 실행 버튼을 누릅니다.
- 자유 조작 / 일시정지: 가이드를 멈추고 배관 선택·회전·탭 이동을 직접 할 수 있습니다. 재개하면 아직 실행하지 않은 안내부터 이어집니다.
- 각 STEP 완료 후 결과를 확인하고 `시연 완료 · 다음 발표로`를 누릅니다. 우측 상단 `발표 복귀`는 원래 슬라이드로 돌아갑니다.
- `STEP 시작 상태 복원`은 해당 STEP에 진입할 때 저장한 메모리 상태를 복원합니다. 이후 STEP의 변경 내용도 그 시점으로 되돌아갑니다. 새로고침하면 메모리 상태와 체크포인트가 사라집니다.
- `샘플로 이 STEP 준비`는 현재 시연 상태를 검증 샘플로 바꾸고 필요한 선행 계산을 실행합니다. 중간 STEP부터 발표하거나 복원 지점이 없을 때 사용하세요. 일반 STEP 이동은 기존 모델을 유지합니다.

한 iframe 인스턴스를 유지하고 Academy의 `PGTour.prepare()` 초기화 기능을 사용하지 않습니다. STEP 01에서 샘플을 불러오고 STEP 02에서 모델을 생성해야 이후 STEP을 진행할 수 있습니다. STEP 04는 STEP 03의 실제 공간 문제를 이어받습니다. 실패하면 안내를 중지하고 오류를 표시하며, 복원 또는 원본 영상으로 발표를 계속할 수 있습니다.

OCR은 사전 인식된 샘플 결과를 사용합니다. 자연어 연결은 외부 LLM을 호출하지 않는 규칙 해석입니다. 경로와 수치는 실제 앱의 A* 탐색·검사 결과이며 후보 개수를 A/B/C 세 개로 고정하지 않습니다. 원본 발표의 수치·설명은 그대로 유지했으므로 LIVE 결과와 비교해 설명하세요.

구현: `presentation-bridge.js`(발표/단일 인스턴스), `guided-tour.js`(안내 실행), `live-app-bridge.js`(실제 앱 조작/복원), `guided-presentation.css`(화면 구성). `program.html`과 기존 Academy는 수정하지 않습니다.

브라우저 통합 테스트(환경에 Playwright와 Chromium이 준비되어 있어야 함):

```sh
node tests/live-presentation.cjs
```

다섯 STEP의 실제 계산, 배관 20→21개 증가, 변경 이력, 단일 iframe 유지, STEP 복원, 직접 클릭, 자동 진행과 일시정지·재개, 슬라이드 복귀를 검증합니다. 첨부 발표와 동영상의 출처·원본 슬라이드 내용은 유지했습니다.
