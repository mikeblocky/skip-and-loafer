const L = (en, es, pt, fr, de, it) => ({ en, es, pt, fr, de, it });
const repairMojibake = (value) => String(value || '')
  .replaceAll('Ã¡', 'á')
  .replaceAll('Ã©', 'é')
  .replaceAll('Ã­', 'í')
  .replaceAll('Ã³', 'ó')
  .replaceAll('Ãº', 'ú')
  .replaceAll('Ã±', 'ñ')
  .replaceAll('â€™', "'")
  .replaceAll('â€“', '-');
const pick = (value, uiLanguage = 'en') => repairMojibake(typeof value === 'string' ? value : (value?.[uiLanguage] || value?.en || ''));
const option = (text, modifiers) => ({ text, modifiers });

const INSTRUCTIONS = {
  grid: L(
    'Pick the square closest to your real default.',
    'Elige el cuadro mas cercano a tu forma real.',
    'Escolha o quadro mais proximo do seu jeito real.',
    'Choisis la case la plus proche de ton vrai reflexe.',
    'Wahle das Feld, das deinem echten Muster am ehesten entspricht.',
    'Scegli il riquadro piu vicino al tuo modo reale.'
  ),
  sort4: L(
    'Tap all 4 cards from most like you to least like you.',
    'Toca las 4 cartas de mas a menos parecida a ti.',
    'Toque nas 4 cartas da mais parecida com voce ate a menos parecida.',
    'Touchez les 4 cartes de la plus proche a la moins proche de vous.',
    'Tippe alle 4 Karten von am ehesten du bis am wenigsten du.',
    'Tocca le 4 carte dalla piu simile a te alla meno simile.'
  ),
  pairMatch: L(
    'Pick the 2 cards that feel like they naturally belong together for you.',
    'Elige las 2 cartas que sientas que van juntas para ti.',
    'Escolha as 2 cartas que parecem combinar naturalmente para voce.',
    'Choisis les 2 cartes qui vont naturellement ensemble pour toi.',
    'Wahle die 2 Karten die fur dich naturlich zusammengehoren.',
    'Scegli le 2 carte che senti andare naturalmente insieme per te.'
  ),
  hold: L(
    'Press and hold until the amount feels right.',
    'Mantén pulsado hasta que la cantidad se sienta correcta.',
    'Pressione e segure ate a quantidade parecer certa.',
    'Maintiens jusqu a ce que l intensite semble juste.',
    'Halte gedruckt bis sich die Menge richtig anfuhlt.',
    'Tieni premuto finche l intensita sembra giusta.'
  ),
  rhythm: L(
    'Tap 4 times in the pace that feels most like you.',
    'Toca 4 veces con el ritmo que mas se parezca a ti.',
    'Toque 4 vezes no ritmo que mais parece com voce.',
    'Tape 4 fois au rythme qui te ressemble le plus.',
    'Tippe 4 Mal im Tempo das sich am meisten nach dir anfuhlt.',
    'Tocca 4 volte al ritmo che ti somiglia di piu.'
  ),
  constellation: L(
    'Build a 3-step pattern from first instinct to last instinct.',
    'Crea un patron de 3 pasos desde el primer instinto hasta el ultimo.',
    'Monte um padrao de 3 passos do primeiro instinto ao ultimo.',
    'Construis un schema en 3 temps du premier instinct au dernier.',
    'Baue ein Muster in 3 Schritten vom ersten bis zum letzten Instinkt.',
    'Crea un modello in 3 passi dal primo all ultimo istinto.'
  ),
  reaction: L(
    'Start the reflex test, wait for the signal, then tap as fast as you can.',
    'Inicia la prueba de reflejos, espera la senal y luego toca lo mas rapido que puedas.',
    'Inicie o teste de reflexo, espere o sinal e toque o mais rapido que puder.',
    'Lance le test de reflexe, attends le signal puis touche le plus vite possible.',
    'Starte den Reaktionstest, warte auf das Signal und tippe dann so schnell wie moglich.',
    'Avvia il test di riflessi, aspetta il segnale e poi tocca il piu velocemente possibile.'
  ),
  timing: L(
    'Start the meter and stop it inside the target zone.',
    'Inicia el medidor y detenlo dentro de la zona objetivo.',
    'Inicie o medidor e pare dentro da zona alvo.',
    'Lance la jauge et arrete-la dans la zone cible.',
    'Starte den Taktgeber und stoppe ihn in der Zielzone.',
    'Avvia il misuratore e fermalo dentro la zona bersaglio.'
  ),
};

const LABELS = {
  warmth: { leftLabel: L('Need space first', 'Espacio primero', 'Espaco primeiro', 'Espace d abord', 'Erst Abstand', 'Spazio prima'), rightLabel: L('Soften fast', 'Me ablando rapido', 'Amoleco rapido', 'Je me radoucis vite', 'Schnell weich', 'Mi addolcisco presto') },
  vigilance: { leftLabel: L('Settle fast', 'Me acomodo rapido', 'Relaxo rapido', 'Je me pose vite', 'Schnell ruhig', 'Mi sistemo presto'), rightLabel: L('Stay on watch', 'Sigo en guardia', 'Fico de vigia', 'Je reste en veille', 'Bleibe wachsam', 'Resto in guardia') },
  independence: { leftLabel: L('Still want company', 'Todavia quiero compania', 'Ainda quero companhia', 'Je veux encore du monde', 'Will noch Gesellschaft', 'Voglio ancora compagnia'), rightLabel: L('Need my own corner', 'Necesito mi rincon', 'Preciso do meu canto', 'Il me faut mon coin', 'Brauche meine Ecke', 'Ho bisogno del mio angolo') },
  play: { leftLabel: L('Rarely', 'Rara vez', 'Raramente', 'Rarement', 'Selten', 'Raramente'), rightLabel: L('Very easily', 'Muy facil', 'Muito facil', 'Tres facilement', 'Sehr leicht', 'Molto facilmente') },
  guardExplore: { leftLabel: L('Guard first', 'Primero guardia', 'Primeiro vigia', 'Garde d abord', 'Erst sichern', 'Prima guardia'), rightLabel: L('Explore first', 'Primero explorar', 'Primeiro explorar', 'Explorer d abord', 'Erst erkunden', 'Prima esplorare') },
  orderMischief: { leftLabel: L('Order', 'Orden', 'Ordem', 'Ordre', 'Ordnung', 'Ordine'), rightLabel: L('Mischief', 'Picardia', 'Travessura', 'Malice', 'Unfug', 'Birichinata') },
  closeSpace: { leftLabel: L('Close', 'Cerca', 'Perto', 'Proche', 'Nah', 'Vicino'), rightLabel: L('Space', 'Espacio', 'Espaco', 'Espace', 'Raum', 'Spazio') },
  calmChaos: { leftLabel: L('Calm', 'Calma', 'Calma', 'Calme', 'Ruhe', 'Calma'), rightLabel: L('Chaos', 'Caos', 'Caos', 'Chaos', 'Chaos', 'Caos') },
  comfortAdventure: { leftLabel: L('Comfort', 'Comodidad', 'Conforto', 'Confort', 'Komfort', 'Comfort'), rightLabel: L('Adventure', 'Aventura', 'Aventura', 'Aventure', 'Abenteuer', 'Avventura') },
  routineFlex: { leftLabel: L('Routine', 'Rutina', 'Rotina', 'Routine', 'Routine', 'Routine'), rightLabel: L('Flex', 'Flex', 'Flex', 'Souple', 'Flex', 'Flessibile') },
  guardPlay: { leftLabel: L('Guard', 'Guardia', 'Vigilia', 'Garde', 'Wache', 'Guardia'), rightLabel: L('Play', 'Juego', 'Brincar', 'Jeu', 'Spiel', 'Gioco') },
};

