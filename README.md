# BioBin X

**Et datadrevet system som hjelper skoler og kommuner med å redusere matsvinn, spare kostnader og samle miljødata.**

---

## 🚀 Kort forklart

BioBin X er et smart system som hjelper skoler og kommuner med å:

- ✅ **Redusere matavfall** – gjennom bevisstgjøring og gamification
- ✅ **Samle verdifull data** – om avfallsmønstre og miljøpåvirkning
- ✅ **Engasjere elever** – gjennom teknologi, poeng og konkurranser
- ✅ **Dokumentere resultater** – for kommunale rapporteringskrav

📊 **Resultat:** Mindre avfall. Lavere kostnader. Bedre miljødata.

---

## 📸 Demo

[Skjermbilde av elev-dashboard]

[Skjermbilde av lærer-dashboard]

[Skjermbilde av live quiz]

---

## 🚧 Status

- ✅ Prototype utviklet (web-app)
- ✅ Funksjonell registrering av data
- ✅ AI-genererte quizzer
- ✅ Klar for pilot-testing

---

## 📋 Funksjoner

### Elever
- 📷 Skann matavfall med kamera (AI-gjenkjenning)
- 🏆 Poengsystem + EcoPoints
- 🎨 Badge-system (Første kast, 10kg, 50kg, 100kg)
- 📊 Personlig dashboard med statistikk
- 🎮 Delta i live quiz (PIN-basert)
- 📈 Ukentlige utfordringer

### Lærere
- 📚 Opprett klasser med invitasjonskode
- 📊 Klassestatistikk (avfall, CO₂, poeng)
- 🤖 AI-assistent for dataanalyse
- 🎯 Start live quiz med AI-genererte spørsmål
- 📥 Eksporter data til CSV

### Administratorer
- 🏫 Oversikt over alle skoler og klasser
- 👥 Administrere brukere og administratorer
- 📈 Total statistikk

### Quiz
- ✨ AI-genererte spørsmål (Groq API)
- 🔢 PIN-basert påmelding
- ⚡ Sanntid poengberegning (riktig + hurtig = flere poeng)
- 🏅 EcoPoints til topp 3

---

## ❓ Hva er problemet?

| Problem | Konsekvens |
|---------|-----------|
| 40 kg mat kastes per nordmann årlig | Metan-utslipp (25x kraftigere enn CO₂) |
| Unge mangler kunnskap | Ingen forståelse for sammenheng mat-klima |
| Kommuner mangler data | Vanskelig å måle effekten av tiltak |

---

## 💡 Løsningen

BioBin X lar elever registrere matavfall med et klikk:

| Hva skjer | Resultat |
|-----------|----------|
| Elev scanner mat | +10 poeng, +0.8 kg CO₂ spart |
| Data samles | Kommunen får oversikt |
| Engasjement økes | Klasser konkurrerer |

*Tallene er estimater basert på forskning og modeller.*

---

## 🏛️ For kommuner

- **Miljørapportering** – Reelle data for kommunale krav
- **Kostnadseffektivitet** – Mindre matsvinn = lavere kostnader
- **Bærekraftsmål** – Bidrar til FNs mål 12.3, 13 og 7

---

## 📊 Miljøpåvirkning (estimater)

| Per 1000 kg matavfall | Verdi |
|----------------------|-------|
| CO₂ spart | ~800 kg |
| Deponikostnad unngått | ~500 kr |

| Per skole (300 elever) / år | Verdi |
|-----------------------------|-------|
| CO₂ spart | ~1,600 kg |
| Ekvivalent med | ~20 trær plantet |

---

## 🤝 Samarbeid

Interessert i å teste BioBin X?

📧 [din e-post]

---

## 🛠️ Kom i gang

```bash
git clone https://github.com/dittbrukernavn/biobin-x.git
cd biobin-x
npm install
cp .env.example .env.local
# Fyll inn Firebase-nøkler og Groq API-nøkkel
npm run dev
```

**Krav:**
- Firebase-prosjekt (Authentication + Firestore)
- Groq API-nøkkel ([console.groq.com](https://console.groq.com))

---

## 🏗️ Tech Stack

Next.js · React · Tailwind · Firebase · TensorFlow.js · Groq API · Vercel
