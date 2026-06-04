# 🚀 Guia de Deploy a Vercel

## Tenim Tot Preparat! 

El projecte ja està:
- ✅ Configurat amb Next.js
- ✅ Connectat a Supabase
- ✅ Amb Git inicialitzat
- ✅ Tot llit per a deploy

## Pas 1: Crear Repositori a GitHub

1. Entra a [https://github.com/new](https://github.com/new)
2. Omple:
   - **Repository name:** `escola-musica-admin`
   - **Description:** Aplicació de gestió per a escola de música
   - **Public** (recomanat) o Private
3. Click "Create repository"
4. **Copia la URL HTTPS** que apareix (exemple: `https://github.com/TU_USERNAME/escola-musica-admin.git`)

## Pas 2: Push a GitHub

### Opció A: Usar el Script (Més fàcil)

```bash
cd /home/claude
./deploy.sh https://github.com/TU_USERNAME/escola-musica-admin.git
```

Substitueix `TU_USERNAME` per el teu usuari de GitHub.

### Opció B: Comandos Manuals

```bash
cd /home/claude
git remote add origin https://github.com/TU_USERNAME/escola-musica-admin.git
git branch -M main
git push -u origin main
```

## Pas 3: Deploy a Vercel

### Opció A: Integració Automàtica (Recomanat)

1. Entra a [https://vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Click "Import Git Repository"
4. **Connecta la teva compte GitHub** (si no està)
5. Selecciona el repositori `escola-musica-admin`
6. Vercel detectarà **Next.js** automàticament
7. Click "Deploy"
8. **Espera 2-3 minuts** ✨

### Opció B: Usar Vercel CLI

```bash
cd /home/claude
npm install -g vercel
vercel
# Segueix els passos interactius
```

## ✅ Verifica el Deploy

Un cop finalitzat:
- Rebràs un email de Vercel amb la URL
- La URL serà algo com: `https://escola-musica-admin.vercel.app`
- Accedeix a la web i prova les funcionalitats!

## 🔐 Variables d'Entorn (Opcional)

Si vols mantenir les credencials de Supabase segures, crea un `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://nhfkkznbigrluumhvipw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

## 🎯 Estat del Projecte

| Component | Status | Notes |
|-----------|--------|-------|
| Next.js | ✅ | Configurat i llit |
| React | ✅ | Aplicació completa |
| Supabase | ✅ | 10 taules creades |
| Git | ✅ | 2 commits |
| Vercel | ⏳ | Pendent de deploy |
| GitHub | ⏳ | Pendent de crear repo |

## 📞 Problemes Comuns

### "Error: Permission denied"
- Verifica que tens les credencials de GitHub correctes
- Potser necessites SSH en lloc de HTTPS

### "Module not found"
- Executa `npm install` a la carpeta del projecte

### Vercel no detecta Next.js
- Verifica que `package.json` està al root
- Verifica que `next.config.js` existeix

### La web apareix en blanc
- Comprova la consola del navegador (F12)
- Verifica que Supabase està accessible

## 🎉 Felicitats!

Un cop estigui en viu, tens:
- ✅ Web accessible 24/7
- ✅ Base de dades en el cloud
- ✅ Deploy automàtic amb cada push a GitHub
- ✅ HTTPS segur
- ✅ CDN global

---

**Necesites ajuda?** Contacta amb l'equip de desenvolupament.