const OPTION_SETS = {
  roomFirst: [
    option(L('Find a safe face', 'Buscar cara segura', 'Buscar rosto seguro', 'Trouver un visage sur', 'Sicheres Gesicht suchen', 'Cercare un volto sicuro'), { warmth: 10, comfort: 6 }),
    option(L('Scan the room', 'Leer la sala', 'Ler a sala', 'Scanner la piece', 'Raum scannen', 'Leggere la stanza'), { vigilance: 12, curiosity: 5 }),
    option(L('Claim a cozy corner', 'Tomar rincon comodo', 'Pegar canto confortavel', 'Prendre un coin doux', 'Gemutliche Ecke nehmen', 'Prendere un angolo comodo'), { comfort: 12, independence: 2 }),
    option(L('Keep range', 'Guardar distancia', 'Manter distancia', 'Garder la distance', 'Abstand halten', 'Tenere distanza'), { independence: 10, vigilance: 8 }),
  ],
  disruption: [
    option(L('Inspect the change', 'Revisar el cambio', 'Ver a mudanca', 'Verifier le changement', 'Die Anderung prufen', 'Controllare il cambio'), { curiosity: 10, vigilance: 6 }),
    option(L('Return to routine', 'Volver a rutina', 'Voltar a rotina', 'Revenir a la routine', 'Zur Routine zuruck', 'Tornare alla routine'), { comfort: 12, vigilance: 4 }),
    option(L('Check my people', 'Ver a mi gente', 'Ver minhas pessoas', 'Verifier mes proches', 'Nach meinen Leuten sehen', 'Controllare le mie persone'), { warmth: 12, vigilance: 4 }),
    option(L('Shift the mood with humor', 'Mover humor', 'Mudar humor', 'Changer l humeur', 'Mit Humor kippen', 'Cambiare umore con umorismo'), { play: 12, warmth: 6 }),
  ],
  compliment: [
    option(L('You make people feel safe', 'Haces sentir segura a la gente', 'Voce faz as pessoas se sentirem seguras', 'Tu rassures vite les gens', 'Du gibst Menschen Sicherheit', 'Fai sentire al sicuro le persone'), { warmth: 12, comfort: 4 }),
    option(L('You notice what others miss', 'Notas lo que otros no ven', 'Voce nota o que outros nao veem', 'Tu vois ce que les autres ratent', 'Du bemerkst was andere ubersehen', 'Noti cio che gli altri non vedono'), { vigilance: 12, curiosity: 5 }),
    option(L('You have chaotic charm', 'Tienes encanto caotico', 'Voce tem charme caotico', 'Tu as un charme chaotique', 'Du hast chaotischen Charme', 'Hai un fascino caotico'), { play: 12, warmth: 4 }),
    option(L('You keep your center', 'Mantienes tu centro', 'Voce mantem seu centro', 'Tu gardes ton centre', 'Du behaltst deine Mitte', 'Mantieni il tuo centro'), { independence: 12, vigilance: 4 }),
  ],
  trustOpen: [
    option(L('Gentle consistency', 'Constancia amable', 'Constancia gentil', 'Douce constance', 'Sanfte Konstanz', 'Costanza gentile'), { comfort: 12, warmth: 6 }),
    option(L('Room for my pace', 'Espacio para mi ritmo', 'Espaco para meu ritmo', 'De l espace pour mon rythme', 'Raum fur mein Tempo', 'Spazio per il mio ritmo'), { independence: 12, comfort: 2 }),
    option(L('Easy playful moments', 'Momentos faciles de juego', 'Momentos leves de brincadeira', 'Moments joueurs faciles', 'Leichte spielerische Momente', 'Momenti leggeri e giocosi'), { play: 10, warmth: 8 }),
    option(L('Clear signals', 'Senales claras', 'Sinais claros', 'Signaux clairs', 'Klare Signale', 'Segnali chiari'), { vigilance: 12, comfort: 4 }),
  ],
  resetModes: [
    option(L('Blanket and familiar corner', 'Manta y rincon conocido', 'Cobertor e canto conhecido', 'Couverture et coin familier', 'Decke und vertraute Ecke', 'Coperta e angolo familiare'), { comfort: 12, warmth: 2 }),
    option(L('Roam alone', 'Moverme solo', 'Andar sozinho', 'Errer seul', 'Allein herumziehen', 'Girare da solo'), { independence: 12, curiosity: 6 }),
    option(L('Play with trusted people', 'Jugar con gente segura', 'Brincar com gente segura', 'Jouer avec des gens surs', 'Mit vertrauten Leuten spielen', 'Giocare con persone fidate'), { warmth: 10, play: 10 }),
    option(L('Watch first, join later', 'Mirar primero y volver luego', 'Observar primeiro e voltar depois', 'Observer puis revenir', 'Erst beobachten dann mitmachen', 'Osservare prima poi tornare'), { vigilance: 12, independence: 4 }),
  ],
  throwoffs: [
    option(L('Clingy people', 'Gente muy pegada', 'Pessoas grudadas', 'Gens collants', 'Klammernde Menschen', 'Persone appiccicose'), { independence: 12, warmth: -4 }),
    option(L('Loud tension', 'Tension ruidosa', 'Tensao barulhenta', 'Tension bruyante', 'Laute Spannung', 'Tensione rumorosa'), { vigilance: 12, comfort: 8 }),
    option(L('Nothing interesting', 'Nada interesante', 'Nada interessante', 'Rien d interessant', 'Nichts Interessantes', 'Niente di interessante'), { curiosity: 12, play: 6 }),
    option(L('Far from safe people', 'Lejos de gente segura', 'Longe de pessoas seguras', 'Loin des gens surs', 'Weit weg von sicheren Menschen', 'Lontano da persone sicure'), { warmth: 12, comfort: 4 }),
  ],
  comfortSignals: [
    option(L('Warm drink', 'Bebida tibia', 'Bebida quente', 'Boisson chaude', 'Warmes Getrank', 'Bevanda calda'), { comfort: 10, warmth: 2 }),
    option(L('Private corner', 'Rincon privado', 'Canto privado', 'Coin prive', 'Private Ecke', 'Angolo privato'), { independence: 10, comfort: 4 }),
    option(L('Soft person nearby', 'Persona suave cerca', 'Pessoa suave por perto', 'Personne douce a cote', 'Sanfte Person in der Nahe', 'Persona dolce vicina'), { warmth: 12, comfort: 2 }),
    option(L('Tiny thing to inspect', 'Algo pequeno para mirar', 'Algo pequeno para olhar', 'Petit truc a examiner', 'Kleines Ding zum Untersuchen', 'Piccola cosa da osservare'), { curiosity: 10, vigilance: 4 }),
  ],
  energyLeaks: [
    option(L('Too much caretaking', 'Demasiado cuidado emocional', 'Cuidado emocional demais', 'Trop de care emotif', 'Zu viel emotionale Pflege', 'Troppa cura emotiva'), { warmth: 8, vigilance: 4 }),
    option(L('Constant noise', 'Ruido constante', 'Barulho constante', 'Bruit constant', 'Dauerlarm', 'Rumore costante'), { vigilance: 10, comfort: 8 }),
    option(L('No room to wander', 'Sin espacio para moverme', 'Sem espaco para andar', 'Pas de place pour bouger', 'Kein Raum zum Umherziehen', 'Nessuno spazio per muovermi'), { independence: 10, curiosity: 8 }),
    option(L('Forced cheer too long', 'Alegria forzada mucho tiempo', 'Animacao forcada por muito tempo', 'Bonne humeur forcee trop longtemps', 'Zu lange erzwungene Gute Laune', 'Allegria forzata troppo a lungo'), { comfort: 6, independence: 6 }),
  ],
};
const OPTION_SETS_2 = {
  priorities: [
    option(L('Find a safe signal', 'Encontrar senal segura', 'Achar sinal seguro', 'Trouver un signal sur', 'Sicheres Signal finden', 'Trovare un segnale sicuro'), { warmth: 10, comfort: 6 }),
    option(L('Map exits and patterns', 'Mapear salidas y patrones', 'Mapear saidas e padroes', 'Cartographier sorties et rythmes', 'Ausgange und Muster kartieren', 'Mappare uscite e schemi'), { vigilance: 12, curiosity: 6 }),
    option(L('Test the vibe with play', 'Probar ambiente con juego', 'Testar clima com brincadeira', 'Tester l ambiance par le jeu', 'Stimmung spielerisch testen', 'Provare il clima con il gioco'), { play: 12, warmth: 4 }),
    option(L('Keep enough distance to leave', 'Guardar distancia para salir', 'Manter distancia para sair', 'Garder assez de distance pour partir', 'Genug Abstand halten um gehen zu konnen', 'Tenere abbastanza distanza per andarsene'), { independence: 12, vigilance: 4 }),
  ],
  firstTraits: [
    option(L('Soft and warm', 'Suave y calido', 'Suave e caloroso', 'Doux et chaud', 'Sanft und warm', 'Dolce e caldo'), { warmth: 12, comfort: 4 }),
    option(L('Quiet and precise', 'Callado y preciso', 'Quieto y preciso', 'Discret et precis', 'Leise und prazise', 'Silenzioso e preciso'), { vigilance: 12, independence: 4 }),
    option(L('Restless and curious', 'Inquieto y curioso', 'Inquieto e curioso', 'Agite et curieux', 'Unruhig und neugierig', 'Irrequieto e curioso'), { curiosity: 12, independence: 6 }),
    option(L('Goofy and alive', 'Tonto y vivo', 'Bobo e vivo', 'Farceur et vivant', 'Albern und lebendig', 'Buffo e vivo'), { play: 12, warmth: 4 }),
  ],
  safeAgain: [
    option(L('Trusted closeness', 'Cercania segura', 'Proximidade segura', 'Proximite sure', 'Vertraute Nahe', 'Vicinanza fidata'), { warmth: 12, comfort: 4 }),
    option(L('Time to scan what changed', 'Tiempo para leer el cambio', 'Tempo para ler a mudanca', 'Temps pour lire le changement', 'Zeit um die Anderung zu lesen', 'Tempo per leggere il cambiamento'), { vigilance: 12, curiosity: 4 }),
    option(L('Familiar comfort', 'Comodidad conocida', 'Conforto conhecido', 'Confort familier', 'Vertrauter Komfort', 'Comfort familiare'), { comfort: 14, vigilance: 2 }),
    option(L('Private range', 'Espacio privado', 'Espaco privado', 'Espace prive', 'Privater Raum', 'Spazio privato'), { independence: 14, comfort: 2 }),
  ],
  trustMarkers: [
    option(L('I can relax', 'Puedo relajarme', 'Posso relaxar', 'Je peux me detendre', 'Ich kann entspannen', 'Posso rilassarmi'), { comfort: 12, warmth: 4 }),
    option(L('They notice subtle shifts', 'Nota cambios pequenos', 'Nota mudancas pequenas', 'Observe les petits changements', 'Bemerkt kleine Wechsel', 'Nota piccoli cambiamenti'), { vigilance: 10, warmth: 4 }),
    option(L('They respect my pace', 'Respeta mi ritmo', 'Respeita meu ritmo', 'Respecte mon rythme', 'Respektiert mein Tempo', 'Rispetta il mio ritmo'), { independence: 12, comfort: 4 }),
    option(L('We can be silly easily', 'Podemos ser tontos facil', 'Podemos ser bobos facil', 'On peut etre idiots facilement', 'Wir konnen leicht albern sein', 'Possiamo essere sciocchi facilmente'), { play: 12, warmth: 6 }),
  ],
  stressModes: [
    option(L('Cling to safe people', 'Pegarme a gente segura', 'Grudar nas pessoas seguras', 'Me coller aux gens surs', 'An sichere Menschen klammern', 'Attaccarmi alle persone sicure'), { warmth: 12, comfort: 8, independence: -4 }),
    option(L('Go quiet and observant', 'Volverme callado y observador', 'Ficar quieto e observador', 'Devenir silencieux et observateur', 'Still und beobachtend werden', 'Diventare silenzioso e osservatore'), { vigilance: 12, independence: 8 }),
    option(L('Create movement', 'Crear movimiento', 'Criar movimento', 'Creer du mouvement', 'Bewegung schaffen', 'Creare movimento'), { play: 12, warmth: 6 }),
    option(L('Protect routines', 'Proteger rutinas', 'Proteger rotinas', 'Proteger les routines', 'Routinen schutzen', 'Proteggere le routine'), { comfort: 12, vigilance: 6 }),
  ],
  uncertaintyModes: [
    option(L('Stay close to familiar things', 'Quedar con lo familiar', 'Ficar com o familiar', 'Rester avec le familier', 'Beim Vertrauten bleiben', 'Restare con il familiare'), { comfort: 12, warmth: 4 }),
    option(L('Slip away and observe', 'Apartarme y observar', 'Sair e observar', 'M ecarter et observer', 'Mich zuruckziehen und beobachten', 'Allontanarmi e osservare'), { independence: 10, vigilance: 8 }),
    option(L('Turn it into a game', 'Volverlo juego', 'Transformar em jogo', 'En faire un jeu', 'Es in ein Spiel verwandeln', 'Trasformarlo in gioco'), { play: 12, warmth: 6 }),
    option(L('Investigate until it makes sense', 'Investigar hasta entender', 'Investigar ate entender', 'Enqueter jusqu a comprendre', 'Erkunden bis es Sinn ergibt', 'Indagare finche ha senso'), { curiosity: 10, vigilance: 10 }),
  ],
  homeModes: [
    option(L('Soft homebody', 'Casero suave', 'Caseiro suave', 'Casanier doux', 'Sanfter Stubenhocker', 'Casalingo dolce'), { comfort: 14, warmth: 4 }),
    option(L('Quiet scout', 'Explorador silencioso', 'Batedor silencioso', 'Eclaireur discret', 'Leiser Spaher', 'Esploratore silenzioso'), { vigilance: 10, curiosity: 10 }),
    option(L('Warm little chaos', 'Caos calido', 'Caos caloroso', 'Petit chaos chaud', 'Warme kleine Unruhe', 'Piccolo caos caldo'), { play: 12, warmth: 10 }),
    option(L('Independent wanderer', 'Vagabundo independiente', 'Andarilho independente', 'Marcheur independant', 'Unabhangiger Streuner', 'Viandante indipendente'), { independence: 14, curiosity: 8 }),
  ],
  careModes: [
    option(L('Stay close and soften the air', 'Quedar cerca y suavizar el aire', 'Ficar perto e suavizar o clima', 'Rester proche et adoucir l air', 'Nahe bleiben und die Stimmung weicher machen', 'Restare vicino e addolcire l aria'), { warmth: 12, comfort: 6 }),
    option(L('Track the cause quietly', 'Seguir la causa en silencio', 'Seguir a causa em silencio', 'Suivre la cause en silence', 'Die Ursache leise verfolgen', 'Seguire la causa in silenzio'), { vigilance: 12, curiosity: 4 }),
    option(L('Lift them with a joke', 'Levantarlos con una broma', 'Levantar com piada', 'Remonter avec une blague', 'Mit einem Witz aufhellen', 'Sollevare con una battuta'), { play: 12, warmth: 8 }),
    option(L('Give space then return', 'Dar espacio y volver', 'Dar espaco e voltar', 'Donner de l espace puis revenir', 'Raum geben und zuruckkommen', 'Dare spazio e tornare'), { independence: 10, warmth: 6 }),
  ],
  allocIdeal: [
    option(L('Trusted closeness', 'Cercania segura', 'Proximidade segura', 'Proximite sure', 'Vertraute Nahe', 'Vicinanza fidata'), { warmth: 14 }),
    option(L('Interesting things to inspect', 'Cosas para investigar', 'Coisas para investigar', 'Choses a inspecter', 'Dinge zum Untersuchen', 'Cose da osservare'), { curiosity: 14 }),
    option(L('Safe nest', 'Refugio seguro', 'Ninho seguro', 'Nid sur', 'Sicheres Nest', 'Nido sicuro'), { comfort: 14, vigilance: 4 }),
    option(L('Freedom to roam', 'Libertad para moverme', 'Liberdade para andar', 'Liberte de bouger', 'Freiheit zum Umherziehen', 'Liberta di muovermi'), { independence: 14 }),
  ],
  allocTrust: [
    option(L('Consistency', 'Constancia', 'Constancia', 'Constance', 'Konstanz', 'Costanza'), { comfort: 12, vigilance: 8 }),
    option(L('Gentleness', 'Suavidad', 'Gentileza', 'Douceur', 'Sanftheit', 'Dolcezza'), { warmth: 14 }),
    option(L('Respect for my space', 'Respeto por mi espacio', 'Respeito pelo meu espaco', 'Respect de mon espace', 'Respekt fur meinen Raum', 'Rispetto per il mio spazio'), { independence: 14 }),
    option(L('Easy fun', 'Diversion facil', 'Diversao facil', 'Plaisir facile', 'Leichte Freude', 'Divertimento facile'), { play: 12, warmth: 6 }),
  ],
  allocRestore: [
    option(L('Silence', 'Silencio', 'Silencio', 'Silence', 'Stille', 'Silenzio'), { comfort: 12, vigilance: 4 }),
    option(L('Movement', 'Movimiento', 'Movimento', 'Mouvement', 'Bewegung', 'Movimento'), { play: 12, curiosity: 6 }),
    option(L('Warm company', 'Compania calida', 'Companhia calorosa', 'Compagnie chaleureuse', 'Warme Gesellschaft', 'Compagnia calorosa'), { warmth: 12, comfort: 4 }),
    option(L('Private range', 'Espacio privado', 'Espaco privado', 'Espace prive', 'Privater Raum', 'Spazio privato'), { independence: 14 }),
  ],
  allocCore: [
    option(L('Feeling safe', 'Sentirme seguro', 'Sentir seguranca', 'Me sentir en securite', 'Mich sicher fuhlen', 'Sentirmi al sicuro'), { comfort: 12, vigilance: 4 }),
    option(L('Feeling close', 'Sentirme cerca', 'Sentir proximidade', 'Me sentir proche', 'Mich nah fuhlen', 'Sentirmi vicino'), { warmth: 14 }),
    option(L('Feeling free', 'Sentirme libre', 'Sentir liberdade', 'Me sentir libre', 'Mich frei fuhlen', 'Sentirmi libero'), { independence: 14 }),
    option(L('Feeling alive', 'Sentirme vivo', 'Sentir vivacidade', 'Me sentir vivant', 'Mich lebendig fuhlen', 'Sentirmi vivo'), { play: 12, curiosity: 6 }),
  ],
  pairRoomFlow: [
    option(L('Stay near one safe signal', 'Quedar cerca de una senal segura', 'Ficar perto de um sinal seguro', 'Rester pres d un signal sur', 'Bei einem sicheren Signal bleiben', 'Restare vicino a un segnale sicuro'), { warmth: 10, comfort: 8 }),
    option(L('Circle and observe the edges', 'Dar vueltas y mirar los bordes', 'Circular e observar as bordas', 'Tourner et observer les bords', 'Kreise ziehen und die Rander beobachten', 'Girare e osservare i bordi'), { vigilance: 12, independence: 4 }),
    option(L('Follow whatever looks alive', 'Seguir lo que se ve vivo', 'Seguir o que parece vivo', 'Suivre ce qui semble vivant', 'Dem Lebendigsten folgen', 'Seguire cio che sembra vivo'), { curiosity: 12, play: 6 }),
    option(L('Make a small private base', 'Armar una base privada', 'Montar uma base privada', 'Faire une petite base privee', 'Eine kleine private Basis bauen', 'Creare una piccola base privata'), { comfort: 10, independence: 8 }),
    option(L('Test the air with a joke', 'Probar el ambiente con una broma', 'Testar o clima com uma piada', 'Tester l ambiance avec une blague', 'Die Stimmung mit einem Witz testen', 'Testare l aria con una battuta'), { play: 10, warmth: 8 }),
    option(L('Track the calmest route out', 'Seguir la salida mas tranquila', 'Seguir a saida mais calma', 'Suivre la sortie la plus calme', 'Den ruhigsten Ausgang verfolgen', 'Seguire l uscita piu calma'), { vigilance: 10, comfort: 6 }),
  ],
  pairCareLoop: [
    option(L('Sit quietly nearby', 'Sentarme cerca en silencio', 'Sentar perto em silencio', 'M asseoir pres en silence', 'Still in der Nahe sitzen', 'Sedermi vicino in silenzio'), { warmth: 12, comfort: 6 }),
    option(L('Notice the smallest shifts', 'Notar los cambios mas pequenos', 'Notar as menores mudancas', 'Remarquer les plus petits changements', 'Die kleinsten Wechsel bemerken', 'Notare i cambiamenti piu piccoli'), { vigilance: 12, curiosity: 4 }),
    option(L('Bring a tiny comfort item', 'Llevar algo pequeno de consuelo', 'Levar um pequeno conforto', 'Apporter un petit objet de reconfort', 'Einen kleinen Trostgegenstand bringen', 'Portare un piccolo oggetto di conforto'), { comfort: 12, warmth: 4 }),
    option(L('Break the heaviness with play', 'Romper el peso con juego', 'Quebrar o peso com brincadeira', 'Casser la lourdeur par le jeu', 'Die Schwere spielerisch brechen', 'Spezzare il peso con il gioco'), { play: 12, warmth: 6 }),
    option(L('Give space and return later', 'Dar espacio y volver luego', 'Dar espaco e voltar depois', 'Donner de l espace et revenir plus tard', 'Raum geben und spater wiederkommen', 'Dare spazio e tornare dopo'), { independence: 12, warmth: 4 }),
    option(L('Fix the surrounding setup', 'Arreglar el entorno', 'Arrumar o ambiente', 'Reparer le cadre autour', 'Das Umfeld ordnen', 'Sistemare l ambiente intorno'), { comfort: 10, vigilance: 6 }),
  ],
  pairResetArc: [
    option(L('Warm drink or blanket', 'Bebida caliente o manta', 'Bebida quente ou coberta', 'Boisson chaude ou couverture', 'Warmes Getrank oder Decke', 'Bevanda calda o coperta'), { comfort: 12, warmth: 4 }),
    option(L('Long quiet roam', 'Paseo largo y callado', 'Caminhada longa e quieta', 'Longue marche silencieuse', 'Langer stiller Streifzug', 'Lungo giro silenzioso'), { independence: 12, curiosity: 6 }),
    option(L('Trusted person who gets it', 'Persona segura que entiende', 'Pessoa confiavel que entende', 'Personne sure qui comprend', 'Vertraute Person die es versteht', 'Persona fidata che capisce'), { warmth: 14, comfort: 4 }),
    option(L('Something small to investigate', 'Algo pequeno para investigar', 'Algo pequeno para investigar', 'Quelque chose de petit a examiner', 'Etwas Kleines zum Untersuchen', 'Qualcosa di piccolo da osservare'), { curiosity: 12, vigilance: 4 }),
    option(L('A silly little ritual', 'Un ritual tonto y pequeno', 'Um ritual bobo e pequeno', 'Un petit rituel idiot', 'Ein albernes kleines Ritual', 'Un piccolo rituale sciocco'), { play: 10, comfort: 6 }),
    option(L('Total control of the room', 'Control total del espacio', 'Controle total do espaco', 'Controle total de la piece', 'Volle Kontrolle uber den Raum', 'Controllo totale della stanza'), { independence: 10, vigilance: 8 }),
  ],
};
Object.assign(OPTION_SETS, OPTION_SETS_2);

