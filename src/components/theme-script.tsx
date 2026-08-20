export function ThemeScript() {
  const script = `
    (() => {
      const saved = localStorage.getItem("conectados-theme");
      const cookieMatch = document.cookie.match(/(?:^|; )conectados-theme=([^;]+)/);
      const cookieTheme = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
      const theme = saved === "dark" || cookieTheme === "dark" ? "dark" : "light";
      document.documentElement.dataset.theme = theme;
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
