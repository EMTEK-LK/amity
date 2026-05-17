/** Inline script to apply theme before paint — prevents flash and hydration mismatch */
export function ThemeScript() {
  const script = `
(function() {
  try {
    var stored = localStorage.getItem('amity-theme');
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
}
