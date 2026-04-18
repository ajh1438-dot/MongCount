import { THEME_STORAGE_KEY } from "@/stores/theme-store";

const themeModeScript = `(function(){try{var root=document.documentElement;function resolve(preference){var hour=(new Date()).getHours();var isNight=hour>=22||hour<8;var prefersDark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;return preference==='light'?'light':preference==='dark'?'dark':(isNight||prefersDark?'dark':'light');}function apply(preference){localStorage.setItem('${THEME_STORAGE_KEY}',preference);var resolved=resolve(preference);root.dataset.theme=resolved;root.style.colorScheme=resolved;}var stored=localStorage.getItem('${THEME_STORAGE_KEY}');var preference=stored==='light'||stored==='dark'||stored==='system'?stored:'system';apply(preference);document.addEventListener('change',function(event){var target=event.target;if(!(target instanceof HTMLInputElement))return;if(target.name!=='theme')return;apply(target.value);});}catch(e){}})();`;

export function ThemeModeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeModeScript }} />;
}
