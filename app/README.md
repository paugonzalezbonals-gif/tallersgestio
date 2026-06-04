# 🎵 Escola de Música - Sistema d'Administració

Aplicació web completa per gestionar una escola de música amb Supabase.

## ✅ Estat Actual

- ✅ Projecte **Next.js** completament configurat
- ✅ Base de dades **Supabase** creada i connectada
- ✅ Aplicació React funcional amb Next.js
- ✅ Repositori Git inicialitzat amb commit
- ✅ Llista per a deploy a Vercel

## 🚀 Fer Deploy a Vercel

### Opció A: Usar GitHub (Recomanat)

```bash
# 1. Crea un repositori nou a https://github.com/new
# Nom: escola-musica-admin

# 2. Push del codi
git remote add origin https://github.com/TU_USERNAME/escola-musica-admin.git
git branch -M main
git push -u origin main

# 3. A Vercel:
# - Entra a vercel.com
# - "Import Project"
# - Selecciona el repositori de GitHub
# - Deploy automàtic!
```

### Opció B: Usar Vercel CLI

```bash
# 1. Instal·la Vercel CLI
npm install -g vercel

# 2. Deploy
vercel

# 3. Segueix els passos interactius
```

## 🗄️ Estructura del Projecte

```
escola-musica-admin/
├── app/
│   ├── layout.js          # Layout principal
│   ├── page.js            # Aplicació React
│   └── globals.css        # Estilos globals
├── package.json           # Dependències
├── next.config.js         # Configuració Next.js
├── .gitignore            # Arxius a ignorer
└── .git/                 # Repositori Git
```

## 📊 Taules de Supabase Creades

- `students` - Alumnes
- `teachers` - Professors
- `classrooms` - Aules
- `class_types` - Tipus de classes
- `schedules` - Horaris/classes
- `holidays` - Festius
- `invoices` - Factures
- `invoice_items` - Items de factures
- `contact_info` - Informació de contacte
- `users` - Usuaris (admin, professors)
- `school_info` - Dades de l'escola

## 🔐 Credencials Supabase

```
URL: https://nhfkkznbigrluumhvipw.supabase.co
Project ID: nhfkkznbigrluumhvipw
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oZmtrem5iaWdybHV1bWh2aXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NzQ0MTUsImV4cCI6MjA5NjE1MDQxNX0.saHO8140W4Vp3cWiZjL2NiNIpupJvf0eWy_sz4speE4
```

⚠️ Guarda aquestes credencials en un lloc segur!

## 💡 Funcionalitats Implementades

✅ **Dashboard en temps real**
- Aules ocupades avui
- Estado de totes les aules
- Comptadors d'alumnes, professors i aules

✅ **Gestió d'Alumnes**
- Afegir nous alumnes
- Taula amb tots els alumnes
- Control d'estat

✅ **Gestió de Professors**
- Taula de professors
- Especialitats i tarifes

✅ **Gestió d'Aules**
- Taula visual d'aules
- Capacitat i equipament

✅ **Horaris**
- Taula amb totes les classes
- Dia, hora, professor, alumne

✅ **Design Premium**
- Dark mode elegant
- Responsive
- Animacions suaus

## 🎨 Disseny

- **Color primari:** Ambar (#ffa500)
- **Fons:** Dark gradient (#0a0e27 a #16213e)
- **Mode:** Dark
- **Responsive:** Sí

## 📋 Próxims Steps (Opcional)

1. **Autenticació real** - Afegir login/logout
2. **Edició/Borrat** - CRUD complet
3. **Exportar a PDF** - Factures i informes
4. **Notificacions** - Recordatoris de classes
5. **Calendari** - Vista de calendari mensual
6. **Pagaments** - Integració de pagaments

## 🆘 Troubleshooting

### Error de dependències
```bash
npm install
```

### Error de Supabase
- Verifica que les credencials són correctes
- Comprova que les taules existeixen a Supabase

### Error de deploy a Vercel
- Assegura't que el repositori de GitHub està actualitzat
- Verifica que `package.json` és correcte

## 📞 Suport

Per qualsevol pregunta o problema, contacta amb l'equip de desenvolupament.

---

**Data de creació:** 4 de juny de 2026
**Versió:** 1.0.0
**Status:** Llista per a deploy ✅
