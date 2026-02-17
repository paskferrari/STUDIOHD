// Italian Translations - Studio Hub Elite
// Complete localization for the entire app

export default {
  // ============== COMMON ==============
  common: {
    loading: 'Caricamento...',
    error: 'Errore',
    success: 'Successo',
    cancel: 'Annulla',
    confirm: 'Conferma',
    save: 'Salva',
    delete: 'Elimina',
    edit: 'Modifica',
    close: 'Chiudi',
    back: 'Indietro',
    next: 'Avanti',
    skip: 'Salta',
    done: 'Fatto',
    seeAll: 'Vedi tutto',
    viewAll: 'Vedi tutti',
    retry: 'Riprova',
    search: 'Cerca',
    filter: 'Filtra',
    sort: 'Ordina',
    yes: 'Sì',
    no: 'No',
    ok: 'OK',
    and: 'e',
    or: 'o',
    of: 'di',
  },

  // ============== TIME ==============
  time: {
    justNow: 'Adesso',
    minutesAgo: '{{count}} minuto fa',
    minutesAgo_plural: '{{count}} minuti fa',
    hoursAgo: '{{count}} ora fa',
    hoursAgo_plural: '{{count}} ore fa',
    daysAgo: '{{count}} giorno fa',
    daysAgo_plural: '{{count}} giorni fa',
    today: 'Oggi',
    yesterday: 'Ieri',
    thisWeek: 'Questa settimana',
    thisMonth: 'Questo mese',
    at: 'alle',
  },

  // ============== AUTH ==============
  auth: {
    login: 'Accedi',
    logout: 'Esci',
    logoutConfirm: 'Sei sicuro di voler uscire?',
    continueWithGoogle: 'Continua con Google',
    welcomeBack: 'Bentornato',
    authenticating: 'Autenticazione in corso...',
    authError: 'Autenticazione fallita',
    redirecting: 'Reindirizzamento...',
    termsAgreement: 'Continuando, accetti i nostri Termini di Servizio e la Privacy Policy',
  },

  // ============== NAVIGATION ==============
  nav: {
    home: 'Home',
    attendance: 'Presenze',
    music: 'Musica',
    gaming: 'Gaming',
    rankings: 'Classifiche',
    profile: 'Profilo',
    settings: 'Impostazioni',
    help: 'Aiuto',
  },

  // ============== ONBOARDING ==============
  onboarding: {
    // Welcome
    welcome: {
      title: 'Benvenuto in Studio Hub Elite',
      subtitle: 'La tua community privata per lo studio di registrazione',
      tagline: 'La Tua Community Privata di Registrazione',
    },
    
    // Profile Setup
    profileSetup: {
      title: 'Configura il Tuo Profilo',
      subtitle: 'Parlaci di te per personalizzare la tua esperienza',
      step: 'Passo {{current}} di {{total}}',
      displayName: 'Nome visualizzato',
      displayNamePlaceholder: 'Inserisci il tuo nome',
      usingGooglePhoto: 'Utilizzo della foto del profilo Google',
    },
    
    // Interests
    interests: {
      title: 'I Tuoi Interessi',
      subtitle: 'Seleziona tutti quelli che ti interessano',
      music: 'Musica',
      gaming: 'Gaming',
      instrument: 'Strumenti',
    },
    
    // Goals
    goals: {
      title: 'Quali Sono i Tuoi Obiettivi?',
      subtitle: 'Seleziona i tuoi obiettivi per personalizzare la tua esperienza',
      improveSkills: 'Migliorare le mie competenze',
      network: 'Fare networking',
      createMusic: 'Creare più musica',
      compete: 'Competere nel gaming',
      collaborate: 'Trovare collaboratori',
      trackProgress: 'Monitorare i miei progressi',
      earnBadges: 'Guadagnare achievement',
      haveFun: 'Divertirmi',
    },
    
    // Tutorial
    tutorial: {
      letsGo: 'Iniziamo!',
      skipTutorial: 'Salta il tutorial',
      startTour: 'Inizia il tour',
      gotIt: 'Capito!',
      
      // Steps
      dashboardTitle: 'La Tua Dashboard',
      dashboardDesc: 'Visualizza il tuo livello, XP, serie attiva e statistiche rapide in un colpo d\'occhio.',
      
      attendanceTitle: 'Registra le Presenze',
      attendanceDesc: 'Fai check-in quando arrivi allo studio per guadagnare XP e mantenere la tua serie.',
      
      musicTitle: 'Tracce Musicali',
      musicDesc: 'Crea tracce, aggiungi contributi e collabora con altri membri.',
      
      gamingTitle: 'Sessioni di Gaming',
      gamingDesc: 'Crea partite, invia punteggi e competi per le classifiche.',
      
      leaderboardTitle: 'Classifiche',
      leaderboardDesc: 'Confronta i tuoi progressi con altri membri in diverse categorie.',
      
      profileTitle: 'Il Tuo Profilo',
      profileDesc: 'Visualizza i tuoi achievement, badge e statistiche complete.',
    },
    
    // Checklist
    checklist: {
      title: 'Inizia Subito',
      completeProfile: 'Completa il profilo',
      firstCheckIn: 'Primo check-in',
      createTrack: 'Crea una traccia',
      joinMatch: 'Partecipa a una partita',
      viewLeaderboard: 'Visualizza le classifiche',
      earnBadge: 'Guadagna un badge',
    },
    
    // Replay
    replayTutorial: 'Ripeti il tutorial',
  },

  // ============== DASHBOARD ==============
  dashboard: {
    welcomeBack: 'Bentornato,',
    yourStats: 'Le Tue Statistiche',
    sessions: 'Sessioni',
    tracks: 'Tracce',
    contributions: 'Contributi',
    matches: 'Partite',
    
    // Level & XP
    level: 'Livello {{level}}',
    xp: 'XP',
    xpToNextLevel: '{{xp}} XP al prossimo livello',
    progress: 'Progresso',
    
    // Streak
    dayStreak: '{{count}} giorno di serie',
    dayStreak_plural: '{{count}} giorni di serie',
    onFire: 'In fiamme!',
    
    // Check-in
    readyToStart: 'Pronto a iniziare?',
    currentlyCheckedIn: 'Attualmente in studio',
    checkInPrompt: 'Fai check-in per monitorare il tuo tempo in studio',
    checkOutPrompt: 'Tocca per fare check-out e guadagnare XP',
    
    // Sessions
    upcomingSessions: 'Prossime Sessioni',
    
    // Activity
    communityActivity: 'Attività della Community',
    noActivity: 'Nessuna attività recente',
    beFirst: 'Sii il primo a fare qualcosa!',
    
    // Badges
    recentBadges: 'Badge Recenti',
  },

  // ============== ATTENDANCE ==============
  attendance: {
    title: 'Presenze',
    
    // Status
    checkedIn: 'Check-in effettuato',
    notCheckedIn: 'Non in studio',
    currentlyCheckedIn: 'Attualmente in studio',
    
    // Actions
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    startedAt: 'Iniziato alle',
    
    // Messages
    checkInSuccess: 'Check-in effettuato!',
    checkInMessage: 'Buona sessione in studio!',
    checkOutSuccess: 'Check-out effettuato!',
    checkOutMessage: 'Sessione completata! Durata: {{duration}} minuti. XP guadagnati: {{xp}}',
    alreadyCheckedIn: 'Sei già in studio',
    notCheckedInError: 'Non hai effettuato il check-in',
    
    // Stats
    totalSessions: 'Sessioni Totali',
    totalTime: 'Tempo Totale',
    xpEarned: 'XP Guadagnati',
    
    // History
    activityLast30: 'Attività (Ultimi 30 Giorni)',
    recentSessions: 'Sessioni Recenti',
    noSessions: 'Nessuna sessione',
    startTracking: 'Fai check-in per iniziare a monitorare!',
    
    // Heatmap
    less: 'Meno',
    more: 'Più',
  },

  // ============== MUSIC ==============
  music: {
    title: 'Musica',
    
    // Tracks
    allTracks: 'Tutte le Tracce',
    createTrack: 'Crea Traccia',
    trackDetails: 'Dettagli Traccia',
    noTracks: 'Nessuna traccia',
    createFirst: 'Crea la prima traccia!',
    
    // Form
    trackTitle: 'Titolo',
    trackTitlePlaceholder: 'Inserisci il titolo della traccia',
    genre: 'Genere',
    genrePlaceholder: 'es. Hip-Hop, R&B, Pop',
    description: 'Descrizione',
    descriptionPlaceholder: 'Descrivi la tua traccia...',
    
    // Contributions
    contributors: 'Collaboratori',
    addContribution: 'Aggiungi Contributo',
    contribution: 'Contributo',
    noContributions: 'Nessun contributo',
    beFirstContributor: 'Sii il primo a contribuire!',
    selectContributionType: 'Seleziona il tipo di contributo',
    contributionAdded: 'Contributo aggiunto! +{{xp}} XP guadagnati',
    
    // Contribution Types
    contributionTypes: {
      vocals: 'Voce',
      beat: 'Beat',
      mix: 'Mix',
      master: 'Master',
      instrument: 'Strumento',
      writing: 'Testi',
      production: 'Produzione',
    },
    
    // Metrics
    totalLikes: 'Mi Piace Totali',
    listens: 'Ascolti',
    likes: 'Mi Piace',
    shares: 'Condivisioni',
    
    // Info
    trackInfo: 'Informazioni Traccia',
    created: 'Creata il',
    duration: 'Durata',
    
    // Messages
    trackCreated: 'Traccia creata! +50 XP guadagnati',
    enterTitle: 'Inserisci un titolo',
    by: 'di',
    you: 'Te',
  },

  // ============== GAMING ==============
  gaming: {
    title: 'Gaming',
    
    // Matches
    activeMatches: 'Partite Attive',
    matchHistory: 'Storico Partite',
    createMatch: 'Crea Partita',
    matchDetails: 'Dettagli Partita',
    noMatches: 'Nessuna partita',
    createFirst: 'Crea una partita per iniziare a competere!',
    
    // Form
    matchTitle: 'Titolo Partita',
    matchTitlePlaceholder: 'es. Torneo del Venerdì Sera',
    gameName: 'Nome Gioco',
    gameNamePlaceholder: 'es. Call of Duty, FIFA 25',
    gameType: 'Tipo di Gioco',
    
    // Game Types
    gameTypes: {
      fps: 'FPS',
      fighting: 'Picchiaduro',
      racing: 'Corse',
      sports: 'Sport',
      strategy: 'Strategia',
      battle_royale: 'Battle Royale',
    },
    
    // Status
    pending: 'In Attesa',
    inProgress: 'In Corso',
    completed: 'Completata',
    
    // Actions
    startMatch: 'Inizia Partita',
    completeMatch: 'Completa Partita',
    submitScore: 'Invia Punteggio',
    completeConfirm: 'Sei sicuro di voler terminare questa partita?',
    
    // Players
    participants: 'Partecipanti',
    players: '{{count}} giocatore',
    players_plural: '{{count}} giocatori',
    
    // Scores
    score: 'Punteggio',
    scorePlaceholder: 'Inserisci il tuo punteggio',
    kills: 'Uccisioni',
    deaths: 'Morti',
    kd: 'K/D',
    
    // Stats
    totalMatches: 'Partite Totali',
    wins: 'Vittorie',
    winRate: 'Percentuale Vittorie',
    
    // Results
    victory: 'Vittoria!',
    winner: 'Vincitore',
    
    // Messages
    matchCreated: 'Partita creata!',
    matchStarted: 'Partita iniziata! Buona fortuna!',
    matchCompleted: 'Partita completata! Vincitore determinato',
    scoreSubmitted: 'Punteggio inviato! XP guadagnati in base alla tua prestazione',
    fillAllFields: 'Compila tutti i campi obbligatori',
    enterScore: 'Inserisci un punteggio',
    
    // Info
    matchInfo: 'Informazioni Partita',
    started: 'Iniziata',
    ended: 'Terminata',
  },

  // ============== LEADERBOARDS ==============
  leaderboards: {
    title: 'Classifiche',
    
    // Categories
    categories: {
      attendance_monthly: 'Campioni di Presenze',
      music_impact: 'Impatto Musicale',
      gaming_ranked: 'Élite del Gaming',
      hybrid_master: 'Maestri Ibridi',
    },
    
    // Descriptions
    descriptions: {
      attendance_monthly: 'Top membri per presenze mensili in studio',
      music_impact: 'Membri con i maggiori contributi musicali',
      gaming_ranked: 'Top gamer per punteggio e vittorie',
      hybrid_master: 'Membri che eccellono in tutte le attività',
    },
    
    // Periods
    periods: {
      weekly: 'Settimanale',
      monthly: 'Mensile',
      seasonal: 'Stagionale',
      all_time: 'Di Sempre',
    },
    
    // Ranking
    rank: 'Posizione',
    yourRank: 'La Tua Posizione',
    points: 'punti',
    
    // Empty
    noRankings: 'Nessuna classifica',
    beFirst: 'Sii il primo a scalare la classifica!',
    
    // Formula
    scoringFormula: 'Formula di Calcolo',
  },

  // ============== GAMIFICATION ==============
  gamification: {
    // XP
    xp: 'XP',
    xpEarned: '+{{xp}} XP guadagnati',
    totalXp: 'XP Totali',
    
    // Level
    level: 'Livello',
    levelUp: 'Livello aumentato!',
    
    // Badges
    badges: 'Badge',
    badgeEarned: 'Badge sbloccato!',
    badgesEarned: '{{count}} guadagnato',
    badgesEarned_plural: '{{count}} guadagnati',
    noBadges: 'Nessun badge',
    earnBadges: 'Completa attività per guadagnare badge!',
    
    // Rarity
    rarity: {
      common: 'Comune',
      rare: 'Raro',
      epic: 'Epico',
      legendary: 'Leggendario',
    },
    
    // Streak
    streak: 'Serie',
    currentStreak: 'Serie Attuale',
    bestStreak: 'Migliore Serie',
  },

  // ============== PROFILE ==============
  profile: {
    title: 'Profilo',
    editProfile: 'Modifica Profilo',
    
    // Stats
    statistics: 'Statistiche',
    achievements: 'Achievement',
    recentActivity: 'Attività Recente',
    
    // Settings
    settings: 'Impostazioni',
    notifications: 'Notifiche',
    helpSupport: 'Aiuto & Supporto',
    
    // Version
    version: 'Studio Hub Elite v{{version}}',
  },

  // ============== HELP CENTER ==============
  help: {
    title: 'Centro Assistenza',
    
    // Sections
    quickStart: 'Guida Rapida',
    faq: 'Domande Frequenti',
    glossary: 'Glossario',
    troubleshooting: 'Risoluzione Problemi',
    contact: 'Contattaci',
    
    // Quick Start Guides
    guides: {
      gettingStarted: 'Come Iniziare',
      trackAttendance: 'Come Registrare le Presenze',
      createMusic: 'Come Creare Tracce Musicali',
      playGames: 'Come Partecipare alle Partite',
      earnBadges: 'Come Guadagnare Badge',
      climbRankings: 'Come Scalare le Classifiche',
    },
    
    // FAQ
    faqItems: {
      whatIsXp: 'Cos\'è l\'XP?',
      whatIsXpAnswer: 'L\'XP (Punti Esperienza) è il sistema di punteggio che misura la tua attività. Guadagni XP facendo check-in, creando tracce, partecipando a partite e contribuendo alla community.',
      
      howLevelUp: 'Come salgo di livello?',
      howLevelUpAnswer: 'Accumula 1.000 XP per salire di un livello. Ogni livello sblocca nuovi badge e aumenta il tuo prestigio nelle classifiche.',
      
      whatAreBadges: 'Cosa sono i badge?',
      whatAreBadgesAnswer: 'I badge sono riconoscimenti speciali per i tuoi traguardi. Variano per rarità: Comune, Raro, Epico e Leggendario.',
      
      whatIsStreak: 'Cos\'è la serie?',
      whatIsStreakAnswer: 'La serie conta i giorni consecutivi in cui hai fatto check-in allo studio. Mantieni la serie per guadagnare bonus XP e badge speciali.',
      
      howLeaderboards: 'Come funzionano le classifiche?',
      howLeaderboardsAnswer: 'Le classifiche si basano su diverse metriche: presenze, contributi musicali, performance nel gaming e attività complessiva. Ogni categoria ha una formula di calcolo specifica.',
    },
    
    // Glossary
    glossaryItems: {
      xp: 'XP - Punti Esperienza guadagnati con le attività',
      level: 'Livello - Il tuo grado basato sugli XP totali',
      streak: 'Serie - Giorni consecutivi di check-in',
      badge: 'Badge - Riconoscimento per i traguardi raggiunti',
      track: 'Traccia - Progetto musicale creato in studio',
      contribution: 'Contributo - La tua partecipazione a una traccia',
      match: 'Partita - Sessione di gioco competitiva',
      checkIn: 'Check-in - Registrazione della presenza in studio',
    },
    
    // Troubleshooting
    troubleshootingItems: {
      cantCheckIn: 'Non riesco a fare check-in',
      cantCheckInSolution: 'Verifica di non essere già in studio. Se il problema persiste, ricarica l\'app.',
      
      xpNotUpdating: 'Gli XP non si aggiornano',
      xpNotUpdatingSolution: 'Gli XP vengono calcolati al check-out. Assicurati di completare la sessione.',
      
      badgeNotShowing: 'Un badge non appare',
      badgeNotShowingSolution: 'I badge possono richiedere alcuni secondi per apparire. Prova ad aggiornare la pagina del profilo.',
    },
  },

  // ============== ERRORS ==============
  errors: {
    generic: 'Si è verificato un errore',
    network: 'Errore di connessione',
    notFound: 'Non trovato',
    unauthorized: 'Non autorizzato',
    forbidden: 'Accesso negato',
    serverError: 'Errore del server',
    tryAgain: 'Riprova più tardi',
    goBack: 'Torna indietro',
  },

  // ============== EMPTY STATES ==============
  empty: {
    noData: 'Nessun dato',
    noResults: 'Nessun risultato',
    comingSoon: 'Prossimamente',
  },

  // ============== FEATURES ==============
  features: {
    trackAttendance: 'Monitora Presenze',
    musicProjects: 'Progetti Musicali',
    gamingSessions: 'Sessioni Gaming',
    leaderboards: 'Classifiche',
  },
};