const DUELS = {
  quietVsMove: { left: option(L('Curl up in a safe spot', 'Acurrucarme en lugar seguro', 'Me enrolar num lugar seguro', 'Me blottir dans un endroit sur', 'Mich an sicherem Ort zusammenrollen', 'Rannicchiarmi in posto sicuro'), { comfort: 14, independence: 6 }), right: option(L('Move and shake it off', 'Moverme y sacudirlo', 'Me mover e sacudir', 'Bouger et evacuer', 'Mich bewegen und abschutteln', 'Muovermi e scrollarlo via'), { curiosity: 10, play: 10 }) },
  peopleVsPattern: { left: option(L('Read people first', 'Leer primero a la gente', 'Ler pessoas primeiro', 'Lire les gens d abord', 'Zuerst Menschen lesen', 'Leggere prima le persone'), { warmth: 10, vigilance: 6 }), right: option(L('Read the pattern first', 'Leer primero el patron', 'Ler o padrao primeiro', 'Lire le schema d abord', 'Zuerst das Muster lesen', 'Leggere prima lo schema'), { vigilance: 12, curiosity: 6 }) },
  nestVsAdventure: { left: option(L('Return to something known', 'Volver a algo conocido', 'Voltar ao conhecido', 'Revenir vers du connu', 'Zu etwas Bekanntem zuruck', 'Tornare a qualcosa di noto'), { comfort: 14, warmth: 2 }), right: option(L('Follow what looks alive', 'Seguir lo que se ve vivo', 'Seguir o que parece vivo', 'Suivre ce qui semble vivant', 'Dem folgen was lebendig wirkt', 'Seguire cio che sembra vivo'), { curiosity: 12, play: 8 }) },
  softenVsDistance: { left: option(L('Lean in gently', 'Acercarme con suavidad', 'Chegar com suavidade', 'M approcher doucement', 'Sanft naher kommen', 'Avvicinarmi con dolcezza'), { warmth: 12, comfort: 4 }), right: option(L('Give myself range', 'Darme margen', 'Me dar espaco', 'Me donner de l espace', 'Mir selbst Abstand geben', 'Darmi spazio'), { independence: 12, vigilance: 4 }) },
};

