# Guia de Tipografia - Terapia Empresarial Landing Page

Baseado no Design System em `/terapia-new-brand/design-system-new-brand.html`

## Fontes

### Space Grotesk (Títulos/Display)
- **Uso:** Todos os headings (h1, h2, h3, h4), stats, números grandes
- **Weights disponíveis:** 400, 500, 600, 700
- **Classe Tailwind:** `font-grotesk`

### Sora (Corpo/UI)
- **Uso:** Todo o corpo de texto, parágrafos, labels, botões, inputs, links
- **Weights disponíveis:** 300, 400, 500, 600, 700, 800
- **Classe Tailwind:** `font-sora`

---

## Hierarquia de Tamanhos

### Display/Hero Titles
- **h1 (Hero):** `font-grotesk text-[clamp(36px,5vw,64px)] font-bold leading-[1.08] tracking-[-0.02em]`
- **h1 (Sections):** `font-grotesk text-[clamp(28px,4vw,40px)] font-bold leading-[1.15] tracking-[-0.01em]`

### Headings
- **h2:** `font-grotesk text-[clamp(28px,3.5vw,44px)] font-bold leading-[1.1]`
- **h3:** `font-grotesk text-[20px] font-semibold leading-[1.2]`
- **h4:** `font-grotesk text-[18px] font-semibold leading-[1.3]`

### Body Text
- **Large (Hero subheading):** `font-sora text-[clamp(16px,1.8vw,19px)] leading-[1.7]`
- **Regular (Paragraph):** `font-sora text-[16px] leading-[1.6]`
- **Medium (Card description):** `font-sora text-[15px] leading-[1.6]`
- **Small (UI text):** `font-sora text-[14px] leading-[1.5]`
- **Extra Small (Labels, meta):** `font-sora text-[13px] leading-[1.4]`

### UI Elements
- **Buttons (Primary):** `font-sora text-[15px] font-semibold`
- **Buttons (Small):** `font-sora text-[13px] font-semibold`
- **Buttons (Large):** `font-sora text-[17px] font-semibold`
- **Links (Nav):** `font-sora text-[13px] font-medium`
- **Links (Body):** `font-sora text-[14px] font-medium`

### Labels & Meta
- **Eyebrow/Kicker:** `font-sora text-[11px] font-semibold uppercase tracking-[0.1em]`
- **Badge:** `font-sora text-[12px] font-semibold uppercase tracking-[0.06em]`
- **Helper Text:** `font-sora text-[12px] font-normal`
- **Legal/Footer:** `font-sora text-[12px] font-normal`

### Stats & Numbers
- **Large Stats:** `font-grotesk text-[clamp(32px,4vw,48px)] font-bold leading-none`
- **Medium Stats:** `font-grotesk text-[28px] font-bold`
- **Stat Labels:** `font-sora text-[14px] font-normal`

---

## Font Weights (Sora)

- **300 (Light):** Textos muito leves (raramente usado)
- **400 (Regular):** Corpo de texto padrão, parágrafos
- **500 (Medium):** Links, labels secundárias, navegação
- **600 (Semibold):** Botões, CTAs, labels importantes, títulos pequenos
- **700 (Bold):** Destaques, números em destaque
- **800 (Extrabold):** Raramente usado

## Font Weights (Space Grotesk)

- **400 (Regular):** Sub-títulos leves
- **500 (Medium):** Raramente usado
- **600 (Semibold):** Headings menores (h3, h4)
- **700 (Bold):** Headings principais (h1, h2), stats

---

## Aplicação por Seção

### Alert Bar
- Texto: `font-sora text-[13px] font-medium`
- CTA: `font-sora text-[13px] font-semibold`

### Navbar
- Links: `font-sora text-[14px] font-medium`
- Botão: `font-sora text-[14px] font-medium`

### Hero
- Título (h1): `font-grotesk text-[clamp(36px,5vw,64px)] font-bold`
- Subtítulo: `font-sora text-[clamp(16px,1.8vw,19px)]`
- Benefits: `font-sora text-[15px]`
- Social Proof: `font-sora text-[13px]`

### Login Card
- Título (h2): `font-grotesk text-[22px] font-bold`
- Subtítulo: `font-sora text-[14px]`
- Labels: `font-sora text-[13px] font-medium`
- Inputs: `font-sora text-[15px]`
- Botões: `font-sora text-[15px] font-semibold`
- Helper: `font-sora text-[12px]`
- Links: `font-sora text-[13px]`

### Content Sections
- Eyebrow: `font-sora text-[13px] font-semibold uppercase tracking-[0.1em]`
- Título (h2): `font-grotesk text-[clamp(28px,3.5vw,44px)] font-bold`
- Parágrafo: `font-sora text-[16px]`
- Card Título (h3): `font-grotesk text-[15px] font-semibold`
- Card Descrição: `font-sora text-[14px]`
- Botões CTA: `font-sora text-[15px] font-semibold`

### Stats Cards
- Valor: `font-grotesk text-[clamp(32px,4vw,48px)] font-bold`
- Label: `font-sora text-[14px]`
- Eyebrow: `font-sora text-[13px] font-semibold uppercase`

### Footer
- Títulos: `font-sora text-[12px] font-semibold uppercase tracking-[0.12em]`
- Links: `font-sora text-[13px]`
- Copyright: `font-sora text-[12px]`

---

## Line Heights

- **Display/Headings:** `leading-none` (1.0) ou `leading-[1.08]` - `leading-[1.2]`
- **Body Text:** `leading-[1.6]` - `leading-[1.7]`
- **UI Elements:** `leading-none` para alinhamento perfeito em botões/badges
- **Small Text:** `leading-[1.4]` - `leading-[1.5]`

---

## Letter Spacing

- **Normal:** Padrão para body text
- **Tight:** `tracking-[-0.02em]` - `tracking-[-0.01em]` para display titles
- **Wide:** `tracking-[0.06em]` - `tracking-[0.1em]` para uppercase labels/badges

---

## Boas Práticas

1. ✅ **Space Grotesk** APENAS para títulos e números grandes
2. ✅ **Sora** para TODO o resto (corpo, UI, labels)
3. ✅ Usar `leading-none` em elementos inline (badges, botões)
4. ✅ Usar `leading-[1.6]` ou `[1.7]` em parágrafos
5. ✅ Uppercase labels sempre em Sora, não em Space Grotesk
6. ✅ Font weight 600 (semibold) para CTAs e botões
7. ✅ Font weight 500 (medium) para navegação e links secundários
8. ✅ Clamp() para títulos responsivos
9. ✅ Tamanhos fixos para UI elements (botões, inputs, labels)
10. ✅ Letter-spacing negativo em display titles para melhor legibilidade
