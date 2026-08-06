/** @type {import("prettier").Config} */
const config = {
  // Tailwind 클래스 순서를 정렬한다. 플러그인은 설정에 등록해야 로드된다 —
  // 지금까지 설치만 되어 있고 실제로는 돌지 않았다.
  plugins: ["prettier-plugin-tailwindcss"],
  // Tailwind 4는 설정 파일이 없어서 CSS 진입점에서 클래스 순서를 읽는다.
  tailwindStylesheet: "./app/globals.css",
};

export default config;