const TRADEOFFS = {
  closeVsSpace: { left: option(L('Stay available to my people', 'Seguir disponible para mi gente', 'Ficar disponivel para minhas pessoas', 'Rester disponible pour mes proches', 'Fur meine Leute verfugbar bleiben', 'Restare disponibile per le mie persone'), { warmth: 14, comfort: 6, independence: -4 }), right: option(L('Protect room to reset alone', 'Proteger espacio para resetear solo', 'Proteger espaco para recarregar sozinho', 'Proteger un espace pour recuperer seul', 'Raum fur Alleinzeit schutzen', 'Proteggere spazio per ricaricarmi da solo'), { independence: 14, vigilance: 6, warmth: -4 }) },
  comfortVsAdventure: { left: option(L('Known softness', 'Suavidad conocida', 'Maciez conhecida', 'Douceur connue', 'Bekannte Weichheit', 'Dolcezza nota'), { comfort: 14, warmth: 6, curiosity: -4 }), right: option(L('Fresh signals', 'Senales nuevas', 'Sinais novos', 'Signaux neufs', 'Frische Signale', 'Segnali nuovi'), { curiosity: 14, independence: 8, comfort: -4 }) },
  routineVsFlex: { left: option(L('Known rhythm', 'Ritmo conocido', 'Ritmo conhecido', 'Rythme connu', 'Bekannter Rhythmus', 'Ritmo noto'), { comfort: 12, vigilance: 8 }), right: option(L('Live adaptation', 'Adaptacion en vivo', 'Adaptacao ao vivo', 'Adaptation en direct', 'Live Anpassung', 'Adattamento dal vivo'), { play: 8, curiosity: 10, comfort: -4 }) },
  guardVsPlay: { left: option(L('Stay watchful', 'Seguir vigilante', 'Ficar vigilante', 'Rester en garde', 'Wachsam bleiben', 'Restare vigile'), { vigilance: 14, comfort: 4 }), right: option(L('Lighten it with play', 'Aligerarlo con juego', 'Aliviar com brincadeira', 'L alleger avec du jeu', 'Mit Spiel auflockern', 'Alleggerire con il gioco'), { play: 14, warmth: 6 }) },
};

const GRIDS = {
  socialNest: { xLeftLabel: L('Cozy', 'Comodo', 'Aconchego', 'Doux', 'Gemutlich', 'Comodo'), xRightLabel: L('Open', 'Abierto', 'Aberto', 'Ouvert', 'Offen', 'Aperto'), yTopLabel: L('Close', 'Cerca', 'Perto', 'Proche', 'Nah', 'Vicino'), yBottomLabel: L('Solo', 'Solo', 'Solo', 'Solo', 'Allein', 'Solo'), options: [option(L('Close and nested', 'Cerca y refugiado', 'Perto e aninhado', 'Proche et niche', 'Nah und eingeigelt', 'Vicino e raccolto'), { warmth: 12, comfort: 10 }), option(L('Close and bright', 'Cerca y brillante', 'Perto e aberto', 'Proche et lumineux', 'Nah und offen', 'Vicino e aperto'), { warmth: 12, play: 8 }), option(L('Solo and sheltered', 'Solo y protegido', 'Solo e protegido', 'Solo et protege', 'Allein und geschutzt', 'Solo e protetto'), { independence: 12, comfort: 10 }), option(L('Solo and roaming', 'Solo y moviendome', 'Solo em movimento', 'Solo en mouvement', 'Allein unterwegs', 'Solo e in movimento'), { independence: 12, curiosity: 10 })] },
  watchWarm: { xLeftLabel: L('Watchful', 'Vigilante', 'Vigilante', 'En veille', 'Wachsam', 'Vigile'), xRightLabel: L('Soft', 'Suave', 'Suave', 'Doux', 'Weich', 'Dolce'), yTopLabel: L('Still', 'Quieto', 'Quieto', 'Calme', 'Still', 'Fermo'), yBottomLabel: L('Animated', 'Animado', 'Animado', 'Anime', 'Bewegt', 'Animato'), options: [option(L('Still and watchful', 'Quieto y vigilante', 'Quieto e vigilante', 'Calme et en veille', 'Still und wachsam', 'Fermo e vigile'), { vigilance: 14, comfort: 4 }), option(L('Still and soft', 'Quieto y suave', 'Quieto e suave', 'Calme et doux', 'Still und weich', 'Fermo e dolce'), { warmth: 12, comfort: 6 }), option(L('Animated and watchful', 'Animado y atento', 'Animado e atento', 'Anime et attentif', 'Bewegt und wachsam', 'Animato e attento'), { vigilance: 10, play: 6 }), option(L('Animated and soft', 'Animado y suave', 'Animado e suave', 'Anime et doux', 'Bewegt und weich', 'Animato e dolce'), { warmth: 12, play: 10 })] },
};

