# Copilot Lint & Code Style Guidelines

이 문서는 GitHub Copilot 및 자동화 에이전트가 이 저장소에서 코드를 생성하거나 수정할 때 반드시 따라야 할 규칙을 정의합니다.

## Lint-safe Vue/TypeScript/ESLint 작업 가이드라인

0. 답변은 반드시 한글로 해
1. **async 함수 호출은 반드시 await, .then().catch(), 또는 void로 처리**  
   (no-floating-promises)
2. **Promise가 아닌 함수에 await 사용 금지**  
   (await-thenable)
3. **사용하지 않는 변수/임포트/함수/ESLint 디렉티브는 반드시 제거**  
   (no-unused-vars, no-unused-labels, no-unused-eslint-disable)
4. **any 사용 금지, 타입 명시**  
   (no-explicit-any, 타입 명확화)
5. **불필요한 try/catch, 빈 catch 금지**  
   (가능하면 error 로깅)
6. **함수/변수 선언 순서 및 사용 위치 일관성**
7. **코드 스타일 및 포맷은 프로젝트 eslint/prettier 규칙 준수**
8. **모든 외부 비동기 작업은 예외 처리 필수**
9. **컴포넌트/훅/반응형 변수는 사용 전에 선언**
10. **불필요한 코드 중복, dead code, 주석된 코드 제거**

---

이 가이드라인은 모든 Pull Request, 코드 리뷰, 자동화된 코드 생성 및 Copilot 제안에 적용됩니다.

> Copilot 및 모든 자동화 에이전트는 이 문서를 항상 참고하여 lint/코드 스타일 위반 없이 코드를 생성해야 합니다.
