import { THEME_STORAGE_KEY } from "@/stores/theme-store";

const themeModeScript = `(function(){try{var root=document.documentElement;function apply(preference){localStorage.setItem('${THEME_STORAGE_KEY}',preference);root.dataset.theme=preference;root.style.colorScheme=preference==='dark'?'dark':'light';}var stored=localStorage.getItem('${THEME_STORAGE_KEY}');var preference=stored==='light'||stored==='dark'||stored==='forest'?stored:'forest';apply(preference);document.addEventListener('change',function(event){var target=event.target;if(!(target instanceof HTMLInputElement))return;if(target.name!=='theme')return;apply(target.value);});}catch(e){}})();`;

export function ThemeModeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeModeScript }} />;
}