const QUESTIONS = [
    // --- New guessing game type ---
    { id: 2100, type: 'guess', pairKey: 'guess-intuition', pairSlot: 'a', text: L('Guess which hand the treat is in. Trust your first instinct.', 'Adivina en que mano esta la golosina. Confia en tu primer instinto.', 'Adivinhe em qual mao esta o petisco. Confie no seu primeiro instinto.', 'Devine dans quelle main est la friandise. Fais confiance a ton premier instinct.', 'Rate mal, in welcher Hand das Leckerli ist. Vertraue deinem ersten Instinkt.', 'Indovina in quale mano c e il premio. Fidati del tuo primo istinto.'), leftLabel: L('Left', 'Izquierda', 'Esquerda', 'Gauche', 'Links', 'Sinistra'), rightLabel: L('Right', 'Derecha', 'Direita', 'Droite', 'Rechts', 'Destra'), leftModifiers: { curiosity: 8, play: 6 }, rightModifiers: { vigilance: 8, independence: 6 } },

    // --- Portrait memory game ---
    { id: 2101, type: 'flip', pairKey: 'flip-memory', pairSlot: 'a', text: L('Match all 10 character pairs from memory to prove your focus.', 'Empareja las 10 parejas de personajes de memoria para demostrar tu enfoque.', 'Combine os 10 pares de personagens de memória para provar seu foco.', 'Retrouve les 10 paires de personnages de mémoire pour prouver ta concentration.', 'Finde alle 10 Charakterpaare aus dem Gedächtnis, um deinen Fokus zu beweisen.', 'Abbina tutte le 10 coppie di personaggi a memoria per dimostrare la tua concentrazione.'), previewLabel: L('Take a few seconds to study the cards before they flip.', 'Toma unos segundos para estudiar las cartas antes de que se giren.', 'Use alguns segundos para estudar as cartas antes de virarem.', 'Prends quelques secondes pour etudier les cartes avant qu elles se retournent.', 'Nimm dir ein paar Sekunden, um die Karten zu studieren, bevor sie sich umdrehen.', 'Prenditi qualche secondo per studiare le carte prima che si girino.'), playLabel: L('Match all 10 pairs from memory.', 'Empareja las 10 parejas de memoria.', 'Combine os 10 pares de memória.', 'Retrouve les 10 paires de mémoire.', 'Finde alle 10 Paare aus dem Gedächtnis.', 'Abbina tutte le 10 coppie a memoria.'), timerLabel: L('Time', 'Tiempo', 'Tempo', 'Temps', 'Zeit', 'Tempo'), completedLabel: L('Completed in', 'Completado en', 'Concluido em', 'Termine en', 'Geschafft in', 'Completato in'), retryLabel: L('Retry round', 'Reintentar ronda', 'Tentar de novo', 'Rejouer', 'Runde neu starten', 'Riprova il turno'), fastResultLabel: L('Sharp memory', 'Memoria aguda', 'Memoria afiada', 'Memoire vive', 'Scharfes Gedachtnis', 'Memoria acuta'), steadyResultLabel: L('Steady matcher', 'Ritmo constante', 'Ritmo constante', 'Rythme stable', 'Konstanter Rhythmus', 'Ritmo stabile'), slowResultLabel: L('Careful matcher', 'Emparejador cuidadoso', 'Combinacao cuidadosa', 'Association soigneuse', 'Sorgfaltiger Abgleich', 'Abbinamento accurato'), previewMs: 7200, pairCount: 10, fastThresholdMs: 34000, steadyThresholdMs: 56000, fastModifiers: { curiosity: 16, vigilance: 10, play: 8 }, steadyModifiers: { comfort: 6, vigilance: 4, independence: 2 }, slowModifiers: { curiosity: -4, comfort: 2, vigilance: 1, play: -6 } },
  { id: 2001, type: 'slider', axis: 'warmth', text: L('Warm-up speed with trusted people?', 'Velocidad para ablandarme con gente segura?', 'Velocidade para amolecer com gente segura?', 'Vitesse pour me radoucir avec les gens surs ?', 'Warmwerden bei vertrauten Menschen?', 'Velocita per sciogliermi con persone sicure?'), labelKey: 'warmth' },
  { id: 2002, type: 'slider', axis: 'vigilance', text: L('Alertness in new spaces?', 'Alerta en espacios nuevos?', 'Alerta em espacos novos?', 'Alerte dans les nouveaux lieux ?', 'Wachsamkeit in neuen Orten?', 'Allerta in spazi nuovi?'), labelKey: 'vigilance' },
  { id: 2003, type: 'slider', axis: 'independence', text: L('Need for solo reset time?', 'Necesidad de tiempo a solas?', 'Necessidade de tempo sozinho?', 'Besoin de temps seul ?', 'Bedarf an Alleinzeit?', 'Bisogno di tempo da solo?'), labelKey: 'independence' },
  { id: 2004, type: 'slider', axis: 'play', text: L('Playfulness once safe?', 'Juego cuando me siento seguro?', 'Brincadeira quando estou seguro?', 'Jeu quand je me sens en securite ?', 'Verspieltheit wenn es sicher ist?', 'Giocosita quando mi sento al sicuro?'), labelKey: 'play' },
  { id: 2005, type: 'choice', text: L('New room, first move?', 'Sala nueva, primer movimiento?', 'Sala nova, primeiro movimento?', 'Nouvelle piece, premier mouvement ?', 'Neuer Raum, erster Zug?', 'Stanza nuova, prima mossa?'), optionKey: 'roomFirst' },
  { id: 2006, type: 'choice', text: L('Unexpected disruption, first instinct?', 'Interrupcion inesperada, primer instinto?', 'Interrupcao inesperada, primeiro instinto?', 'Interruption inattendue, premier reflexe ?', 'Unerwartete Storung, erster Instinkt?', 'Imprevisto, primo istinto?'), optionKey: 'disruption' },
  { id: 2007, type: 'choice', text: L('Best compliment for you?', 'Mejor cumplido para ti?', 'Melhor elogio para voce?', 'Meilleur compliment pour toi ?', 'Bestes Kompliment fur dich?', 'Miglior complimento per te?'), optionKey: 'compliment' },
  { id: 2008, type: 'choice', text: L('A bond opens when...', 'Un vinculo se abre cuando...', 'Um vinculo abre quando...', 'Un lien s ouvre quand...', 'Eine Bindung offnet sich wenn...', 'Un legame si apre quando...'), optionKey: 'trustOpen' },
  { id: 2009, type: 'yesno', pairKey: 'warm', pairSlot: 'a', text: L('I like greeting trusted people first.', 'Me gusta saludar primero a la gente segura.', 'Gosto de cumprimentar primeiro as pessoas seguras.', 'J aime saluer d abord les gens surs.', 'Ich begrusse vertraute Menschen gern zuerst.', 'Mi piace salutare per primo le persone sicure.'), yesModifiers: { warmth: 12, play: 6 }, noModifiers: { independence: 8, vigilance: 4, warmth: -6 } },
  { id: 2010, type: 'yesno', pairKey: 'warm', pairSlot: 'b', pairReverse: true, text: L('Even with safe people, I warm up slowly.', 'Incluso con gente segura, me abro lento.', 'Mesmo com gente segura, eu me abro devagar.', 'Meme avec des gens surs, je me rechauffe lentement.', 'Selbst bei sicheren Menschen werde ich langsam warm.', 'Anche con persone sicure, mi apro lentamente.'), yesModifiers: { comfort: 8, independence: 6, warmth: -4 }, noModifiers: { warmth: 10, play: 4, comfort: -2 } },
  { id: 2011, type: 'yesno', pairKey: 'watch', pairSlot: 'a', text: L('I notice tiny tone shifts early.', 'Noto cambios pequenos de tono temprano.', 'Percebo mudancas pequenas de tom cedo.', 'Je remarque vite les petits changements de ton.', 'Ich bemerke kleine Tonwechsel fruh.', 'Noto presto piccoli cambi di tono.'), yesModifiers: { vigilance: 12, warmth: 4 }, noModifiers: { play: 4, comfort: 4, vigilance: -8 } },
  { id: 2012, type: 'yesno', pairKey: 'watch', pairSlot: 'b', pairReverse: true, text: L('Once a place feels safe, I stop monitoring fast.', 'Cuando un lugar se siente seguro, dejo de vigilar rapido.', 'Quando um lugar parece seguro, paro de vigiar rapido.', 'Quand un lieu semble sur, j arrete vite de surveiller.', 'Wenn ein Ort sicher wirkt hore ich schnell auf zu beobachten.', 'Quando un posto sembra sicuro, smetto presto di controllare.'), yesModifiers: { comfort: 8, warmth: 4, vigilance: -8 }, noModifiers: { vigilance: 12, independence: 4 } },
  { id: 2013, type: 'duel', text: L('Default recovery mode?', 'Modo base de recuperacion?', 'Modo base de recuperacao?', 'Mode de recuperation de base ?', 'Standard Erholungsmodus?', 'Modo base di recupero?'), duelKey: 'quietVsMove' },
  { id: 2014, type: 'duel', text: L('Read what first in uncertainty?', 'Que lees primero en la incertidumbre?', 'O que voce le primeiro na incerteza?', 'Que lis-tu d abord dans l incertitude ?', 'Was liest du zuerst in Unsicherheit?', 'Cosa leggi per prima nell incertezza?'), duelKey: 'peopleVsPattern' },
  { id: 2015, type: 'duel', text: L('Worn down: what pulls harder?', 'Cansado: que tira mas?', 'Cansado: o que puxa mais?', 'Use: qu est-ce qui tire le plus ?', 'Erschopft: was zieht starker?', 'Stanco: cosa tira di piu?'), duelKey: 'nestVsAdventure' },
  { id: 2016, type: 'duel', text: L('When someone matters, what comes first?', 'Cuando alguien importa, que sale primero?', 'Quando alguem importa, o que vem primeiro?', 'Quand quelqu un compte, qu est-ce qui vient d abord ?', 'Wenn jemand wichtig ist, was kommt zuerst?', 'Quando qualcuno conta, cosa arriva prima?'), duelKey: 'softenVsDistance' },
  { id: 2017, type: 'multi', maxSelect: 2, text: L('Choose up to two reset modes.', 'Elige hasta dos modos de recarga.', 'Escolha ate dois modos de recarga.', 'Choisis jusqu a deux modes de recharge.', 'Wahle bis zu zwei Reset Modus.', 'Scegli fino a due modi di ricarica.'), optionKey: 'resetModes' },
  { id: 2018, type: 'multi', maxSelect: 2, text: L('Choose up to two rhythm killers.', 'Elige hasta dos cosas que rompen tu ritmo.', 'Escolha ate duas coisas que quebram seu ritmo.', 'Choisis jusqu a deux choses qui cassent ton rythme.', 'Wahle bis zu zwei Rhythmus Killer.', 'Scegli fino a due cose che rompono il tuo ritmo.'), optionKey: 'throwoffs' },
  { id: 2019, type: 'multi', maxSelect: 2, text: L('Choose up to two comfort signals.', 'Elige hasta dos senales de confort.', 'Escolha ate dois sinais de conforto.', 'Choisis jusqu a deux signaux de confort.', 'Wahle bis zu zwei Komfortsignale.', 'Scegli fino a due segnali di comfort.'), optionKey: 'comfortSignals' },
  { id: 2020, type: 'multi', maxSelect: 2, text: L('Choose up to two energy leaks.', 'Elige hasta dos fugas de energia.', 'Escolha ate dois vazamentos de energia.', 'Choisis jusqu a deux fuites d energie.', 'Wahle bis zu zwei Energielecks.', 'Scegli fino a due perdite di energia.'), optionKey: 'energyLeaks' },
  { id: 2021, type: 'rank2', text: L('Rank top 2 priorities in unknown space.', 'Ordena tus 2 prioridades en lugar desconocido.', 'Ordene 2 prioridades em lugar desconhecido.', 'Classe tes 2 priorites en lieu inconnu.', 'Ordne 2 Prioritaten im unbekannten Raum.', 'Metti in ordine 2 priorita in posto sconosciuto.'), optionKey: 'priorities' },
  { id: 2022, type: 'rank2', text: L('Rank the first traits people notice.', 'Ordena los rasgos que la gente nota primero.', 'Ordene os tracos que as pessoas notam primeiro.', 'Classe les traits remarques en premier.', 'Ordne die Zuge die Menschen zuerst bemerken.', 'Metti in ordine i tratti che la gente nota per primi.'), optionKey: 'firstTraits' },
  { id: 2023, type: 'rank2', text: L('Rank the top 2 safe-again needs.', 'Ordena las 2 necesidades para volver a sentirte seguro.', 'Ordene as 2 necessidades para voltar a se sentir seguro.', 'Classe les 2 besoins pour te sentir de nouveau en securite.', 'Ordne die 2 Bedurfnisse um dich wieder sicher zu fuhlen.', 'Metti in ordine i 2 bisogni per sentirti di nuovo al sicuro.'), optionKey: 'safeAgain' },
  { id: 2024, type: 'rank2', text: L('Rank the top 2 trust markers.', 'Ordena las 2 senales de confianza mas fuertes.', 'Ordene os 2 sinais de confianca mais fortes.', 'Classe les 2 marqueurs de confiance les plus forts.', 'Ordne die 2 starksten Vertrauenszeichen.', 'Metti in ordine i 2 segnali di fiducia piu forti.'), optionKey: 'trustMarkers' },
  { id: 2025, type: 'ipsative', text: L('Under stress: pick MOST and LEAST like you.', 'Bajo estres: elige la MAS y la MENOS como tu.', 'Sob estresse: escolha a MAIS e a MENOS como voce.', 'Sous stress : choisis la PLUS et la MOINS comme toi.', 'Unter Stress: wahle am meisten und am wenigsten wie du.', 'Sotto stress: scegli la PIU e la MENO simile a te.'), optionKey: 'stressModes' },
  { id: 2026, type: 'ipsative', text: L('In uncertainty: pick MOST and LEAST natural.', 'En incertidumbre: elige la MAS y la MENOS natural.', 'Na incerteza: escolha a MAIS e a MENOS natural.', 'Dans l incertitude : choisis la PLUS et la MOINS naturelle.', 'In Unsicherheit: wahle am meisten und am wenigsten naturlich.', 'Nell incertezza: scegli la PIU e la MENO naturale.'), optionKey: 'uncertaintyModes' },
  { id: 2027, type: 'ipsative', text: L('Home pattern: pick MOST and LEAST like you.', 'Patron de casa: elige la MAS y la MENOS como tu.', 'Padrao de casa: escolha a MAIS e a MENOS como voce.', 'Mode maison : choisis la PLUS et la MOINS comme toi.', 'Zuhause Muster: wahle am meisten und am wenigsten wie du.', 'Schema di casa: scegli il PIU e il MENO simile a te.'), optionKey: 'homeModes' },
  { id: 2028, type: 'ipsative', text: L('Care style: pick MOST and LEAST like you.', 'Estilo de cuidado: elige el MAS y el MENOS como tu.', 'Estilo de cuidado: escolha o MAIS e o MENOS como voce.', 'Style de soin : choisis le PLUS et le MOINS comme toi.', 'Fursorge Stil: wahle am meisten und am wenigsten wie du.', 'Stile di cura: scegli il PIU e il MENO simile a te.'), optionKey: 'careModes' },
  { id: 2029, type: 'spectrum', pairKey: 'guard-explore', pairSlot: 'a', text: L('Unknown space: where do you lean first?', 'Espacio desconocido: hacia donde te inclinas primero?', 'Espaco desconhecido: para onde voce inclina primeiro?', 'Espace inconnu : ou penches-tu d abord ?', 'Unbekannter Raum: wohin neigst du zuerst?', 'Spazio sconosciuto: verso cosa tendi prima?'), labelKey: 'guardExplore', left: { modifiers: { vigilance: 16, comfort: 4 } }, right: { modifiers: { curiosity: 16, independence: 6, play: 2 } } },
  { id: 2030, type: 'spectrum', pairKey: 'guard-explore', pairSlot: 'b', pairReverse: true, text: L('Fully yourself: where does energy lean?', 'Siendo tu completo: hacia donde se inclina la energia?', 'Sendo voce por inteiro: para onde a energia inclina?', 'Entierement toi : ou penche ton energie ?', 'Ganz du selbst: wohin neigt deine Energie?', 'Quando sei pienamente te stesso: verso cosa tende l energia?'), labelKey: 'orderMischief', left: { modifiers: { comfort: 12, vigilance: 6, play: -4 } }, right: { modifiers: { play: 14, curiosity: 8, comfort: -4 } } },
  { id: 2031, type: 'spectrum', pairKey: 'close-space', pairSlot: 'a', text: L('Low energy day: what does your system want?', 'Dia de poca energia: que quiere tu sistema?', 'Dia de pouca energia: o que seu sistema quer?', 'Jour de faible energie : que veut ton systeme ?', 'Tag mit wenig Energie: was will dein System?', 'Giornata con poca energia: cosa vuole il tuo sistema?'), labelKey: 'closeSpace', left: { modifiers: { warmth: 14, comfort: 6 } }, right: { modifiers: { independence: 14, vigilance: 6 } } },
  { id: 2032, type: 'spectrum', pairKey: 'mood-shape', pairSlot: 'a', text: L('Your room imprint feels more...', 'Tu huella en la sala se siente mas...', 'Sua marca no ambiente parece mais...', 'Ton empreinte dans la piece semble plus...', 'Dein Eindruck im Raum wirkt mehr...', 'La tua impronta nella stanza sembra piu...'), labelKey: 'calmChaos', left: { modifiers: { comfort: 10, vigilance: 4 } }, right: { modifiers: { play: 12, warmth: 4 } } },
  { id: 2033, type: 'allocation', budget: 10, text: L('Distribute 10 points across your ideal day.', 'Distribuye 10 puntos en tu dia ideal.', 'Distribua 10 pontos no seu dia ideal.', 'Distribue 10 points dans ta journee ideale.', 'Verteile 10 Punkte auf deinen idealen Tag.', 'Distribuisci 10 punti nella tua giornata ideale.'), optionKey: 'allocIdeal' },
  { id: 2034, type: 'allocation', budget: 10, text: L('Distribute 10 points across what earns trust.', 'Distribuye 10 puntos en lo que gana tu confianza.', 'Distribua 10 pontos no que ganha confianca.', 'Distribue 10 points sur ce qui gagne ta confiance.', 'Verteile 10 Punkte auf das was Vertrauen gewinnt.', 'Distribuisci 10 punti su cio che guadagna fiducia.'), optionKey: 'allocTrust' },
  { id: 2035, type: 'allocation', budget: 10, text: L('Distribute 10 points across what restores you.', 'Distribuye 10 puntos en lo que te restaura.', 'Distribua 10 pontos no que restaura voce.', 'Distribue 10 points sur ce qui te restaure.', 'Verteile 10 Punkte auf das was dich wiederherstellt.', 'Distribuisci 10 punti su cio che ti ristora.'), optionKey: 'allocRestore' },
  { id: 2036, type: 'allocation', budget: 10, text: L('Distribute 10 points across what feels core.', 'Distribuye 10 puntos en lo que se siente central.', 'Distribua 10 pontos no que parece central.', 'Distribue 10 points sur ce qui semble central.', 'Verteile 10 Punkte auf das was sich zentral anfuhlt.', 'Distribuisci 10 punti su cio che sembra centrale.'), optionKey: 'allocCore' },
  { id: 2037, type: 'confidenceChoice', text: L('New object in your space: baseline response?', 'Objeto nuevo en tu espacio: respuesta base?', 'Objeto novo no seu espaco: resposta base?', 'Nouvel objet dans ton espace : reponse de base ?', 'Neuer Gegenstand in deinem Raum: Grundreaktion?', 'Nuovo oggetto nel tuo spazio: risposta base?'), optionKey: 'roomFirst' },
  { id: 2038, type: 'confidenceChoice', text: L('Someone you care about is off: baseline response?', 'Alguien que te importa esta raro: respuesta base?', 'Alguem importante para voce esta estranho: resposta base?', 'Quelqu un qui compte va mal : reponse de base ?', 'Jemand Wichtiges ist daneben: Grundreaktion?', 'Qualcuno a cui tieni sta male: risposta base?'), optionKey: 'careModes' },
  { id: 2039, type: 'confidenceChoice', text: L('Shared room role that comes easiest?', 'Rol en sala compartida que sale mas facil?', 'Papel em ambiente compartilhado que sai mais facil?', 'Role en piece partagee qui vient le plus facilement ?', 'Rolle im gemeinsamen Raum die am leichtesten kommt?', 'Ruolo in spazio condiviso che viene piu facile?'), optionKey: 'firstTraits' },
  { id: 2040, type: 'confidenceChoice', text: L('If a room needs something, what do you create first?', 'Si una sala necesita algo, que creas primero?', 'Se um ambiente precisa de algo, o que voce cria primeiro?', 'Si une piece a besoin de quelque chose, que crees-tu d abord ?', 'Wenn ein Raum etwas braucht, was erschaffst du zuerst?', 'Se una stanza ha bisogno di qualcosa, cosa crei per prima?'), optionKey: 'compliment' },
  { id: 2041, type: 'stance', pairKey: 'restless', pairSlot: 'a', text: L('Too much routine makes me restless.', 'Demasiada rutina me inquieta.', 'Rotina demais me deixa inquieto.', 'Trop de routine me rend agite.', 'Zu viel Routine macht mich unruhig.', 'Troppa routine mi rende inquieto.'), modifiers: { curiosity: 10, play: 8, comfort: -8 } },
  { id: 2042, type: 'stance', pairKey: 'watchful', pairSlot: 'a', text: L('If a vibe feels off, I keep monitoring it.', 'Si un ambiente se siente raro, sigo vigilando.', 'Se um clima parece estranho, sigo vigiando.', 'Si l ambiance semble bizarre, je continue de surveiller.', 'Wenn sich eine Stimmung seltsam anfuhlt beobachte ich weiter.', 'Se un clima sembra strano, continuo a monitorarlo.'), modifiers: { vigilance: 12, comfort: 4, independence: 4, play: -4 } },
  { id: 2043, type: 'stance', pairKey: 'comfort', pairSlot: 'a', text: L('Comfort changes my whole system.', 'La comodidad cambia todo mi sistema.', 'Conforto muda todo o meu sistema.', 'Le confort change tout mon systeme.', 'Komfort verandert mein ganzes System.', 'Il comfort cambia tutto il mio sistema.'), modifiers: { comfort: 14, warmth: 4, curiosity: -4 } },
  { id: 2044, type: 'stance', pairKey: 'range', pairSlot: 'a', text: L('I need private range to come back honestly.', 'Necesito espacio privado para volver honestamente.', 'Preciso de espaco privado para voltar honestamente.', 'J ai besoin d espace prive pour revenir sincerement.', 'Ich brauche privaten Raum um ehrlich zuruckzukommen.', 'Ho bisogno di spazio privato per tornare sinceramente.'), modifiers: { independence: 14, comfort: 4, warmth: -4 } },
  { id: 2045, type: 'drift', pickCount: 3, pairKey: 'shift', pairSlot: 'a', text: L('Order for intense-day response?', 'Orden para responder a un dia intenso?', 'Ordem para reagir a um dia intenso?', 'Ordre pour reagir a une journee intense ?', 'Reihenfolge fur Reaktion auf intensiven Tag?', 'Ordine per reagire a una giornata intensa?'), optionKey: 'resetModes' },
  { id: 2046, type: 'drift', pickCount: 3, pairKey: 'shift', pairSlot: 'b', text: L('Order for safe-again sequence?', 'Orden para volver a sentirte seguro?', 'Ordem para voltar a se sentir seguro?', 'Ordre pour redevenir en securite ?', 'Reihenfolge um wieder sicher zu werden?', 'Ordine per tornare a sentirti al sicuro?'), optionKey: 'safeAgain' },
  { id: 2047, type: 'tradeoff', budget: 4, pairKey: 'close-space', pairSlot: 'b', text: L('With limited energy, what gets more first?', 'Con energia limitada, que recibe mas primero?', 'Com energia limitada, o que recebe mais primeiro?', 'Avec peu d energie, qu est-ce qui en prend le plus d abord ?', 'Bei wenig Energie, was bekommt zuerst mehr?', 'Con energia limitata, cosa riceve di piu per prima?'), labelKey: 'closeSpace', tradeoffKey: 'closeVsSpace' },
  { id: 2048, type: 'tradeoff', budget: 4, pairKey: 'routine-flex', pairSlot: 'a', text: L('If both cannot win, what wins first?', 'Si ambos no pueden ganar, que gana primero?', 'Se os dois nao podem ganhar, o que ganha primeiro?', 'Si les deux ne peuvent pas gagner, qu est-ce qui gagne d abord ?', 'Wenn nicht beides gewinnen kann, was gewinnt zuerst?', 'Se non possono vincere entrambi, cosa vince per prima?'), labelKey: 'comfortAdventure', tradeoffKey: 'comfortVsAdventure' },
  { id: 2049, type: 'grid', text: L('Which home-base mood feels most like you?', 'Que ambiente base se siente mas como tu?', 'Qual clima base parece mais com voce?', 'Quelle ambiance de base te ressemble le plus ?', 'Welche Grundstimmung passt am meisten zu dir?', 'Quale atmosfera base ti somiglia di piu?'), gridKey: 'socialNest' },
  { id: 2050, type: 'grid', text: L('Which social shape feels most like you?', 'Que forma social se siente mas como tu?', 'Qual forma social parece mais com voce?', 'Quelle forme sociale te ressemble le plus ?', 'Welche soziale Form passt am meisten zu dir?', 'Quale forma sociale ti somiglia di piu?'), gridKey: 'watchWarm' },
  { id: 2051, type: 'sort4', text: L('Order these from most restoring to least restoring.', 'Ordena esto de mas reparador a menos reparador.', 'Ordene isto do mais restaurador ao menos restaurador.', 'Classe ceci du plus reparateur au moins reparateur.', 'Ordne dies von am meisten erholsam zu am wenigsten erholsam.', 'Ordina questo dal piu rigenerante al meno rigenerante.'), optionKey: 'comfortSignals' },
  { id: 2052, type: 'sort4', text: L('Order these from strongest trust signal to weakest.', 'Ordena esto de senal de confianza mas fuerte a mas debil.', 'Ordene isto do sinal de confianca mais forte ao mais fraco.', 'Classe ceci du signal de confiance le plus fort au plus faible.', 'Ordne dies vom starksten Vertrauenssignal zum schwachsten.', 'Ordina questo dal segnale di fiducia piu forte al piu debole.'), optionKey: 'trustMarkers' },
  { id: 2053, type: 'pairMatch', pairKey: 'pair-room', pairSlot: 'a', text: L('Make a room-instinct duo.', 'Forma un duo de instinto en una sala.', 'Monte um duo de instinto no ambiente.', 'Compose un duo d instinct dans une piece.', 'Bilde ein Rauminstinkt-Duo.', 'Crea un duo di istinto nella stanza.'), evidenceLabel: L('your room-instinct duo', 'tu duo de instinto en una sala', 'seu duo de instinto no ambiente', 'ton duo d instinct dans une piece', 'dein Rauminstinkt-Duo', 'il tuo duo di istinto nella stanza'), optionKey: 'pairRoomFlow', pairBonuses: { '0-5': { comfort: 6, vigilance: 4 }, '1-5': { vigilance: 6, independence: 4 }, '2-4': { play: 6, warmth: 4 }, '0-4': { warmth: 6, play: 4 }, '2-3': { curiosity: 6, independence: 4 }, '0-3': { comfort: 5, independence: 5 } } },
  { id: 2054, type: 'pairMatch', pairKey: 'pair-care', pairSlot: 'a', text: L('Make a care-response duo.', 'Forma un duo de respuesta de cuidado.', 'Monte um duo de resposta de cuidado.', 'Compose un duo de reponse de soin.', 'Bilde ein Fursorge-Reaktions-Duo.', 'Crea un duo di risposta di cura.'), evidenceLabel: L('your care-response duo', 'tu duo de respuesta de cuidado', 'seu duo de resposta de cuidado', 'ton duo de reponse de soin', 'dein Fursorge-Reaktions-Duo', 'il tuo duo di risposta di cura'), optionKey: 'pairCareLoop', pairBonuses: { '0-2': { warmth: 7, comfort: 5 }, '1-5': { vigilance: 7, comfort: 3 }, '3-4': { play: 6, independence: 4 }, '2-5': { comfort: 7, vigilance: 3 }, '0-4': { warmth: 5, independence: 5 }, '1-3': { vigilance: 5, play: 5 } } },
  { id: 2055, type: 'pairMatch', pairKey: 'pair-reset', pairSlot: 'a', text: L('Make your reset combo.', 'Forma tu combo de recarga.', 'Monte sua combinacao de recarga.', 'Compose ton combo de recharge.', 'Baue deine Reset-Kombi.', 'Crea la tua combo di ricarica.'), evidenceLabel: L('your reset combo', 'tu combo de recarga', 'sua combinacao de recarga', 'ton combo de recharge', 'deine Reset-Kombi', 'la tua combo di ricarica'), optionKey: 'pairResetArc', pairBonuses: { '0-2': { warmth: 6, comfort: 6 }, '1-3': { curiosity: 7, independence: 5 }, '0-4': { comfort: 6, play: 4 }, '2-4': { warmth: 6, play: 4 }, '1-5': { independence: 7, vigilance: 5 }, '3-4': { curiosity: 5, play: 5 } } },
  { id: 2056, type: 'hold', pairKey: 'hold-home', pairSlot: 'a', text: L('Hold until the amount of closeness your home mode wants feels right.', 'Mantén hasta que la cantidad de cercanía que pide tu modo de casa se sienta correcta.', 'Segure ate a quantidade de proximidade que seu modo de casa pede parecer certa.', 'Maintiens jusqu a ce que la dose de proximite voulue a la maison semble juste.', 'Halte bis sich das Mass an Nahe fur deinen Heimmodus richtig anfuhlt.', 'Tieni premuto finche la quantita di vicinanza che il tuo modo di casa desidera sembra giusta.'), lowLabel: L('Private range', 'Espacio privado', 'Espaco privado', 'Espace prive', 'Privater Raum', 'Spazio privato'), highLabel: L('Soft closeness', 'Cercania suave', 'Proximidade suave', 'Proximite douce', 'Sanfte Nahe', 'Vicinanza dolce'), lowModifiers: { independence: 14, curiosity: 4 }, highModifiers: { warmth: 12, comfort: 6 } },
  { id: 2057, type: 'rhythm', pairKey: 'rhythm-room', pairSlot: 'a', text: L('Tap 4 times with the pace your room-energy actually has.', 'Toca 4 veces con el ritmo que realmente tiene tu energía en una sala.', 'Toque 4 vezes com o ritmo que sua energia no ambiente realmente tem.', 'Tape 4 fois avec le rythme que ton energie a vraiment dans une piece.', 'Tippe 4 Mal im Tempo das deine Energie im Raum wirklich hat.', 'Tocca 4 volte con il ritmo che la tua energia ha davvero in una stanza.'), slowLabel: L('Measured', 'Medido', 'Medido', 'Mesure', 'Bedachtig', 'Misurato'), fastLabel: L('Immediate', 'Inmediato', 'Imediato', 'Immediat', 'Unmittelbar', 'Immediato'), steadyLabel: L('Steady', 'Estable', 'Estavel', 'Stable', 'Konstant', 'Stabile'), wildLabel: L('Spiky', 'Irregular', 'Irregular', 'Saccade', 'Sprunghaft', 'A scatti'), slowModifiers: { vigilance: 10, comfort: 4, independence: 2 }, fastModifiers: { play: 10, warmth: 8, curiosity: 4 }, steadyModifiers: { comfort: 8, warmth: 4, vigilance: 4 }, wildModifiers: { play: 8, curiosity: 8, comfort: -4 } },
  { id: 2058, type: 'constellation', pickCount: 3, pairKey: 'const-room', pairSlot: 'a', text: L('Build your 3-step room instinct.', 'Crea tu instinto de sala en 3 pasos.', 'Monte seu instinto de ambiente em 3 passos.', 'Construis ton instinct de piece en 3 temps.', 'Baue deinen Rauminstinkt in 3 Schritten.', 'Costruisci il tuo istinto nella stanza in 3 passi.'), evidenceLabel: L('your 3-step room instinct', 'tu instinto de sala en 3 pasos', 'seu instinto de ambiente em 3 passos', 'ton instinct de piece en 3 temps', 'deinen Rauminstinkt in 3 Schritten', 'il tuo istinto nella stanza in 3 passi'), optionKey: 'pairRoomFlow', trioBonuses: { '0-2-4': { warmth: 7, play: 5 }, '1-3-5': { vigilance: 7, independence: 5 }, '0-3-4': { comfort: 6, independence: 4 }, '2-4-5': { play: 6, curiosity: 5 } } },
  { id: 2059, type: 'constellation', pickCount: 3, pairKey: 'const-care', pairSlot: 'a', text: L('Build your 3-step care pattern.', 'Crea tu patron de cuidado en 3 pasos.', 'Monte seu padrao de cuidado em 3 passos.', 'Construis ton schema de soin en 3 temps.', 'Baue dein Fursorge-Muster in 3 Schritten.', 'Costruisci il tuo schema di cura in 3 passi.'), evidenceLabel: L('your 3-step care pattern', 'tu patron de cuidado en 3 pasos', 'seu padrao de cuidado em 3 passos', 'ton schema de soin en 3 temps', 'dein Fursorge-Muster in 3 Schritten', 'il tuo schema di cura in 3 passi'), optionKey: 'pairCareLoop', trioBonuses: { '0-2-5': { warmth: 8, comfort: 5 }, '1-3-4': { vigilance: 7, play: 5 }, '0-4-5': { warmth: 6, independence: 5 }, '1-2-3': { curiosity: 6, play: 4 } } },
  { id: 2060, type: 'hold', pairKey: 'hold-recovery', pairSlot: 'a', text: L('Hold until the amount of solitude your reset needs feels honest.', 'Mantén hasta que la cantidad de soledad que necesita tu recarga se sienta honesta.', 'Segure ate a quantidade de solidao que sua recarga precisa parecer honesta.', 'Maintiens jusqu a ce que la dose de solitude dont ta recharge a besoin semble juste.', 'Halte bis sich das Mass an Alleinsein fur deinen Reset ehrlich anfuhlt.', 'Tieni premuto finche la quantita di solitudine di cui la tua ricarica ha bisogno sembra giusta.'), lowLabel: L('Stay near warmth', 'Quedar cerca del calor', 'Ficar perto do calor', 'Rester pres de la chaleur', 'In der Nahe von Warme bleiben', 'Restare vicino al calore'), highLabel: L('Need quiet range', 'Necesito distancia tranquila', 'Preciso de distancia tranquila', 'Besoin d espace calme', 'Brauche ruhigen Abstand', 'Ho bisogno di distanza calma'), lowModifiers: { warmth: 10, comfort: 6 }, highModifiers: { independence: 12, vigilance: 6, comfort: 2 } },
  { id: 2061, type: 'rhythm', pairKey: 'rhythm-reset', pairSlot: 'a', text: L('Tap 4 times in the pace your recovery usually takes.', 'Toca 4 veces con el ritmo que suele tener tu recuperación.', 'Toque 4 vezes no ritmo que sua recuperacao costuma ter.', 'Tape 4 fois au rythme que ta recuperation prend d habitude.', 'Tippe 4 Mal im Tempo das deine Erholung normalerweise hat.', 'Tocca 4 volte al ritmo che il tuo recupero di solito ha.'), slowLabel: L('Slow settle', 'Asentarse lento', 'Assentar devagar', 'Calme lent', 'Langsam beruhigen', 'Calmarsi piano'), fastLabel: L('Quick bounce', 'Rebote rapido', 'Recuperacao rapida', 'Rebond rapide', 'Schneller Aufschwung', 'Ripresa rapida'), steadyLabel: L('Even', 'Parejo', 'Constante', 'Regulier', 'Gleichmassig', 'Regolare'), wildLabel: L('Uneven', 'Irregular', 'Irregular', 'Irregulier', 'Unruhig', 'Irregolare'), slowModifiers: { comfort: 10, vigilance: 4, independence: 2 }, fastModifiers: { play: 8, warmth: 6, curiosity: 6 }, steadyModifiers: { comfort: 8, warmth: 4, vigilance: 4 }, wildModifiers: { curiosity: 8, play: 6, comfort: -4 } },
  { id: 2062, type: 'reaction', pairKey: 'reaction-instinct', pairSlot: 'a', text: L('Test your instinctive reflex. How quickly do you move once the signal is real?', 'Prueba tu reflejo instintivo. Que tan rapido te mueves cuando la senal es real?', 'Teste seu reflexo instintivo. Quao rapido voce se move quando o sinal e real?', 'Teste ton reflexe instinctif. A quelle vitesse bouges-tu quand le signal est reel ?', 'Teste deinen Instinkt-Reflex. Wie schnell bewegst du dich, wenn das Signal echt ist?', 'Metti alla prova il tuo riflesso istintivo. Quanto in fretta ti muovi quando il segnale e reale?'), quickLabel: L('Instant', 'Instantaneo', 'Instantaneo', 'Instantane', 'Sofort', 'Istantaneo'), steadyLabel: L('Measured', 'Medido', 'Misurato', 'Mesure', 'Bedacht', 'Misurato'), slowLabel: L('Delayed', 'Tardio', 'Tardio', 'Retarde', 'Verzoegert', 'In ritardo'), fastCutoffMs: 280, steadyCutoffMs: 520, quickModifiers: { play: 15, curiosity: 12, warmth: 6, vigilance: -2 }, slowModifiers: { vigilance: 3, comfort: 2, independence: 1, play: -8 }, falseStartModifiers: { play: -2, curiosity: 2, vigilance: -10, comfort: -8 } },
  { id: 2063, type: 'timing', pairKey: 'timing-control', pairSlot: 'a', text: L('Stop the meter inside the target zone to test your timing.', 'Deten el medidor dentro de la zona objetivo para probar tu sincronizacion.', 'Pare o medidor dentro da zona alvo para testar seu tempo.', 'Arrete la jauge dans la zone cible pour tester ton timing.', 'Stoppe den Taktgeber in der Zielzone, um dein Timing zu testen.', 'Ferma il misuratore all interno della zona bersaglio per testare il tuo tempismo.'), bullseyeLabel: L('Bullseye', 'Centro exacto', 'Centro exato', 'Plein centre', 'Volltreffer', 'Centro pieno'), nearLabel: L('Close', 'Cerca', 'Perto', 'Proche', 'Nah dran', 'Vicino'), wideLabel: L('Wide miss', 'Lejos', 'Longe', 'Large', 'Daneben', 'Largo'), targetProgress: 0.68, targetTolerance: 0.24, bullseyeThreshold: 0.82, nearThreshold: 0.55, bullseyeModifiers: { vigilance: 14, comfort: 8, independence: 6 }, nearModifiers: { curiosity: 6, vigilance: 4, play: 1 }, wideModifiers: { play: -2, warmth: -2, vigilance: -6, comfort: -4 } },
];

