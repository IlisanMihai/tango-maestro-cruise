export type Language = "ro" | "en" | "es";

export const translations: Record<Language, Record<string, string>> = {
  ro: {
    // Hero
    "hero.location": "Oradea · 2026",
    "hero.title1": "Tango argentinian",
    "hero.title2": "la Oradea",
    "hero.subtitle": "3 luni cu maestrul Francisco Iturrieta din Argentina",
    "hero.description": "Cursuri intensive, practici și milongi pentru toată comunitatea de tango din Oradea.",
    "hero.cta": "Înscrie-te la cursuri",
    "hero.schedule": "Programul complet",
    "hero.urgency": "Locuri limitate – înscrieri până la 1 aprilie 2026",

    // About
    "about.label": "Maestrul invitat",
    "about.name": "Francisco Iturrieta",
    "about.bio1": "Născut și format în Argentina",
    "about.bio2": "Francisco Iturrieta a început să studieze tango argentinian în 1995, alături de legendarul Norberto “El Pulpo” Esbrez, una dintre figurile emblematice ale tangoului din Buenos Aires. La câțiva ani după, Francisco a început și să predea tango, iar de atunci continuă să transmită această pasiune mai departe, formând dansatori și comunități de tango de-a lungul unei cariere profesionale de aproape 30 de ani",
    "about.bio3": "Experiența sa cuprinde toate stilurile tangoului, de la canyengue, salón și milonguero, până la tango de scenă și tango nuevo, oferindu-i o perspectivă bogată și autentică asupra acestui dans",
    "about.quote": "\u201ETango-ul este mai mult decât un dans — este o experiență senzorială care depășește mișcarea corporală, deoarece este un dans al îmbrățișării care generează stare de bine, o formă de comunicare, prezență și conexiune.\u201D",

    // Breath
    "breath.quote": "Fiecare pas este o conversație. Fiecare pauză, o promisiune.",

    // Program
    "program.label": "Programul în Oradea",
    "program.title": "Structurat pe 3 luni",
    "program.subtitle": "Pentru toate nivelurile.",
    "program.month": "Luna",
    "program.month1.title": "Fundament și conexiune",
    "program.month1.desc": "Poziție, caminată, abrazo, conexiune și ritm de bază. Construim fundația pe care se clădește fiecare pas.",
    "program.month2.title": "Muzicalitate și improvizație",
    "program.month2.desc": "Pași combinați, joc cu ritmul, introducere în vals și milonga. Începem să ascultăm muzica cu tot corpul.",
    "program.month3.title": "Eleganță și expresie",
    "program.month3.desc": "Giros, sacadas, secvențe pentru milongă și finețe în mișcare. Rafinăm și pregătim dansul pentru scenă.",
    "program.schedule": "Miercuri & Vineri, 19:00–21:00",

    // Levels
    "levels.label": "Pentru fiecare nivel",
    "levels.title": "Pentru cine sunt cursurile?",
    "levels.beginner": "Începători absoluți",
    "levels.beginner.text": "Nu ai dansat niciodată tango? Începem de la zero, cu răbdare și bucurie.",
    "levels.intermediate": "Intermediari",
    "levels.intermediate.text": "Ai deja câteva luni sau ani de tango. Rafinăm tehnica și conexiunea.",
    "levels.advanced": "Avansați",
    "levels.advanced.text": "Lucrăm pe muzicalitate, improvizație și calitatea mișcării.",

    // Events
    "events.label": "Dincolo de cursuri",
    "events.title": "Seri de tango în Oradea",
    "events.event1.date": "4 Aprilie 2026",
    "events.event1.title": "Milonga de bun venit",
    "events.event1.desc": "Seara de deschidere cu maestrul Francisco Iturrieta ca DJ",
    "events.event2.date": "Aprilie – Iunie 2026",
    "events.event2.title": "Practici săptămânale si milongi lunare",
    "events.event2.desc": "Spațiu sigur pentru exercițiu, întrebări și feedback personalizat.",
    "events.event3.date": "27 Iunie 2026",
    "events.event3.title": "Milonga de ramas bun",
    "events.event3.desc": "Show special, invitați din alte orașe și o seară de neuitat.",

    // Info
    "info.label": "Detalii practice",
    "info.title": "Loc, calendar, contribuție",
    "info.location.label": "Locație",
    "info.location.name": "Feeling Dance Studio",
    "info.location.address": "Strada Vasile Alecsandri nr 12\nOradea, Bihor",
    "info.calendar.label": "Calendar",
    "info.calendar.period": "3 Aprilie – 28 Iunie 2026",
    "info.calendar.details": "Miercuri & Vineri\n19:00 – 21:00\nDuminica 18:00 – 22:00\npractica si milonga",
    "info.pricing.label": "Contribuție",
    "info.pricing.3months": "Pachet 3 luni",
    "info.pricing.monthly": "Pachet lunar",
    "info.pricing.dropin": "Drop-in",
    "info.pricing.note": "Include cursuri + practici + milongi.",

    // Testimonials
    "testimonials.label": "Comunitate",
    "testimonials.title": "Ce spun dansatorii din Oradea",
    "testimonials.t1.text": "Am venit fără nicio experiență și am plecat cu o pasiune nouă. Atmosfera este caldă, iar maestrul are un dar unic de a te face să simți muzica.",
    "testimonials.t1.name": "Ana M.",
    "testimonials.t1.level": "Începătoare",
    "testimonials.t2.text": "După 3 ani de tango, credeam că știu totul. Acest curs mi-a deschis ochii asupra muzicalității și a calității mișcării.",
    "testimonials.t2.name": "Radu P.",
    "testimonials.t2.level": "Avansat",
    "testimonials.t3.text": "Practicile săptămânale sunt locul unde am învățat cel mai mult. Feedback-ul direct de la maestru face toată diferența.",
    "testimonials.t3.name": "Elena T.",
    "testimonials.t3.level": "Intermediară",

    // Registration
    "reg.label": "Fă primul pas",
    "reg.title": "Rezervă-ți locul",
    "reg.name": "Nume complet",
    "reg.email": "Email",
    "reg.phone": "Telefon (opțional)",
    "reg.beginner": "Începător",
    "reg.intermediate": "Intermediar",
    "reg.advanced": "Avansat",
    "reg.pkg3": "Pachet 3 luni",
    "reg.pkgMonthly": "Pachet lunar",
    "reg.pkgDropin": "Drop-in",
    "reg.submit": "Trimite înscrierea",
    "reg.note": "După trimitere, vei primi un email cu toate detaliile (locatie, program, recomandări).",
    "reg.errorMsg": "Te rugăm completează numele și emailul.",
    "reg.successMsg": "Înscrierea a fost trimisă! Vei primi un email cu detaliile.",
    "reg.submitError": "Eroare la trimitere.",
    "reg.loading": "Se trimite...",

    // Footer
    "footer.title": "Tango argentinian · Oradea 2026",
    "footer.copy": "© 2026 Toate drepturile rezervate.",
  },

  en: {
    // Hero
    "hero.location": "Oradea · 2026",
    "hero.title1": "Argentine tango",
    "hero.title2": "in Oradea",
    "hero.subtitle": "3 months with maestro Francisco Iturrieta from Argentina",
    "hero.description": "Intensive courses, practices and milongas for the entire tango community in Oradea.",
    "hero.cta": "Sign up for courses",
    "hero.schedule": "Full schedule",
    "hero.urgency": "Limited spots – registration until April 1, 2026",

    // About
    "about.label": "Guest maestro",
    "about.name": "Francisco Iturrieta",
    "about.bio1": "Born and trained in Argentina",
    "about.bio2": "Began studying Argentine tango in 1995 with the legendary Norberto “El Pulpo” Esbrez, one of the most emblematic figures of tango in Buenos Aires. Several years after, Francisco also began teaching tango, and since then he has continued to share this passion, training dancers and tango communities for almost 30 years.",
    "about.bio3": "His experience encompasses all styles of tango, from canyengue, salon, and milonguero, to stage tango and nuevo tango, giving him a rich and authentic perspective on this dance.",
    "about.quote": "\u201CTango is more than a dance-it is a sensory experience that transcends the physical because it is a dance of embraces that generate well-being, a form of communication, presence, and connection.\u201D",

    // Breath
    "breath.quote": "Every step is a conversation. Every pause, a promise.",

    // Program
    "program.label": "Program in Oradea",
    "program.title": "Structured over 3 months",
    "program.subtitle": "For all levels.",
    "program.month": "Month",
    "program.month1.title": "Foundation and connection",
    "program.month1.desc": "Posture, caminata, abrazo, connection and basic rhythm. We build the foundation upon which every step is built.",
    "program.month2.title": "Musicality and improvisation",
    "program.month2.desc": "Combined steps, rhythm play, introduction to vals and milonga. We begin to listen to the music with our whole body.",
    "program.month3.title": "Elegance and expression",
    "program.month3.desc": "Giros, sacadas, sequences for milonga and movement finesse. We refine and prepare the dance for the stage.",
    "program.schedule": "Wednesday & Friday, 7:00–9:00 PM",

    // Levels
    "levels.label": "For every level",
    "levels.title": "Who are the courses for?",
    "levels.beginner": "Absolute beginners",
    "levels.beginner.text": "Never danced tango before? We start from zero, with patience and joy.",
    "levels.intermediate": "Intermediate",
    "levels.intermediate.text": "You already have a few months or years of tango. We refine technique and connection.",
    "levels.advanced": "Advanced",
    "levels.advanced.text": "We work on musicality, improvisation and movement quality.",

    // Events
    "events.label": "Beyond the courses",
    "events.title": "Tango evenings in Oradea",
    "events.event1.date": "4th April 2026",
    "events.event1.title": "Welcome milonga",
    "events.event1.desc": "Opening night with maestro as DJ.",
    "events.event2.date": "April – June 2026",
    "events.event2.title": "Weekly practices and monthly milongas",
    "events.event2.desc": "A safe space for practice, questions and personalized feedback.",
    "events.event3.date": "27th June 2026",
    "events.event3.title": "Goodbye milonga",
    "events.event3.desc": "Special show, guests from other cities and an unforgettable evening.",

    // Info
    "info.label": "Practical details",
    "info.title": "Location, calendar, pricing",
    "info.location.label": "Location",
    "info.location.name": "Feeling Dance Studio",
    "info.location.address": "Strada Vasile Alecsandri nr 12\nOradea, Bihor",
    "info.calendar.label": "Calendar",
    "info.calendar.period": "April 3 – June 28, 2026",
    "info.calendar.details": "Monday & Wednesday\n7:00 – 9:00 PM\nSunday 06:00 – 10:00 PM\npractice and milonga",
    "info.pricing.label": "Pricing",
    "info.pricing.3months": "3-month package",
    "info.pricing.monthly": "Monthly package",
    "info.pricing.dropin": "Drop-in",
    "info.pricing.note": "Includes courses + practices + milongas.",

    // Testimonials
    "testimonials.label": "Community",
    "testimonials.title": "What dancers in Oradea say",
    "testimonials.t1.text": "I came with no experience and left with a new passion. The atmosphere is warm, and the maestro has a unique gift of making you feel the music.",
    "testimonials.t1.name": "Ana M.",
    "testimonials.t1.level": "Beginner",
    "testimonials.t2.text": "After 3 years of tango, I thought I knew everything. This course opened my eyes to musicality and movement quality.",
    "testimonials.t2.name": "Radu P.",
    "testimonials.t2.level": "Advanced",
    "testimonials.t3.text": "The weekly practices are where I learned the most. Direct feedback from the maestro makes all the difference.",
    "testimonials.t3.name": "Elena T.",
    "testimonials.t3.level": "Intermediate",

    // Registration
    "reg.label": "Take the first step",
    "reg.title": "Reserve your spot",
    "reg.name": "Full name",
    "reg.email": "Email",
    "reg.phone": "Phone (optional)",
    "reg.beginner": "Beginner",
    "reg.intermediate": "Intermediate",
    "reg.advanced": "Advanced",
    "reg.pkg3": "3-month package",
    "reg.pkgMonthly": "Monthly package",
    "reg.pkgDropin": "Drop-in",
    "reg.submit": "Submit registration",
    "reg.note": "After submitting, you will receive an email with all the details (location, schedule, recommendations).",
    "reg.errorMsg": "Please fill in your name and email.",
    "reg.successMsg": "Registration submitted! You will receive an email with the details.",
    "reg.submitError": "Something went wrong while submitting the registration.",
    "reg.loading": "Sending...",

    // Footer
    "footer.title": "Argentine tango · Oradea 2026",
    "footer.copy": "© 2026 All rights reserved.",
  },

  es: {
    // Hero
    "hero.location": "Oradea · 2026",
    "hero.title1": "Tango argentino",
    "hero.title2": "en Oradea",
    "hero.subtitle": "3 meses con el maestro Francisco Iturrieta de Argentina",
    "hero.description": "Cursos intensivos, prácticas y milongas para toda la comunidad de tango en Oradea.",
    "hero.cta": "Inscribite a los cursos",
    "hero.schedule": "Programa completo",
    "hero.urgency": "Cupos limitados – inscripciones hasta el 1 de abril de 2026",

    // About
    "about.label": "Maestro invitado",
    "about.name": "Francisco Iturrieta",
    "about.bio1": "Nacido y formado en Argentina",
    "about.bio2": "Comenzó a estudiar tango argentino en 1995, junto al legendario Norberto “El Pulpo” Esbrez, una de las figuras emblemáticas del tango en Buenos Aires. Varios años después, Francisco también comenzó a enseñar tango, y desde entonces continua transmitiendo esta pasión, formando a bailarines y comunidades de tango por casi 30 años de trayectoria profesional.",
    "about.bio3": "Su experiencia abarca todos los estilos del tango, desde el canyengue, el salón y el milonguero, hasta el tango de escenario y tango nuevo, lo que le otorga una perspectiva rica y auténtica de este baile.",
    "about.quote": "«El tango es más que un baile, es una experiencia sensorial que trasciende lo corporal porque es un baile de abrazos que generan bienestar, una forma de comunicación, presencia y conexión.»",

    // Breath
    "breath.quote": "Cada paso es una conversación. Cada pausa, una promesa.",

    // Program
    "program.label": "Programa en Oradea",
    "program.title": "Estructurado en 3 meses",
    "program.subtitle": "Para todos los niveles.",
    "program.month": "Mes",
    "program.month1.title": "Fundamento y conexión",
    "program.month1.desc": "Postura, caminata, abrazo, conexión y ritmo básico. Construimos la base sobre la que se edifica cada paso.",
    "program.month2.title": "Musicalidad e improvisación",
    "program.month2.desc": "Pasos combinados, juego con el ritmo, introducción al vals y milonga. Empezamos a escuchar la música con todo el cuerpo.",
    "program.month3.title": "Elegancia y expresión",
    "program.month3.desc": "Giros, sacadas, secuencias para milonga y fineza en el movimiento. Refinamos y preparamos el baile para el escenario.",
    "program.schedule": "Miércoles y Viernes, 19:00–21:00",

    // Levels
    "levels.label": "Para cada nivel",
    "levels.title": "¿Para quién son los cursos?",
    "levels.beginner": "Principiantes absolutos",
    "levels.beginner.text": "¿Nunca bailaste tango? Empezamos desde cero, con paciencia y alegría.",
    "levels.intermediate": "Intermedios",
    "levels.intermediate.text": "Ya tenés algunos meses o años de tango. Refinamos la técnica y la conexión.",
    "levels.advanced": "Avanzados",
    "levels.advanced.text": "Trabajamos musicalidad, improvisación y calidad del movimiento.",

    // Events
    "events.label": "Más allá de los cursos",
    "events.title": "Noches de tango en Oradea",
    "events.event1.date": "4 de abril de 2026",
    "events.event1.title": "Milonga de bienvenida",
    "events.event1.desc": "Noche de apertura con maestro como DJ.",
    "events.event2.date": "Abril – Junio de 2026",
    "events.event2.title": "Prácticas semanales y milongas mensuales",
    "events.event2.desc": "Espacio seguro para practicar, preguntar y recibir feedback personalizado.",
    "events.event3.date": "27 de junio de 2026",
    "events.event3.title": "Milonga de despedida",
    "events.event3.desc": "Show especial, invitados de otras ciudades y una noche inolvidable.",

    // Info
    "info.label": "Detalles prácticos",
    "info.title": "Lugar, calendario, precios",
    "info.location.label": "Ubicación",
    "info.location.name": "Feeling Dance Studio",
    "info.location.address": "Strada Vasile Alecsandri nr 12\nOradea, Bihor",
    "info.calendar.label": "Calendario",
    "info.calendar.period": "3 de abril – 28 de junio de 2026",
    "info.calendar.details": "Miércoles y Viernes\n19:00 – 21:00\nDomingo 18:00 – 22:00\npractica y milonga",
    "info.pricing.label": "Precios",
    "info.pricing.3months": "Paquete 3 meses",
    "info.pricing.monthly": "Paquete mensual",
    "info.pricing.dropin": "Drop-in",
    "info.pricing.note": "Incluye cursos + prácticas + milongas.",

    // Testimonials
    "testimonials.label": "Comunidad",
    "testimonials.title": "Lo que dicen los bailarines de Oradea",
    "testimonials.t1.text": "Llegué sin experiencia y me fui con una pasión nueva. El ambiente es cálido y el maestro tiene un don único para hacerte sentir la música.",
    "testimonials.t1.name": "Ana M.",
    "testimonials.t1.level": "Principiante",
    "testimonials.t2.text": "Después de 3 años de tango, creía saberlo todo. Este curso me abrió los ojos sobre la musicalidad y la calidad del movimiento.",
    "testimonials.t2.name": "Radu P.",
    "testimonials.t2.level": "Avanzado",
    "testimonials.t3.text": "Las prácticas semanales son donde más aprendí. El feedback directo del maestro marca toda la diferencia.",
    "testimonials.t3.name": "Elena T.",
    "testimonials.t3.level": "Intermedia",

    // Registration
    "reg.label": "Dá el primer paso",
    "reg.title": "Reservá tu lugar",
    "reg.name": "Nombre completo",
    "reg.email": "Email",
    "reg.phone": "Teléfono (opcional)",
    "reg.beginner": "Principiante",
    "reg.intermediate": "Intermedio",
    "reg.advanced": "Avanzado",
    "reg.pkg3": "Paquete 3 meses",
    "reg.pkgMonthly": "Paquete mensual",
    "reg.pkgDropin": "Drop-in",
    "reg.submit": "Enviar inscripción",
    "reg.note": "Después de enviar, recibirás un email con todos los detalles (programa, recomendaciones).",
    "reg.errorMsg": "Por favor completá tu nombre y email.",
    "reg.successMsg": "¡Inscripción enviada! Recibirás un email con los detalles.",
    "reg.submitError": "Se produjo un error al enviar el registro.",
    "reg.loading": "Enviando...",

    // Footer
    "footer.title": "Tango argentino · Oradea 2026",
    "footer.copy": "© 2026 Todos los derechos reservados.",
  },
};
