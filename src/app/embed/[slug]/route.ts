import {
  embedBmi,
  embedBmiCategory,
  embedEpley,
  embedMifflin,
} from "@/lib/embed/formulas";
import { type EmbedSlug, EMBED_SLUGS, isEmbeddable } from "@/lib/embed/embeddable";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { getTool } from "@/registry/tools";

/**
 * React-free embed builds (SPEC §9, §16 M4). Served as raw HTML from a
 * route handler so no framework runtime ships — each embed is a few kB
 * against the < 50 kB budget. Formulas are serialised from
 * src/lib/embed/formulas.ts, which unit tests lock to the canonical
 * implementations. Every embed links back with attribution.
 */

export const dynamic = "force-static";

export function generateStaticParams(): { slug: string }[] {
  return EMBED_SLUGS.map((slug) => ({ slug }));
}

const STYLE = `
:root{font-family:system-ui,sans-serif;color:#1a202c}
.wrap{max-width:420px;margin:0 auto;padding:12px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc}
h1{font-size:1rem;margin:0 0 8px}
label{display:block;font-size:.8rem;font-weight:600;margin-top:8px}
input,select{width:100%;box-sizing:border-box;padding:6px 8px;margin-top:2px;border:1px solid #e2e8f0;border-radius:6px;font-size:1rem;background:#fff}
.row{display:grid;grid-template-columns:1fr 1fr;gap:8px}
output{display:block;margin-top:12px;font-size:1.4rem;font-weight:700;color:#115e59;min-height:1.8rem}
small{color:#475569}
a{color:#0f766e}
`.trim();

interface EmbedDef {
  title: string;
  body: string;
  script: string;
}

function buildDefs(): Record<EmbedSlug, EmbedDef> {
  return {
    "tdee-calculator": {
      title: "TDEE Calculator",
      body: `
<div class="row">
<label>Sex<select id="sex"><option value="male">Male</option><option value="female">Female</option></select></label>
<label>Age<input id="age" type="number" value="30" min="13" max="100"></label>
<label>Weight (kg)<input id="w" type="number" value="80" min="30" max="300"></label>
<label>Height (cm)<input id="h" type="number" value="175" min="120" max="250"></label>
</div>
<label>Activity<select id="act">
<option value="1.2">Sedentary (×1.2)</option>
<option value="1.375">Light (×1.375)</option>
<option value="1.55" selected>Moderate (×1.55)</option>
<option value="1.725">Very active (×1.725)</option>
<option value="1.9">Extremely active (×1.9)</option>
</select></label>
<output id="out" aria-live="polite"></output>
<small>Mifflin-St Jeor estimate, not medical advice.</small>`,
      script: `var mifflin=${embedMifflin.toString()};
function calc(){var s=document.getElementById('sex').value,a=+document.getElementById('age').value,w=+document.getElementById('w').value,h=+document.getElementById('h').value,f=+document.getElementById('act').value;
if(!(a>=13&&a<=100&&w>=30&&w<=300&&h>=120&&h<=250)){document.getElementById('out').textContent='Enter valid values';return;}
var t=Math.round(mifflin(s,w,h,a)*f);document.getElementById('out').textContent=t.toLocaleString('en-GB')+' kcal/day';}
`,
    },
    "bmi-calculator": {
      title: "BMI Calculator",
      body: `
<div class="row">
<label>Weight (kg)<input id="w" type="number" value="80" min="30" max="300"></label>
<label>Height (cm)<input id="h" type="number" value="175" min="120" max="250"></label>
</div>
<output id="out" aria-live="polite"></output>
<small>WHO adult categories; BMI cannot tell muscle from fat.</small>`,
      script: `var bmi=${embedBmi.toString()};var cat=${embedBmiCategory.toString()};
function calc(){var w=+document.getElementById('w').value,h=+document.getElementById('h').value;
if(!(w>=30&&w<=300&&h>=120&&h<=250)){document.getElementById('out').textContent='Enter valid values';return;}
var v=bmi(w,h);document.getElementById('out').textContent=v.toFixed(1)+': '+cat(v);}
`,
    },
    "one-rep-max-calculator": {
      title: "One-Rep Max Calculator",
      body: `
<div class="row">
<label>Weight lifted (kg)<input id="w" type="number" value="100" min="1" max="500"></label>
<label>Reps (1 to 10)<input id="r" type="number" value="5" min="1" max="10"></label>
</div>
<output id="out" aria-live="polite"></output>
<small>Epley estimate; valid for 10 reps or fewer.</small>`,
      script: `var epley=${embedEpley.toString()};
function calc(){var w=+document.getElementById('w').value,r=+document.getElementById('r').value;
if(!(w>=1&&w<=500&&r>=1&&r<=10)){document.getElementById('out').textContent='Enter valid values';return;}
document.getElementById('out').textContent=(Math.round(epley(w,r)*10)/10).toFixed(1)+' kg';}
`,
    },
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  if (!isEmbeddable(slug)) return new Response("Not found", { status: 404 });
  const tool = getTool(slug);
  if (!tool) return new Response("Not found", { status: 404 });
  const def = buildDefs()[slug];

  const html = `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${def.title} | ${SITE_NAME}</title>
<style>${STYLE}</style>
</head>
<body>
<div class="wrap">
<h1>${def.title}</h1>
${def.body}
<p><small>Powered by <a href="${SITE_URL}/${slug}?utm_source=embed" target="_top" rel="noopener">${SITE_NAME}</a>, estimates only, not medical advice.</small></p>
</div>
<script>${def.script}
document.querySelectorAll('input,select').forEach(function(el){el.addEventListener('input',calc);});
calc();
</script>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