const RECOVERY = [
  { id: 2901, type: 'yesno', isRecoveryItem: true, pairKey: 'recovery-social', pairSlot: 'a', text: L('Even at my best, I prefer a few trusted bonds.', 'Incluso en mi mejor version, prefiero pocos vinculos seguros.', 'Mesmo no meu melhor, prefiro poucos vinculos seguros.', 'Meme a mon meilleur, je prefere quelques liens surs.', 'Selbst in Bestform bevorzuge ich wenige sichere Bindungen.', 'Anche al mio meglio preferisco pochi legami sicuri.'), yesModifiers: { independence: 10, comfort: 6, warmth: 2 }, noModifiers: { warmth: 10, play: 4, independence: -4 } },
  { id: 2902, type: 'yesno', isRecoveryItem: true, pairKey: 'recovery-social', pairSlot: 'b', pairReverse: true, text: L('When a room feels safe, I get much more playful.', 'Cuando una sala se siente segura, me vuelvo mucho mas jugueton.', 'Quando um ambiente parece seguro, fico muito mais brincalhao.', 'Quand une piece semble sure, je deviens bien plus joueur.', 'Wenn sich ein Raum sicher anfuhlt werde ich viel verspielter.', 'Quando una stanza sembra sicura, divento molto piu giocoso.'), yesModifiers: { warmth: 10, play: 10 }, noModifiers: { vigilance: 8, independence: 6, warmth: -4 } },
  { id: 2903, type: 'spectrum', isRecoveryItem: true, pairKey: 'recovery-rhythm', pairSlot: 'a', text: L('Unexpected free time: what calls first?', 'Tiempo libre inesperado: que llama primero?', 'Tempo livre inesperado: o que chama primeiro?', 'Temps libre inattendu : qu est-ce qui appelle d abord ?', 'Unerwartete freie Zeit: was ruft zuerst?', 'Tempo libero inatteso: cosa chiama per prima?'), labelKey: 'comfortAdventure', left: { modifiers: { comfort: 14, vigilance: 4 } }, right: { modifiers: { curiosity: 14, independence: 6, play: 2 } } },
  { id: 2904, type: 'choice', isRecoveryItem: true, text: L('Which statement is closest to your stable baseline?', 'Que frase se acerca mas a tu base estable?', 'Qual frase chega mais perto da sua base estavel?', 'Quelle phrase est la plus proche de ta base stable ?', 'Welche Aussage liegt deiner stabilen Grundlinie am nachsten?', 'Quale frase e piu vicina alla tua base stabile?'), optionKey: 'homeModes' },
  { id: 2905, type: 'allocation', isRecoveryItem: true, budget: 10, text: L('Distribute 10 points across what feels fundamentally true.', 'Distribuye 10 puntos en lo que se siente fundamentalmente cierto.', 'Distribua 10 pontos no que parece fundamentalmente verdadeiro.', 'Distribue 10 points sur ce qui semble fondamentalement vrai.', 'Verteile 10 Punkte auf das was sich grundlegend wahr anfuhlt.', 'Distribuisci 10 punti su cio che sembra fondamentalmente vero.'), optionKey: 'allocCore' },
  { id: 2906, type: 'grid', isRecoveryItem: true, text: L('Which square still sounds true on your calmest day?', 'Que cuadro sigue sonando cierto en tu dia mas calmo?', 'Qual quadrado ainda parece verdadeiro no seu dia mais calmo?', 'Quelle case sonne encore juste lors de ton jour le plus calme ?', 'Welches Feld klingt an deinem ruhigsten Tag noch wahr?', 'Quale riquadro suona ancora vero nel tuo giorno piu calmo?'), gridKey: 'socialNest' },
];

