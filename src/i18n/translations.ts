export type Language = "ro" | "en" | "es";

export const translations: Record<Language, Record<string, string>> = {
  ro: {
    // Hero
    "hero.location": "Oradea · 2026",
    "hero.title1": "Tango argentinian",
    "hero.title2": "la Oradea",
    "hero.subtitle": "3 luni cu maestrul Francisco Iturrieta din Buenos Aires",
    "hero.description": "Cursuri intensive, practici și milongi pentru toată comunitatea de tango din Oradea.",
    "hero.cta": "Înscrie-te la cursuri",
    "hero.schedule": "Programul complet",
    "hero.urgency": "Locuri limitate – înscrieri până la 1 aprilie 2026",

    // About
    "about.label": "Maestrul invitat",
    "about.name": "Francisco Iturrieta",
    "about.bio1": "Născut și format în Buenos Aires",
    "about.bio2": "Peste 20 de ani de experiență în predare și show-uri internaționale",
    "about.bio3": "Specializat în tango de salon, muzicalitate și improvizație",
    "about.quote": "„Tango este un dialog sincer între două inimi care ascultă aceeași muzică."",

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
    "program.schedule": "Luni & Miercuri, 19:00–21:00",

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
    "events.event1.date": "Mai 2026",
    "events.event1.title": "Milonga de bun venit",
    "events.event1.desc": "Seara de deschidere cu demonstrație de la maestru. Intrare liberă.",
    "events.event2.date": "Mai – Iulie",
    "events.event2.title": "Practici săptămânale",
    "events.event2.desc": "Spațiu sigur pentru exercițiu, întrebări și feedback personalizat.",
    "events.event3.date": "Iulie 2026",
    "events.event3.title": "Gala de final",
    "events.event3.desc": "Show special, invitați din alte orașe și o seară de neuitat.",

    // Info
    "info.label": "Detalii practice",
    "info.title": "Loc, calendar, contribuție",
    "info.location.label": "Locație",
    "info.location.name": "Sala de dans Oradea",
    "info.location.address": "Piața Emanuil Gojdu nr. 45\nOradea, Bihor",
    "info.calendar.label": "Calendar",
    "info.calendar.period": "3 Aprilie – 28 Iunie 2026",
    "info.calendar.details": "Luni & Miercuri\n19:00 – 21:00\n+ milongi în weekenduri",
    "info.pricing.label": "Contribuție",
    "info.pricing.3months": "Pachet 3 luni",
    "info.pricing.monthly": "Pachet lunar",
    "info.pricing.dropin": "Drop-in",
    "info.pricing.note": "Include cursuri + practici + reduceri la milongi.",

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
    "reg.note": "După trimitere, vei primi un email cu toate detaliile (program, plată, recomandări).",
    "reg.errorMsg": "Te rugăm completează numele și emailul.",
    "reg.successMsg": "Înscrierea a fost trimisă! Vei primi un email cu detaliile.",

    // Footer
    "footer.title": "Tango argentinian · Oradea 2026",
    "footer.copy": "© 2026 Toate drepturile rezervate.",
  },

  en: {
    // Hero
    "hero.location": "Oradea · 2026",
    "hero.title1": "Argentine tango",
    "hero.title2": "in Oradea",
    "hero.subtitle": "3 months with maestro Francisco Iturrieta from Buenos Aires",
    "hero.description": "Intensive courses, practices and milongas for the entire tango community in Oradea.",
    "hero.cta": "Sign up for courses",
    "hero.schedule": "Full schedule",
    "hero.urgency": "Limited spots – registration until April 1, 2026",

    // About
    "about.label": "Guest maestro",
    "about.name": "Francisco Iturrieta",
    "about.bio1": "Born and trained in Buenos Aires",
    "about.bio2": "Over 20 years of experience in teaching and international shows",
    "about.bio3": "Specialized in salon tango, musicality and improvisation",
    "about.quote": '"Tango is a sincere dialogue between two hearts listening to the same music."',

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
    "program.schedule": "Monday & Wednesday, 7:00–9:00 PM",

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
    "events.event1.date": "May 2026",
    "events.event1.title": "Welcome milonga",
    "events.event1.desc": "Opening night with a demonstration by the maestro. Free entry.",
    "events.event2.date": "May – July",
    "events.event2.title": "Weekly practices",
    "events.event2.desc": "A safe space for practice, questions and personalized feedback.",
    "events.event3.date": "July 2026",
    "events.event3.title": "Final gala",
    "events.event3.desc": "Special show, guests from other cities and an unforgettable evening.",

    // Info
    "info.label": "Practical details",
    "info.title": "Location, calendar, pricing",
    "info.location.label": "Location",
    "info.location.name": "Dance hall Oradea",
    "info.location.address": "Piața Emanuil Gojdu nr. 45\nOradea, Bihor",
    "info.calendar.label": "Calendar",
    "info.calendar.period": "April 3 – June 28, 2026",
    "info.calendar.details": "Monday & Wednesday\n7:00 – 9:00 PM\n+ milongas on weekends",
    "info.pricing.label": "Pricing",
    "info.pricing.3months": "3-month package",
    "info.pricing.monthly": "Monthly package",
    "info.pricing.dropin": "Drop-in",
    "info.pricing.note": "Includes courses + practices + discounts at milongas.",

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
    "reg.note": "After submitting, you will receive an email with all the details (schedule, payment, recommendations).",
    "reg.errorMsg": "Please fill in your name and email.",
    "reg.successMsg": "Registration submitted! You will receive an email with the details.",

    // Footer
    "footer.title": "Argentine tango · Oradea 2026",
    "footer.copy": "© 2026 All rights reserved.",
  },

  es: {
    // Hero
    "hero.location": "Oradea · 2026",
    "hero.title1": "Tango argentino",
    "hero.title2": "en Oradea",
    "hero.subtitle": "3 meses con el maestro Francisco Iturrieta de Buenos Aires",
    "hero.description": "Cursos intensivos, prácticas y milongas para toda la comunidad de tango en Oradea.",
    "hero.cta": "Inscribite a los cursos",
    "hero.schedule": "Programa completo",
    "hero.urgency": "Cupos limitados – inscripciones hasta el 1 de abril de 2026",

    // About
    "about.label": "Maestro invitado",
    "about.name": "Francisco Iturrieta",
    "about.bio1": "Nacido y formado en Buenos Aires",
    "about.bio2": "Más de 20 años de experiencia en enseñanza y shows internacionales",
    "about.bio3": "Especializado en tango de salón, musicalidad e improvisación",
    "about.quote": "«El tango es un diálogo sincero entre dos corazones que escuchan la misma música.»",

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
    "program.schedule": "Lunes y miércoles, 19:00–21:00",

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
    "events.event1.date": "Mayo 2026",
    "events.event1.title": "Milonga de bienvenida",
    "events.event1.desc": "Noche de apertura con demostración del maestro. Entrada libre.",
    "events.event2.date": "Mayo – Julio",
    "events.event2.title": "Prácticas semanales",
    "events.event2.desc": "Espacio seguro para practicar, preguntar y recibir feedback personalizado.",
    "events.event3.date": "Julio 2026",
    "events.event3.title": "Gala final",
    "events.event3.desc": "Show especial, invitados de otras ciudades y una noche inolvidable.",

    // Info
    "info.label": "Detalles prácticos",
    "info.title": "Lugar, calendario, precios",
    "info.location.label": "Ubicación",
    "info.location.name": "Sala de baile Oradea",
    "info.location.address": "Piața Emanuil Gojdu nr. 45\nOradea, Bihor",
    "info.calendar.label": "Calendario",
    "info.calendar.period": "3 de abril – 28 de junio de 2026",
    "info.calendar.details": "Lunes y miércoles\n19:00 – 21:00\n+ milongas los fines de semana",
    "info.pricing.label": "Precios",
    "info.pricing.3months": "Paquete 3 meses",
    "info.pricing.monthly": "Paquete mensual",
    "info.pricing.dropin": "Drop-in",
    "info.pricing.note": "Incluye cursos + prácticas + descuentos en milongas.",

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
    "reg.note": "Después de enviar, recibirás un email con todos los detalles (programa, pago, recomendaciones).",
    "reg.errorMsg": "Por favor completá tu nombre y email.",
    "reg.successMsg": "¡Inscripción enviada! Recibirás un email con los detalles.",

    // Footer
    "footer.title": "Tango argentino · Oradea 2026",
    "footer.copy": "© 2026 Todos los derechos reservados.",
  },
};
