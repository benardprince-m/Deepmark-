# ADR-002: Brand Design System

## Status
Accepted

## Date
2026-08-04

## Context
DeepMark follows a minimal, professional design language inspired by Apple, Linear, Arc Browser, and Vercel. The color palette must be strictly controlled to maintain brand consistency.

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| White | `#FFFFFF` | Primary canvas |
| Black | `#000000` | Primary text, buttons |
| Light Canvas | `#F6F6F6` | Secondary background |
| Card Surface | `#FFFFFF` | Card backgrounds |
| Primary Text | `#191919` | Main text |
| Secondary Text | `#858585` | Supporting text |
| Tertiary Text | `#B0B0B0` | Placeholder text |
| Border | `#E8E8E8` | Borders, dividers |
| Accent (positive) | `#28C76F` | Success states only |

## Forbidden Colors
- Violet
- Purple
- Indigo
- Blue (for primary actions)
- Pink
- Orange (except `#F59E0B` for warnings)
- Yellow (except warnings)

## Consequences
### Positive
- Consistent, professional appearance
- Clear visual hierarchy
- Easy to maintain

### Negative
- Limited color options for emphasis
- Requires vigilance during code reviews
