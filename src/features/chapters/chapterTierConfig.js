export const NOTE_PALETTES = [
  { bg: '#fff0f3', border: '#ff9ec6', accent: '#ff6b9d' },
  { bg: '#eef6ff', border: '#8fd3ff', accent: '#4da6e8' },
  { bg: '#fefce8', border: '#ffe57f', accent: '#d4a017' },
  { bg: '#f0fdf4', border: '#97eba9', accent: '#4ead6b' },
  { bg: '#faf5ff', border: '#c4b5fd', accent: '#8b5cf6' },
  { bg: '#fff7ed', border: '#fdba74', accent: '#ea7e30' },
  { bg: '#ecfeff', border: '#67e8f9', accent: '#0891b2' },
];

const TIER_LABELS = {
  en: { goldenRetriever: 'Golden Retriever', studentCouncilPresident: 'Student Council President', honorStudent: 'Honor Student', classRepresentative: 'Class Representative', culturalFestivalMvp: 'Cultural Festival MVP', dramaClubStar: 'Drama Club Star', karaokeEnthusiast: 'Karaoke Enthusiast', fraiseCustomer: 'Fraise Customer', tsubameWestVip: 'Tsubame West VIP', studyGroupMember: 'Study Group Member', class13Student: 'Class 1-3 Student', firstDayTransfer: 'First Day Transfer' },
  es: { goldenRetriever: 'Golden Retriever', studentCouncilPresident: 'Presidente del consejo estudiantil', honorStudent: 'Estudiante de honor', classRepresentative: 'Representante de clase', culturalFestivalMvp: 'MVP del festival cultural', dramaClubStar: 'Estrella del club de teatro', karaokeEnthusiast: 'Fan del karaoke', fraiseCustomer: 'Cliente de Fraise', tsubameWestVip: 'VIP de Tsubame West', studyGroupMember: 'Miembro del grupo de estudio', class13Student: 'Estudiante de la clase 1-3', firstDayTransfer: 'Transferido del primer día' },
  pt: { goldenRetriever: 'Golden Retriever', studentCouncilPresident: 'Presidente do conselho estudantil', honorStudent: 'Aluno de honra', classRepresentative: 'Representante de turma', culturalFestivalMvp: 'MVP do festival cultural', dramaClubStar: 'Estrela do clube de teatro', karaokeEnthusiast: 'Fã de karaokê', fraiseCustomer: 'Cliente da Fraise', tsubameWestVip: 'VIP da Tsubame West', studyGroupMember: 'Membro do grupo de estudos', class13Student: 'Aluno da turma 1-3', firstDayTransfer: 'Transferido do primeiro dia' },
  fr: { goldenRetriever: 'Golden Retriever', studentCouncilPresident: 'Président du conseil des élèves', honorStudent: 'Élève d’honneur', classRepresentative: 'Délégué de classe', culturalFestivalMvp: 'MVP du festival culturel', dramaClubStar: 'Star du club de théâtre', karaokeEnthusiast: 'Passionné de karaoké', fraiseCustomer: 'Client de Fraise', tsubameWestVip: 'VIP de Tsubame West', studyGroupMember: 'Membre du groupe d’étude', class13Student: 'Élève de la classe 1-3', firstDayTransfer: 'Nouvel élève du premier jour' },
  de: { goldenRetriever: 'Golden Retriever', studentCouncilPresident: 'Schülerratspräsident', honorStudent: 'Musterschüler', classRepresentative: 'Klassensprecher', culturalFestivalMvp: 'Kulturfest-MVP', dramaClubStar: 'Drama-Club-Star', karaokeEnthusiast: 'Karaoke-Fan', fraiseCustomer: 'Fraise-Stammkunde', tsubameWestVip: 'Tsubame West VIP', studyGroupMember: 'Lerngruppenmitglied', class13Student: 'Schüler der Klasse 1-3', firstDayTransfer: 'Ersttags-Transfer' },
  it: { goldenRetriever: 'Golden Retriever', studentCouncilPresident: 'Presidente del consiglio studentesco', honorStudent: 'Studente modello', classRepresentative: 'Rappresentante di classe', culturalFestivalMvp: 'MVP del festival culturale', dramaClubStar: 'Star del club di teatro', karaokeEnthusiast: 'Appassionato di karaoke', fraiseCustomer: 'Cliente di Fraise', tsubameWestVip: 'VIP di Tsubame West', studyGroupMember: 'Membro del gruppo di studio', class13Student: 'Studente della classe 1-3', firstDayTransfer: 'Trasferito del primo giorno' },
  ja: { goldenRetriever: 'ゴールデンレトリバー', studentCouncilPresident: '生徒会長', honorStudent: '優等生', classRepresentative: '学級委員', culturalFestivalMvp: '文化祭MVP', dramaClubStar: '演劇部の星', karaokeEnthusiast: 'カラオケ好き', fraiseCustomer: 'フレーズ常連', tsubameWestVip: 'つばめ西VIP', studyGroupMember: '勉強会メンバー', class13Student: '1-3組の生徒', firstDayTransfer: '初日転入生' },
};