const localizeQuestion = (question, uiLanguage) => {
  const localized = { ...question, text: pick(question.text, uiLanguage) };
  if (question.evidenceLabel) {
    localized.evidenceLabel = pick(question.evidenceLabel, uiLanguage);
  }
  if (question.labelKey && LABELS[question.labelKey]) {
    localized.leftLabel = pick(LABELS[question.labelKey].leftLabel, uiLanguage);
    localized.rightLabel = pick(LABELS[question.labelKey].rightLabel, uiLanguage);
  }
  if (question.optionKey && OPTION_SETS[question.optionKey]) {
    localized.options = OPTION_SETS[question.optionKey].map((entry) => ({ ...entry, text: pick(entry.text, uiLanguage) }));
  }
  if (question.duelKey && DUELS[question.duelKey]) {
    localized.left = { ...DUELS[question.duelKey].left, text: pick(DUELS[question.duelKey].left.text, uiLanguage) };
    localized.right = { ...DUELS[question.duelKey].right, text: pick(DUELS[question.duelKey].right.text, uiLanguage) };
  }
  if (question.tradeoffKey && TRADEOFFS[question.tradeoffKey]) {
    localized.left = { ...TRADEOFFS[question.tradeoffKey].left, text: pick(TRADEOFFS[question.tradeoffKey].left.text, uiLanguage) };
    localized.right = { ...TRADEOFFS[question.tradeoffKey].right, text: pick(TRADEOFFS[question.tradeoffKey].right.text, uiLanguage) };
  }
  if (question.gridKey && GRIDS[question.gridKey]) {
    localized.xLeftLabel = pick(GRIDS[question.gridKey].xLeftLabel, uiLanguage);
    localized.xRightLabel = pick(GRIDS[question.gridKey].xRightLabel, uiLanguage);
    localized.yTopLabel = pick(GRIDS[question.gridKey].yTopLabel, uiLanguage);
    localized.yBottomLabel = pick(GRIDS[question.gridKey].yBottomLabel, uiLanguage);
    localized.options = GRIDS[question.gridKey].options.map((entry) => ({ ...entry, text: pick(entry.text, uiLanguage) }));
  }
  if (question.type === 'hold') {
    localized.lowLabel = pick(question.lowLabel, uiLanguage);
    localized.highLabel = pick(question.highLabel, uiLanguage);
  }
  if (question.type === 'rhythm') {
    localized.slowLabel = pick(question.slowLabel, uiLanguage);
    localized.fastLabel = pick(question.fastLabel, uiLanguage);
    localized.steadyLabel = pick(question.steadyLabel, uiLanguage);
    localized.wildLabel = pick(question.wildLabel, uiLanguage);
  }
  if (question.type === 'guess') {
    localized.leftLabel = pick(question.leftLabel, uiLanguage);
    localized.rightLabel = pick(question.rightLabel, uiLanguage);
  }
  if (question.type === 'flip') {
    localized.previewLabel = pick(question.previewLabel, uiLanguage);
    localized.playLabel = pick(question.playLabel, uiLanguage);
    localized.timerLabel = pick(question.timerLabel, uiLanguage);
    localized.completedLabel = pick(question.completedLabel, uiLanguage);
    localized.retryLabel = pick(question.retryLabel, uiLanguage);
    localized.fastResultLabel = pick(question.fastResultLabel, uiLanguage);
    localized.steadyResultLabel = pick(question.steadyResultLabel, uiLanguage);
    localized.slowResultLabel = pick(question.slowResultLabel, uiLanguage);
  }
  if (question.type === 'reaction') {
    localized.quickLabel = pick(question.quickLabel, uiLanguage);
    localized.steadyLabel = pick(question.steadyLabel, uiLanguage);
    localized.slowLabel = pick(question.slowLabel, uiLanguage);
  }
  if (question.type === 'timing') {
    localized.bullseyeLabel = pick(question.bullseyeLabel, uiLanguage);
    localized.nearLabel = pick(question.nearLabel, uiLanguage);
    localized.wideLabel = pick(question.wideLabel, uiLanguage);
  }
  return localized;
};

export const buildAnimalQuestionBank = (uiLanguage = 'en') => QUESTIONS.map((question) => localizeQuestion(question, uiLanguage));
export const buildAnimalRecoveryBank = (uiLanguage = 'en') => RECOVERY.map((question) => localizeQuestion(question, uiLanguage));
export const ANIMAL_INSTRUCTION_COPY = INSTRUCTIONS;