const getTierLabel = (tierKey, uiLanguage = 'en') => {
  const labels = TIER_LABELS[uiLanguage] || TIER_LABELS.en;
  return labels[tierKey] || TIER_LABELS.en[tierKey] || '';
};

export const getReadTier = (count, uiLanguage = 'en') => {
  if (count >= 100) return { bg: '#0f172a', border: '#fbbf24', text: '#fde047', tint: '#fefce8', accent: '#d97706', label: getTierLabel('goldenRetriever', uiLanguage) };
  if (count >= 90) return { bg: '#be123c', border: '#9f1239', text: '#fff', tint: '#ffe4e6', accent: '#be123c', label: getTierLabel('studentCouncilPresident', uiLanguage) };
  if (count >= 80) return { bg: '#0369a1', border: '#075985', text: '#fff', tint: '#e0f2fe', accent: '#0369a1', label: getTierLabel('honorStudent', uiLanguage) };
  if (count >= 70) return { bg: '#0f766e', border: '#115e59', text: '#fff', tint: '#ccfbf1', accent: '#0f766e', label: getTierLabel('classRepresentative', uiLanguage) };
  if (count >= 60) return { bg: '#a21caf', border: '#86198f', text: '#fff', tint: '#fae8ff', accent: '#a21caf', label: getTierLabel('culturalFestivalMvp', uiLanguage) };
  if (count >= 50) return { bg: '#ef4444', border: '#dc2626', text: '#fff', tint: '#fee2e2', accent: '#dc2626', label: getTierLabel('dramaClubStar', uiLanguage) };
  if (count >= 40) return { bg: '#4338ca', border: '#3730a3', text: '#fff', tint: '#e0e7ff', accent: '#4338ca', label: getTierLabel('karaokeEnthusiast', uiLanguage) };
  if (count >= 30) return { bg: '#8b5cf6', border: '#7c3aed', text: '#fff', tint: '#faf5ff', accent: '#7c3aed', label: getTierLabel('fraiseCustomer', uiLanguage) };
  if (count >= 20) return { bg: '#ec4899', border: '#db2777', text: '#fff', tint: '#fdf2f8', accent: '#db2777', label: getTierLabel('tsubameWestVip', uiLanguage) };
  if (count >= 10) return { bg: '#3b82f6', border: '#2563eb', text: '#fff', tint: '#eff6ff', accent: '#2563eb', label: getTierLabel('studyGroupMember', uiLanguage) };
  if (count >= 5) return { bg: '#10b981', border: '#059669', text: '#fff', tint: '#ecfdf5', accent: '#059669', label: getTierLabel('class13Student', uiLanguage) };
  if (count >= 2) return { bg: '#f97316', border: '#ea580c', text: '#fff', tint: '#fff7ed', accent: '#ea580c', label: getTierLabel('firstDayTransfer', uiLanguage) };
  return { bg: '#f59e0b', border: '#d97706', text: '#fff', tint: '#fffbeb', accent: '#d97706', label: '' };
};
