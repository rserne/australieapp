// AustralieApp, het verhaal van de dag. Alleen inhoud, de code staat in app.js.
// Controleer na een wijziging met  node check.js
//
// Per dag van de groepsreis één verhaal over de geschiedenis van de plek waar je die dag bent. Achter elkaar
// gelezen vormen ze één lijn, van tienduizenden jaren Aboriginal-geschiedenis tot nu, met een Nederlandse draad
// erdoorheen. Per verhaal:
//   t     de titel (kort, zonder punt)
//   tekst de alinea's, samen zo'n 200 tot 300 woorden: twee minuten lezen in de bus
//   bron  waar de feiten vandaan komen, zodat je verder kunt lezen
// De sleutel is het dagnummer (1 t/m 29). Een voorreisdag kan later met zijn datum als sleutel, "2026-09-20".
// Overleden Aboriginal-mensen worden alleen bij naam genoemd waar dat in Australië zelf gebruikelijk is.
const VERHALEN={

1:{t:"Een enkeltje Australië",
 tekst:[
  "Vandaag vlieg je in een dag naar de andere kant van de wereld. Zeventig jaar geleden deden tienduizenden Nederlanders dezelfde reis, maar dan per schip, in vijf weken, en meestal zonder retour. Na de Tweede Wereldoorlog was Nederland verwoest en overvol, en Australië zocht juist mensen. In 1951 sloten de twee landen een emigratieverdrag, en beide regeringen betaalden mee aan de overtocht.",
  "Schepen als de Johan van Oldenbarnevelt en de Sibajak voeren vanuit Rotterdam en Amsterdam via het Suezkanaal naar Fremantle, Melbourne en Sydney. Aan boord zaten boerenzonen, timmerlieden en jonge gezinnen met een kist vol huisraad. Eenmaal aangekomen belandden velen eerst maanden in een opvangkamp, zoals Bonegilla in Victoria, in golfplaten barakken. Van daaruit gingen ze aan het werk: in de bouw, op de suikerrietvelden, bij de grote stuwdammen in de Snowy Mountains.",
  "Tussen 1947 en het begin van de jaren zeventig vertrokken er zo'n 160.000 Nederlanders naar Australië. Ongeveer een op de drie keerde later terug. Ze stonden bekend als harde werkers die zich snel aanpasten, soms zo snel dat hun kinderen geen Nederlands meer spraken. Bij de laatste volkstelling noemden zo'n 380.000 Australiërs zich van Nederlandse afkomst.",
  "Kijk onderweg maar eens om je heen. Een bakkerij die Dutch heet, een Van der-achternaam op een bedrijfsbus: de kans is groot dat je de komende weken een spoor van die emigranten tegenkomt."
 ],
 bron:"National Archives of Australia, Netherlands–Australia Migration Agreement (1951); Museums Victoria, Bonegilla Migrant Reception Centre"},

2:{t:"De vloot die bleef",
 tekst:[
  "Op 26 januari 1788 liet kapitein Arthur Phillip de Britse vlag hijsen aan een baai die hij Sydney Cove noemde. Daar ligt nu Circular Quay, een kwartier van je hotel. Zijn vloot van elf schepen was acht maanden onderweg geweest uit Portsmouth, met zo'n 1.400 mensen aan boord, onder wie ruim 750 veroordeelden. Ze kwamen een strafkolonie stichten, omdat de Britse gevangenissen overvol waren en Amerika na de onafhankelijkheid geen gevangenen meer wilde.",
  "Het land was niet leeg. Rond de haven woonden de Gadigal, een van de volken van de Eora. Zij visten met speren en lijnen in de baai, en hun rotstekeningen staan nog altijd op de zandsteen rond Sydney. Een van de eersten die Phillip leerde kennen, was Bennelong, een Wangal-man die in 1789 op bevel van de gouverneur werd ontvoerd zodat de Britten zijn taal konden leren. Hij werd een tussenpersoon tussen twee werelden, reisde zelfs naar Londen en keerde terug. De landtong waar de Britten een hutje voor hem bouwden, heet nog steeds Bennelong Point. Daar staat nu het Opera House.",
  "Voor de Eora was de komst van de vloot een ramp. In 1789 brak er een pokkenepidemie uit die een groot deel van hen het leven kostte. Daarom heet 26 januari voor veel Aboriginal Australiërs geen Australia Day maar Invasion Day, of Survival Day.",
  "Wie vandaag langs het water loopt, ziet op veel plekken bordjes met de woorden ‘Gadigal Country’. Dat is geen versiering: zo erkent de stad wie hier als eerste woonde."
 ],
 bron:"Australian Dictionary of Biography, Arthur Phillip en Bennelong; State Library of New South Wales; City of Sydney, Barani/Barrabugu"},

3:{t:"De architect die nooit terugkwam",
 tekst:[
  "In 1957 won een onbekende Deense architect van achtendertig, Jørn Utzon, de prijsvraag voor een operagebouw in Sydney. Hij had nog nooit in Australië gestaan. Zijn ontwerp was weinig meer dan een paar schetsen van witte schelpen boven een sokkel, en volgens het bekende verhaal viste jurylid Eero Saarinen het uit de stapel afgewezen inzendingen. De begroting was zeven miljoen dollar, de bouw zou vier jaar duren.",
  "Het werden er veertien. Niemand wist hoe je die schelpen moest bouwen. Utzon zocht jaren naar een oplossing en vond die, volgens hemzelf, toen hij een sinaasappel schilde: alle schelpen konden uit dezelfde bol worden gesneden. Zo konden de dakdelen in serie worden gemaakt, bekleed met ruim een miljoen Zweedse tegels.",
  "Ondertussen liepen de kosten op en kwam er een nieuwe regering die geen geduld meer had. Het ministerie hield betalingen achter en bemoeide zich met het interieur. In 1966 stapte Utzon op. Hij vertrok met zijn gezin uit Australië en kwam nooit meer terug, ook niet toen koningin Elizabeth het gebouw in 1973 opende. Het interieur werd door anderen afgemaakt. De uiteindelijke kosten waren 102 miljoen dollar, grotendeels betaald met een loterij.",
  "Pas aan het eind van zijn leven kwam de verzoening. In 1999 vroeg het Opera House hem om richtlijnen voor de toekomst, en een zaal werd naar zijn ontwerp verbouwd: de Utzon Room. In 2003 kreeg hij de Pritzkerprijs, in 2007 kwam het gebouw op de Werelderfgoedlijst. Utzon stierf een jaar later, zonder zijn bekendste werk ooit af te hebben gezien."
 ],
 bron:"Sydney Opera House, The Utzon Story; UNESCO World Heritage Centre, Sydney Opera House (2007)"},

4:{t:"Zwarte zondag op Bondi",
 tekst:[
  "Tot 1903 was zwemmen bij daglicht op de stranden van Sydney verboden. Het gold als onfatsoenlijk. Toen een krantenman in Manly in 1902 het verbod openlijk aan zijn laars lapte en niet werd vervolgd, ging het hek van de dam. Binnen een paar jaar stonden de stranden vol, en verdronken er ook veel mensen: bijna niemand kon goed zwemmen, en de stroming langs deze kust is verraderlijk.",
  "Daarom richtten vrijwilligers in 1907 in Bondi een van de eerste reddingsclubs ter wereld op. Ze oefenden met een lijn op een haspel en patrouilleerden in hun eigen tijd. Het idee verspreidde zich langs de hele kust. Nog steeds zie je op elk bewaakt strand de rood-gele vlaggen, en daartussen hoor je te zwemmen.",
  "Op zondag 6 februari 1938 werd die traditie op de proef gesteld. Het was een warme dag, het strand van Bondi zat vol, en zo'n 35.000 mensen waren in de buurt. Rond drie uur 's middags rolden er kort na elkaar drie enorme golven het strand op. Toen het water terugtrok, sleurde het honderden zwemmers mee de zee in. Toevallig stonden er net tientallen redders klaar voor een wedstrijd. Binnen een halfuur haalden ze meer dan tweehonderd mensen uit het water. Vijf mensen kwamen om. Het is de grootste reddingsactie in de geschiedenis van de Australische strandwacht.",
  "Als je vanochtend in Bondi aankomt, kijk dan even naar het gebouw van de Bondi Surf Bathers' Life Saving Club aan het strand. Die club bestaat nog altijd, en draait nog steeds op vrijwilligers."
 ],
 bron:"Surf Life Saving Australia; Waverley Council, Black Sunday 1938; National Museum of Australia, Defining Moments: Surf lifesaving"},

5:{t:"Over de bergen",
 tekst:[
  "Vijfentwintig jaar lang kwamen de Britten in Sydney niet verder dan de Blue Mountains. Wie het probeerde, volgde de rivieren de dalen in en liep vast tegen loodrechte zandsteenwanden. De kolonie zat ingeklemd tussen de zee en de bergen, en de boeren hadden grond nodig.",
  "In mei 1813 vertrokken drie kolonisten, Gregory Blaxland, William Lawson en William Charles Wentworth, met vier bedienden, vijf honden en vier paarden. Ze deden het anders: in plaats van de dalen volgden ze de bergruggen. Drie weken lang hakten ze zich een weg door het struikgewas. Op het einde zagen ze vanaf een top in het westen open, grazig land. De doorbraak was een feit, en binnen twee jaar legden dertig veroordeelden er onder leiding van William Cox een weg van ruim 160 kilometer aan, in een half jaar.",
  "In de Australische schoolboeken waren de drie heren de ontdekkers. Maar de Darug en Gundungurra, de volken van deze bergen, liepen al duizenden jaren over deze ruggen. Hun paden verbonden de kust met het binnenland, en de kolonisten volgden die vaak zonder het te weten.",
  "Ook de Three Sisters hebben een verhaal met twee kanten. De legende van drie zussen die in rotsen werden veranderd, wordt vaak als oud Aboriginal-verhaal verteld, maar ze is in de twintigste eeuw door een niet-Aboriginal schrijver opgeschreven en komt waarschijnlijk niet uit de overlevering. De Gundungurra hebben hun eigen verhalen over deze plek. Vraag bij Echo Point maar eens welke."
 ],
 bron:"Australian Dictionary of Biography, Gregory Blaxland; Blue Mountains City Council; NSW National Parks and Wildlife Service, Blue Mountains National Park"},

6:{t:"De timmerman die aan land zwom",
 tekst:[
  "In augustus 1642 vertrok Abel Tasman uit Batavia met twee schepen, de Heemskerck en de Zeehaen. De Verenigde Oostindische Compagnie wilde weten wat er ten zuiden van de bekende kusten lag, en of er handel te drijven viel. Op 24 november zag de bemanning een bergachtige kust opdoemen. Tasman noemde het land naar zijn baas, de gouverneur-generaal: Anthoonij van Diemenslandt.",
  "Een week later voeren ze een baai in aan de oostkust. Ze hoorden stemmen in het bos en iets wat leek op een gong, en zagen bomen met trapsgewijze inkepingen, zo ver uit elkaar dat ze zich afvroegen hoe lang de bewoners wel niet waren. Op 3 december wilde Tasman het land officieel in bezit nemen, maar de zee was te ruw om te landen. Daarop sprong timmerman Pieter Jacobsz overboord. Hij zwom met een paal en een vlag naar de kust, zette de paal in de grond en zwom terug. Zo nam de Compagnie het land in bezit, zonder dat er één Nederlander een nacht op had doorgebracht.",
  "De Compagnie had er verder weinig aan: geen goud, geen specerijen. Tasman zeilde door en ontdekte Nieuw-Zeeland. Pas ruim anderhalve eeuw later kwamen de Britten, die in 1806 onder meer Launceston stichtten. In 1856 kreeg het eiland officieel de naam van de man die het als eerste Europeaan zag: Tasmania.",
  "De inkepingen in de bomen waren geen werk van reuzen, zoals later werd naverteld. Het waren voetsteunen, door de Palawa in de stammen gehakt om op possums te jagen. Zij woonden hier toen al zo'n 35.000 jaar."
 ],
 bron:"Journaal van Abel Janszoon Tasman (1642–1643); Australian Dictionary of Biography, Abel Janszoon Tasman; Libraries Tasmania"},

7:{t:"Een park voor iedereen",
 tekst:[
  "Op 4 januari 1910 stonden de Oostenrijker Gustav Weindorfer en zijn Australische vrouw Kate op de top van Cradle Mountain. Weindorfer was in 1900 naar Australië gekomen en was gek op planten en bergen. Boven zei hij de zin die nu op borden in het park staat: dit moet een nationaal park worden, voor iedereen en voor altijd.",
  "Het echtpaar kocht grond in het dal en bouwde er met eigen handen een chalet van het hout van de koningsden, een boom die alleen in Tasmanië groeit. Ze noemden het Waldheim, ‘thuis in het bos’. Vanaf 1912 ontvingen ze er wandelaars, kookten voor hen en namen hen mee de bergen in. Ondertussen schreven ze brieven aan politici om het gebied te beschermen.",
  "Kate overleed in 1916. Gustav bleef alleen achter en woonde vanaf toen vrijwel het hele jaar in Waldheim, ook in de winters vol sneeuw. In de Eerste Wereldoorlog keken veel Tasmaniërs met argwaan naar de man met het Duitse accent, maar hij hield vol. In 1922 werd het gebied tussen Cradle Mountain en Lake St Clair een beschermd natuurreservaat, het begin van het nationale park waar je vandaag wandelt. Weindorfer stierf in 1932.",
  "Waldheim staat er nog, vlak bij Ronny Creek. Het huidige chalet is een reconstructie, maar de plek is dezelfde. Het park, dat in 1982 op de Werelderfgoedlijst kwam, is precies geworden wat hij op die top beloofde: voor iedereen."
 ],
 bron:"Tasmania Parks and Wildlife Service, Waldheim Chalet; Australian Dictionary of Biography, Gustav Weindorfer"},

8:{t:"De vrouw die zwom",
 tekst:[
  "De Bay of Fires dankt zijn naam niet aan de oranje rotsen. In 1773 voer kapitein Tobias Furneaux, op de tweede reis van James Cook, langs deze kust en zag overal rook en vuren op het strand. Het waren de kampvuren van de Palawa, die hier al duizenden jaren leefden van schelpdieren, zeehonden en vogeleieren. De afvalhopen van hun maaltijden, met lagen schelpen, liggen nog altijd achter de duinen.",
  "Een paar decennia later kwamen de walvisvaarders en robbenjagers. Rond Bicheno woonden ruwe mannen die vaak met geweld Palawa-vrouwen meenamen. Een van die vrouwen was Wauba Debar. Volgens het verhaal sloeg de boot van haar ontvoerders op een dag om in de storm. Wauba Debar zwom de zee in, haalde de twee mannen een voor een naar de kust en redde zo hun leven.",
  "In 1855 zamelden de inwoners van Bicheno geld in voor een grafsteen voor haar, iets wat voor een Aboriginal-vrouw in die tijd zeldzaam was. Volgens het opschrift stierf ze in 1832, al twijfelen historici aan dat jaartal. Eind negentiende eeuw werden haar resten opgegraven en naar een museum in Hobart gebracht. Pas in 1985 kreeg de Aboriginal-gemeenschap ze terug. Het gedenkteken staat nog in Bicheno, en de baai heet naar haar: Waubs Bay. De eerste naam van het dorp was zelfs Waub's Boat Harbour.",
  "Haar redding valt in de donkerste periode van Tasmanië. Tussen ongeveer 1824 en 1832 woedde de Black War tussen kolonisten en Palawa, en na afloop waren er nog maar een paar honderd Palawa over. Hun nazaten leven nog altijd op het eiland. Als je vanavond langs Waubs Bay loopt, weet je naar wie het water heet."
 ],
 bron:"Break O'Day Council en Glamorgan Spring Bay Council; Tasmanian Aboriginal Centre; Australian Dictionary of Biography, Tobias Furneaux"},

9:{t:"De Fransen waren er eerst",
 tekst:[
  "Freycinet is een Franse naam, en dat is geen toeval. In 1802 voeren twee Franse schepen langs deze kust, de Géographe en de Naturaliste, onder leiding van Nicolas Baudin. Napoleon had de expeditie gestuurd voor de wetenschap: aan boord zaten tekenaars, plantkundigen en dierkundigen. Ze brachten de kust nauwkeurig in kaart en gaven namen aan alles wat ze zagen. Het schiereiland vernoemden ze naar Louis de Freycinet, een jonge officier aan boord. Zijn broer Henri voer ook mee.",
  "De Fransen waren nieuwsgierig naar de Palawa. Ze bleven dagen bij hen, ruilden, tekenden portretten en schreven op wat ze zagen. De tekeningen van kunstenaar Nicolas-Martin Petit behoren tot de vroegste beelden van de oorspronkelijke Tasmaniërs.",
  "In Sydney zagen de Britten de Franse expeditie met groeiende zorg. Wie verzekerde hen ervan dat Frankrijk hier geen kolonie zou stichten? Gouverneur King nam geen risico en stuurde in 1803 een kleine groep naar de rivier de Derwent. Een jaar later verhuisde de nederzetting naar een betere plek verderop. Dat werd Hobart, waar je vanavond slaapt: een stad die bestaat omdat de Britten bang waren voor de Fransen.",
  "Baudin zelf haalde het eind van de reis niet. Hij stierf in 1803 op Mauritius aan tuberculose. Zijn expeditie bracht wel meer dan honderdduizend specimens mee naar Frankrijk, waaronder levende kangoeroes en emoes voor de tuin van keizerin Joséphine."
 ],
 bron:"Australian Dictionary of Biography, Nicolas Baudin; State Library of New South Wales, The Baudin Expedition; Libraries Tasmania"},

10:{t:"Een rij honden",
 tekst:[
  "Tussen 1803 en 1853 stuurde Groot-Brittannië zo'n 75.000 veroordeelden naar Van Diemen's Land, bijna de helft van alle dwangarbeiders die naar Australië gingen. De meesten werkten in de kolonie, als knecht, wegenbouwer of op de boerderij. Wie opnieuw de fout in ging, kwam in Port Arthur terecht, op het schiereiland dat je vandaag met de boot ziet.",
  "Port Arthur was opgezet als de perfecte gevangenis, een ‘machine om schurken eerlijk te maken’. Er was werk in de houtzagerij en op de scheepswerf, er waren lessen en er was een kerk. Rond 1850 kwam er een gevangenis waar mannen in stilte en afzondering zaten, zonder elkaar ooit te zien, zelfs met een kap over hun hoofd in de gang.",
  "Ontsnappen leek makkelijk, want er stonden geen muren omheen. Maar het schiereiland hangt alleen via Eaglehawk Neck aan de rest van Tasmanië, een landengte van nog geen honderd meter breed. Daar zetten de bewakers een rij vastgeketende honden neer, de dog line, zo dicht bij elkaar dat niemand ertussendoor kon. Om zwemmers af te schrikken lieten ze geruchten verspreiden dat het water vol haaien zat. Toch probeerde het een enkeling: William Hunt verkleedde zich in een kangoeroevel om over de landengte te springen. De bewakers wilden het dier schieten, waarop hij riep dat hij zich overgaf.",
  "In 1877 ging de gevangenis dicht. Het terrein is nu werelderfgoed. Als je vandaag langs Eaglehawk Neck vaart, kijk dan naar die smalle strook land: meer was er niet nodig."
 ],
 bron:"Port Arthur Historic Site Management Authority; UNESCO World Heritage Centre, Australian Convict Sites (2010)"},

11:{t:"Een stad zonder ketenen",
 tekst:[
  "Adelaide is anders dan de andere hoofdsteden van Australië, en daar zijn de inwoners trots op. Hier kwamen geen dwangarbeiders. De kolonie Zuid-Australië werd in 1836 gesticht als experiment: grond werd verkocht in plaats van weggegeven, en met de opbrengst werd de overtocht van jonge arbeiders en hun gezinnen betaald. Het idee kwam van Edward Gibbon Wakefield, die het overigens zelf had bedacht in de gevangenis.",
  "Kolonel William Light kreeg de opdracht een plek te kiezen en een stad te ontwerpen. Hij koos de vlakte aan de rivier de Torrens, ondanks felle kritiek van anderen die liever een plek aan zee wilden. Zijn ontwerp was een raster van brede straten met pleinen, en daaromheen een brede gordel van parken die nooit bebouwd mocht worden. Die parklands liggen er nog bijna allemaal. Jullie hotel kijkt erop uit.",
  "Light kreeg weinig waardering. Hij moest in een paar weken een stad uitzetten die hij in maanden had willen doen, raakte in conflict met de gouverneur en nam ontslag. In 1839 stierf hij aan tuberculose. Op zijn standbeeld op Montefiore Hill wijst hij naar de stad die hij bedacht.",
  "Ook hier was het land niet leeg. Het was en is het land van de Kaurna. Aan het begin probeerde de kolonie hun rechten op papier te beschermen, maar in de praktijk werden ze verdreven. Je ziet hun taal terug in nieuwe namen in de stad, zoals Tarntanya voor het centrum."
 ],
 bron:"State Library of South Australia; Australian Dictionary of Biography, William Light; Kaurna Warra Karrpanthi"},

12:{t:"De eerste vrouwen in de politiek",
 tekst:[
  "In 1894 schreef Zuid-Australië wereldgeschiedenis. Als een van de eerste plaatsen ter wereld kregen vrouwen hier bij wet stemrecht, en als allereerste kregen ze ook het recht om zich verkiesbaar te stellen voor het parlement. Nieuw-Zeeland was een jaar eerder met het stemrecht, maar daar mochten vrouwen nog niet zelf in de politiek.",
  "Het kwam niet vanzelf. Jarenlang streden vrouwen als Mary Lee, een Ierse weduwe die naar Adelaide was gekomen, voor gelijke rechten. Ze organiseerden bijeenkomsten, schreven in de kranten en verzamelden handtekeningen. In 1894 brachten ze een petitie naar het parlement met ruim 11.600 namen. Aan elkaar geplakt was hij ruim honderd meter lang. Hij ligt nog in het archief van het parlement aan North Terrace.",
  "Een van de bekendste strijdsters was Catherine Helen Spence, schrijfster, journaliste en predikante. In 1897 stelde zij zich verkiesbaar voor de conventie die de Australische grondwet zou schrijven. Ze werd niet gekozen, maar ze was wel de eerste vrouwelijke kandidaat bij een politieke verkiezing in Australië. In 2001 stond ze op een speciaal herdenkingsbiljet van vijf dollar, voor honderd jaar federatie.",
  "Een kanttekening hoort erbij. Het stemrecht gold in Zuid-Australië ook voor Aboriginal vrouwen en mannen, maar na de federatie in 1901 werden zij op landelijk niveau grotendeels uitgesloten. Pas in 1962 kregen alle Aboriginal Australiërs overal stemrecht."
 ],
 bron:"Parliament of South Australia, Women's Suffrage Petition 1894; Australian Dictionary of Biography, Catherine Helen Spence en Mary Lee; Australian Electoral Commission"},

13:{t:"De leeuw in de grot",
 tekst:[
  "In 1969 kropen een paar grottenonderzoekers in de Victoria Fossil Cave bij Naracoorte door een nauwe gang die nog niemand had verkend. Ze kwamen uit in een kamer waar de bodem bezaaid lag met botten. Het bleken de resten van duizenden dieren te zijn, die over honderdduizenden jaren door een gat in het dak naar beneden waren gevallen en de weg terug niet vonden.",
  "Tussen die botten zaten dieren die niemand ooit levend heeft gezien. Diprotodon, een buideldier zo groot als een neushoorn. Kangoeroes van bijna tweeënhalve meter met een kort, plat gezicht. En Thylacoleo carnifex, de buidelleeuw: een roofdier met een beet die naar verhouding sterker was dan die van welk zoogdier ook, en een duim met een lange klauw. De grotten van Naracoorte behoren nu tot de rijkste fossielvindplaatsen ter wereld en staan sinds 1994 op de Werelderfgoedlijst.",
  "Rond 45.000 jaar geleden verdwenen deze reuzen. Waarom, daarover zijn wetenschappers het nog altijd niet eens. Het klimaat werd droger, maar het gebeurde ook enkele duizenden jaren nadat de eerste mensen op het continent waren aangekomen. Joegen zij de dieren uit, veranderde het landschap door hun vuren, of was het allebei? De botten in Naracoorte zijn een van de belangrijkste bronnen om het uit te zoeken.",
  "In de grot zie je het skelet van een buidelleeuw zoals hij gevonden is. Kijk vooral naar de tanden."
 ],
 bron:"UNESCO World Heritage Centre, Australian Fossil Mammal Sites (Riversleigh / Naracoorte); National Parks and Wildlife Service South Australia, Naracoorte Caves"},

14:{t:"Het gelukkige land",
 tekst:[
  "In 1836 trok majoor Thomas Mitchell, de landmeter-generaal van New South Wales, met een expeditie naar het zuiden. Toen hij het westen van wat nu Victoria is bereikte, kon hij zijn ogen niet geloven: groen grasland, rivieren, bergen. Hij noemde de streek Australia Felix, gelukkig Australië. De bergketen die hij zag, deed hem denken aan de Grampians in Schotland, en zo noemde hij die ook.",
  "Mitchells lovende verslag ging als een lopend vuurtje rond. Binnen een paar jaar trokken squatters met hun schapen en vee het land in, en eigenden zich enorme stukken grond toe zonder iets te betalen. Het was het land van de Djab Wurrung en de Jardwadjali, die er al tienduizenden jaren woonden. Ze werden verdreven, en het kwam tot geweld. Binnen een generatie was hun leven onherkenbaar veranderd.",
  "Wat de bergen nog wel bewaren, is hun kunst. In de Grampians ligt het grootste deel van alle rotskunst van Victoria. In schuilplaatsen als Ngamadjidj, waar jullie vanochtend komen, zijn figuren met witte klei op de rots aangebracht, en elders handafdrukken en sporen van emoes.",
  "Tegenwoordig draagt het park officieel twee namen: Grampians en Gariwerd, de naam die de oorspronkelijke bewoners gebruikten. Het park wordt steeds meer samen met de traditionele eigenaren beheerd. Kijk bij de rotskunst goed, maar raak niets aan."
 ],
 bron:"Australian Dictionary of Biography, Sir Thomas Mitchell; Parks Victoria, Grampians National Park (Gariwerd); Brambuk – The National Park & Cultural Centre"},

15:{t:"Een schilderij als bouwtekening",
 tekst:[
  "Tower Hill is een vulkaan die zo'n 35.000 jaar geleden uitbarstte. Toen de eerste Europeanen hier kwamen, lag in de krater een meer met eilanden vol bos, vogels en dieren. In 1855 schilderde de Oostenrijkse kunstenaar Eugene von Guérard het landschap, tot in het kleinste detail: elke boom, elk eiland, de vulkaankegels in het licht van de middag.",
  "Daarna ging het mis. Kolonisten kapten de bomen voor brandhout en bouwgrond, lieten er vee grazen en groeven er naar zand. Rond 1900 was de krater een kale, uitgeputte vlakte, en de dieren waren verdwenen.",
  "In de jaren zestig van de twintigste eeuw besloot men de natuur te herstellen. Maar hoe weet je hoe een landschap er een eeuw eerder uitzag? Het antwoord hing in een museum in Warrnambool: het schilderij van Von Guérard. Het was zo precies dat botanici er soorten van bomen en struiken op konden herkennen, en zelfs zagen waar ze hadden gestaan. Met het schilderij als bouwtekening plantten vrijwilligers en scholieren zo'n kwart miljoen bomen en struiken. Daarna kwamen de dieren terug, en werden er emoes, koala's en kangoeroes uitgezet.",
  "Het is een van de vroegste natuurherstelprojecten van Australië. Het schilderij hangt nog altijd in de Warrnambool Art Gallery, waar je vanavond op loopafstand bent. Vandaag wordt Tower Hill beheerd met de Worn Gundidj, de Aboriginal-gemeenschap van deze streek, voor wie de vulkaan nooit is opgehouden belangrijk te zijn."
 ],
 bron:"Warrnambool Art Gallery, Eugene von Guérard, Tower Hill (1855); Worn Gundidj Aboriginal Cooperative; Parks Victoria, Tower Hill Wildlife Reserve"},

16:{t:"De twee overlevenden",
 tekst:[
  "In de nacht van 1 juni 1878 voer de klipper Loch Ard na drie maanden op zee de laatste mijlen naar Melbourne. In de mist zag de kapitein te laat de kliffen. Het schip liep op een rif bij het eiland Mutton Bird en zonk binnen een kwartier. Van de 54 mensen aan boord overleefden er twee, allebei achttien jaar oud.",
  "Tom Pearce, een jonge scheepsjongen, klampte zich vast aan een omgeslagen reddingsboot en spoelde aan in een smalle kloof tussen de kliffen. Daar hoorde hij hulpgeroep uit zee. Het was Eva Carmichael, een Ierse passagier die met haar ouders, broers en zussen naar Australië emigreerde en uren in het koude water had gedreven. Tom zwom haar tegemoet en haalde haar aan land. Daarna klom hij de kliffen op om hulp te halen.",
  "Heel Australië volgde het verhaal, en hoopte op een huwelijk. Dat kwam er niet: Eva keerde terug naar Ierland, en ze zagen elkaar nooit meer. De kloof waar ze aanspoelden heet sindsdien Loch Ard Gorge, vlak bij de Twelve Apostles. Langs deze kust vergingen zoveel schepen dat hij de Shipwreck Coast heet.",
  "De weg waarop je vandaag rijdt, is zelf ook een gedenkteken. Tussen 1919 en 1932 hakten zo'n drieduizend teruggekeerde soldaten uit de Eerste Wereldoorlog de Great Ocean Road uit de rotsen, met schoppen, houwelen en dynamiet. Hij is opgedragen aan hun gesneuvelde kameraden, en geldt als het grootste oorlogsmonument ter wereld."
 ],
 bron:"Flagstaff Hill Maritime Museum, Loch Ard; Parks Victoria, Port Campbell National Park; Great Ocean Road Heritage"},

17:{t:"Hoofdstad voor even",
 tekst:[
  "In 1851 werd er goud gevonden in Victoria, bij Ballarat en Bendigo, en de wereld stroomde toe. In tien jaar tijd werd de bevolking van de kolonie zeven keer zo groot. Melbourne groeide van een provinciestadje uit tot een van de rijkste steden ter wereld, Marvellous Melbourne. Met het goud werden de statige gebouwen betaald die je vandaag ziet, zoals het parlementsgebouw aan Spring Street en de arcades rond Collins Street.",
  "Het goud bracht ook onrust. Goudzoekers moesten een duur vergunningsbewijs betalen, en de politie controleerde dat hardhandig. In 1854 bouwden ze bij Ballarat een palissade, de Eureka Stockade, onder een blauwe vlag met het Zuiderkruis. De troepen bestormden hem bij zonsopgang en er vielen tientallen doden. Toch kregen de goudzoekers daarna veel van hun eisen, waaronder stemrecht. Eureka geldt als een van de geboortemomenten van de Australische democratie.",
  "Een halve eeuw later besloten de zes koloniën samen een land te vormen. Op 1 januari 1901 werd het Gemenebest van Australië uitgeroepen. Sydney en Melbourne konden het niet eens worden over de hoofdstad, dus werd besloten een nieuwe stad te bouwen, ergens daartussen: Canberra. Tot die klaar was, zat het parlement in Melbourne. Het eerste parlement werd geopend in het Royal Exhibition Building in Carlton, nu werelderfgoed.",
  "Daarna vergaderde het in het parlementsgebouw van Victoria aan Spring Street. Het bleef er tot 1927, ruim een kwarteeuw. Melbourne was dus langer hoofdstad dan veel mensen denken."
 ],
 bron:"Museums Victoria, Royal Exhibition Building; Parliament of Victoria; Museum of Australian Democracy at Eureka"},

18:{t:"De teruggave",
 tekst:[
  "Voor de Anangu, de Aboriginal-bewoners van deze streek, is Uluru geen rots maar een plek vol verhalen. Elke spleet, elke vlek en elke grot hoort bij het werk van voorouderwezens uit de Tjukurpa, de wet die het leven hier al tienduizenden jaren regelt. Sommige plekken zijn alleen voor mannen, andere alleen voor vrouwen, en daarom vragen de Anangu bezoekers daar geen foto's te maken.",
  "De eerste Europeaan die de rots bereikte, was ontdekkingsreiziger William Gosse in 1873. Hij noemde haar Ayers Rock, naar Henry Ayers, een vooraanstaand politicus in Zuid-Australië. In de twintigste eeuw werd het gebied een reservaat en daarna een toeristische trekpleister, met hotels aan de voet van de rots en een kettingpad naar de top. De Anangu hadden er weinig over te zeggen.",
  "Daar kwam op 26 oktober 1985 verandering in. In een ceremonie aan de voet van Uluru overhandigde gouverneur-generaal Ninian Stephen de eigendomspapieren aan de Anangu. Dezelfde dag gaven zij het park voor 99 jaar in pacht terug aan de nationale parkdienst, om het samen te beheren. Het was een keerpunt in de Australische geschiedenis.",
  "Jarenlang vroegen de Anangu bezoekers om de rots niet te beklimmen: voor hen is het pad naar de top een heilige route, en er kwamen ook mensen bij om. Precies 34 jaar na de teruggave, op 26 oktober 2019, ging het klimpad voorgoed dicht. Jullie zijn hier vlak voor die datum: de teruggave van Uluru is binnenkort 41 jaar geleden."
 ],
 bron:"Parks Australia, Uluru-Kata Tjuta National Park; National Museum of Australia, Defining Moments: Uluru handback"},

19:{t:"Een draad door de woestijn",
 tekst:[
  "In 1870 duurde een brief van Australië naar Engeland twee maanden. Charles Todd, de hoofdtelegrafist van Zuid-Australië, wilde daar iets aan doen. Zijn plan was even eenvoudig als gewaagd: een telegraaflijn van Adelaide dwars door het continent naar Darwin, waar een onderzeese kabel aankwam die via Java naar Europa liep. Ruim 3.000 kilometer, door land dat de meeste Europeanen nog nooit hadden gezien.",
  "Ploegen werkten vanuit het noorden en het zuiden naar elkaar toe. Ze sleepten 36.000 palen door de woestijn, groeven waterputten en vochten tegen hitte, zandstormen en in het noorden tegen de moesson. Op 22 augustus 1872 werden de twee einden aan elkaar gelast. Een bericht naar Londen duurde nu geen maanden meer, maar uren.",
  "Om de zoveel honderd kilometer stond een station waar telegrafisten de berichten opnieuw doorseinden. Een van die stations kwam bij een waterbron in de MacDonnell Ranges, die de landmeter naar Todds vrouw had vernoemd: Alice Springs. Rond het station groeide het plaatsje waar je vandaag aankomt. Het oude telegraafstation, een paar kilometer buiten de stad, staat er nog.",
  "De Arrernte, de oorspronkelijke bewoners, noemen de plek Mparntwe. Voor hen liep de lijn door land vol betekenis, en het station bracht niet alleen berichten, maar ook vee, vreemdelingen en het verlies van hun waterbronnen. Wat voor Europa het einde van de afstand was, was voor hen het begin van een ingrijpende verandering."
 ],
 bron:"Alice Springs Telegraph Station Historical Reserve (NT Parks); Australian Dictionary of Biography, Sir Charles Todd; National Archives of Australia"},

20:{t:"De schilder van de spookgom",
 tekst:[
  "Als je vandaag door de West MacDonnell Ranges rijdt, zie je landschappen die veel Australiërs al kennen voordat ze er ooit zijn geweest: oker rotsen, paarse bergen in de verte, en spierwitte eucalyptussen tegen een blauwe lucht. Dat beeld hebben ze te danken aan Albert Namatjira.",
  "Namatjira werd in 1902 geboren in de lutherse missiepost Hermannsburg, ten westen van Alice Springs, als Arrernte-man. In 1934 kwam de kunstenaar Rex Battarbee langs om te schilderen. Namatjira bood aan hem de mooiste plekken te laten zien, in ruil voor les. Binnen een paar jaar schilderde hij aquarellen die in Melbourne, Sydney en Adelaide binnen een dag waren uitverkocht. In 1954 ontmoette hij koningin Elizabeth.",
  "Zijn roem botste met de wet van zijn tijd. Aboriginal Australiërs waren in het Noordelijk Territorium geen volwaardige burgers: ze mochten zonder toestemming niet vrij reizen, geen grond kopen en geen alcohol drinken. In 1957 kregen Namatjira en zijn vrouw Rubina als uitzondering het burgerschap. Zijn familie kreeg het niet. Toen hij in 1958 werd beschuldigd van het delen van alcohol met een familielid, kreeg hij een celstraf. Na protest en hoger beroep zat hij uiteindelijk twee maanden vast, in de nederzetting Papunya. Hij overleed in 1959, op zijn 57ste.",
  "Zijn werk leeft voort in de Hermannsburg School, kunstenaars uit zijn familie en gemeenschap die nog steeds in zijn stijl schilderen. Kijk bij Ormiston Gorge of Standley Chasm eens naar de witte bomen: zo zag hij het land."
 ],
 bron:"Australian Dictionary of Biography, Albert Namatjira; National Museum of Australia, Defining Moments: Albert Namatjira; Hermannsburg Historic Precinct"},

21:{t:"Het eerste schip",
 tekst:[
  "Niet Cook, niet Tasman: het eerste Europese schip dat Australië bereikte, was Nederlands. In 1606 zeilde het kleine VOC-jacht Duyfken onder Willem Janszoon vanuit Bantam op Java naar het oosten, op zoek naar goud en handel rond Nieuw-Guinea. Eind februari 1606 kwam het aan de westkust van Kaap York, het puntige schiereiland ten noorden van waar je nu bent.",
  "Janszoon wist niet dat hij een nieuw continent had gevonden. Hij dacht dat het een uitloper van Nieuw-Guinea was. Zijn bemanning ging een paar keer aan land, en de ontmoetingen met de bewoners verliepen gewelddadig: er vielen doden aan beide kanten. Janszoon noteerde dat het land arm was en de bewoners vijandig, en draaide om. De plek waar hij omkeerde, noemde hij Kaap Keerweer. Zo heet ze nog altijd, een van de oudste Europese plaatsnamen van Australië.",
  "Het verhaal leeft ook aan de andere kant voort. De Wik-volken van Kaap York vertellen over de komst van de eerste vreemdelingen, lang voordat de Britten kwamen. In 2006 werd het vierhonderdjarige jubileum er samen gevierd, met nazaten van de bewoners en van de Duyfken.",
  "Het originele schip bestaat niet meer, maar in 1999 werd in Fremantle een replica te water gelaten, gebouwd met zeventiende-eeuwse technieken. Die is sindsdien onder meer naar Nederland gezeild. Cairns zelf is veel jonger: de stad werd in 1876 gesticht als haven voor de goudvelden in het binnenland."
 ],
 bron:"Duyfken 1606 Replica Foundation; Australian National Maritime Museum; Australian Dictionary of Biography, Willem Janszoon"},

22:{t:"Vast op het rif",
 tekst:[
  "Op 11 juni 1770, rond elf uur 's avonds, voelde de bemanning van de Endeavour een schok. Kapitein James Cook zeilde al weken langs de oostkust van Australië, op weg naar het noorden, maar wist niet dat hij in een doolhof van riffen zat. Nu zat zijn schip vast op het koraal, ten noorden van waar Cairns nu ligt, en het water stroomde naar binnen.",
  "De mannen pompten om beurten, dag en nacht. Om het schip lichter te maken gooiden ze alles overboord wat ze konden missen: zes kanonnen, ijzeren ballast, vaten. Bij vloed kwam de Endeavour los. Ze trokken een oud zeil vol wol en touw onder de romp om het lek te dichten, en strompelden naar een riviermonding verderop. Daar lag het schip zeven weken op het strand voor reparatie. Die plek heet nu Cooktown.",
  "In die weken kwamen de Britten in contact met de Guugu Yimithirr, de bewoners. Er was ruzie over schildpadden die de Britten hadden gevangen, maar ook een verzoening, een van de eerste gedocumenteerde in de Australische geschiedenis. Cook en de natuurkundige Joseph Banks schreven ook een woord op dat ze van hen leerden, voor een springend dier: gangurru. Zo kwam het woord kangoeroe in onze taal.",
  "De kanonnen bleven bijna tweehonderd jaar op de bodem liggen. In 1969 vond een Amerikaanse expeditie ze terug op het rif dat nu Endeavour Reef heet. Als je vandaag op het rif snorkelt, zie je hoe ondiep het hier soms is, en begrijp je hoe het gebeurde."
 ],
 bron:"Australian National Maritime Museum, HMB Endeavour; James Cook, Journal (juni 1770); Cooktown and District Historical Society"},

23:{t:"Vijftien tunnels",
 tekst:[
  "In de jaren 1870 werd er goud en tin gevonden op het plateau achter Cairns. Het probleem was de weg ernaartoe: steile bergwanden, dicht regenwoud en rivieren die in de natte tijd onbegaanbaar waren. Pakpaarden en ossenwagens deden er dagen over. Cairns had een spoorlijn nodig, anders zou de concurrent Port Douglas de handel winnen.",
  "In 1886 begon de aanleg van de lijn naar Kuranda, door de kloof van de Barron River. Het was een van de moeilijkste spoorwegprojecten van zijn tijd. Op het hoogtepunt werkten er zo'n 1.500 mannen, veel van hen Ierse en Italiaanse immigranten, met houwelen, schoppen, dynamiet en emmers. Ze hakten vijftien tunnels uit met de hand en bouwden tientallen bruggen over de ravijnen. Ze leefden in kampen langs de lijn en kregen te maken met malaria, overstromingen en aardverschuivingen. Twintig tot dertig van hen kwamen om.",
  "In 1891 was de lijn klaar: ruim dertig kilometer, en een klim van ruim driehonderd meter. De trein rijdt nog steeds, nu niet meer voor erts maar voor toeristen. Halverwege stopt hij bij de Barron Falls.",
  "Het regenwoud zelf is veel ouder dan het spoor. Het tropische regenwoud van deze streek, met het Daintree verderop, behoort tot de oudste ter wereld en bestaat al meer dan honderd miljoen jaar. Het is het land van de Djabugay rond Kuranda en de Kuku Yalanji rond het Daintree, die het nog altijd als hun thuis beschouwen."
 ],
 bron:"Kuranda Scenic Railway (Queensland Rail); Queensland Heritage Register, Cairns–Kuranda Railway; Wet Tropics Management Authority"},

24:{t:"De zwarte zwanen",
 tekst:[
  "In Europa was een zwarte zwaan eeuwenlang het voorbeeld van iets wat niet kon bestaan. Tot januari 1697, toen de Nederlandse kapitein Willem de Vlamingh met een paar sloepen een brede rivier op roeide aan de westkust van Australië. Op het water dreven honderden zwanen, en ze waren allemaal zwart. Hij ving er een paar om mee te nemen naar Batavia en noemde het water de Zwaanenrivier.",
  "De Vlamingh was gestuurd door de VOC om een vermist schip te zoeken, de Ridderschap van Holland. Dat vond hij niet. Hij verkende de kust, vond het land droog en onvruchtbaar en voer door. Voor de Compagnie had dit deel van de wereld, Nieuw-Holland, verder geen waarde.",
  "Ruim honderddertig jaar later kwamen de Britten wel. In 1829 stichtte kapitein James Stirling aan diezelfde rivier de Swan River Colony, de eerste vrije kolonie van Australië. De Britten waren bang dat de Fransen het westen zouden inpikken. Het begin was zwaar: de grond was zanderig, de kolonisten hadden geen ervaring en er was te weinig arbeid. Pas toen in 1850 alsnog dwangarbeiders kwamen, en later goud werd gevonden in het binnenland, groeide Perth echt.",
  "De rivier heet nog steeds Swan River, en de zwarte zwaan is het symbool van West-Australië geworden, op de vlag en het wapen. Voor de Noongar, de oorspronkelijke bewoners, heet de rivier Derbarl Yerrigan. Kijk vandaag maar langs het water: de zwanen zijn er nog."
 ],
 bron:"Western Australian Museum, Willem de Vlamingh; Australian Dictionary of Biography, Sir James Stirling; State Library of Western Australia"},

25:{t:"De ontsnapping uit Fremantle",
 tekst:[
  "West-Australië was de laatste kolonie die nog dwangarbeiders wilde, omdat er te weinig handen waren. Tussen 1850 en 1868 kwamen er bijna tienduizend. Ze bouwden zelf de gevangenis waarin ze werden opgesloten, van kalksteen uit de grond eronder: Fremantle Prison. Het laatste gevangenenschip dat ooit in Australië aankwam, de Hougoumont, meerde in 1868 hier aan. Aan boord zaten ook 62 Ierse Fenians, opstandelingen tegen de Britse overheersing.",
  "Een paar van hen werden op een plan gezet dat klinkt als een film. Ierse Amerikanen kochten een walvisvaarder, de Catalpa, en stuurden die naar de kust van West-Australië. In april 1876 liepen zes Fenians weg van een werkploeg buiten de gevangenis, sprongen in een wachtend rijtuig en reden naar het strand van Rockingham. Daar wachtte een sloep die hen naar de Catalpa roeide, voorbij de horizon.",
  "Twee dagen later haalde een Britse stoomboot het walvisschip in en eiste de mannen op, onder bedreiging met een kanon. De Amerikaanse kapitein George Anthony wees naar zijn vlag: wie op dit schip schoot, viel de Verenigde Staten aan. De stoomboot liet hem gaan. Maanden later kwamen de Fenians aan in New York, als helden.",
  "Fremantle Prison bleef in gebruik tot 1991 en is nu werelderfgoed. Bij de rondleiding hoor je het hele verhaal. En in het Western Australian Museum in Fremantle ligt een tinnen bord dat De Vlamingh hier in 1697 achterliet. Morgen hoor je wat er verder van hem over is."
 ],
 bron:"Fremantle Prison; Australian Dictionary of Biography, Catalpa rescue; UNESCO World Heritage Centre, Australian Convict Sites"},

26:{t:"Het rattennest",
 tekst:[
  "Eind december 1696, vlak voor hij de zwarte zwanen vond, ankerde Willem de Vlamingh bij een eiland voor de kust. Zijn mannen zagen er overal dieren zo groot als een kat, die zich ‘s nachts lieten zien en zich in het struikgewas verstopten. Ze hielden het voor ratten. De Vlamingh vond het eiland mooi, maar noemde het naar die ratten: ‘t Eylandt ‘t Rottenest. Het eiland heet nog steeds Rottnest.",
  "De ‘ratten’ waren quokka's, kleine kangoeroes die alleen hier en op een paar plekken op het vasteland voorkomen. Hun ‘glimlach’ en het feit dat ze niet bang zijn voor mensen, hebben ze wereldberoemd gemaakt. Voeren en aanraken is verboden, maar dichtbij komen ze vanzelf.",
  "Het eiland heeft ook een donkere geschiedenis. Van 1838 tot 1931 was Rottnest een gevangenis voor Aboriginal mannen en jongens uit heel West-Australië, vaak opgepakt voor kleine vergrijpen of omdat ze zich tegen kolonisten verzetten. Bijna 4.000 mannen en jongens zaten er vast, ver van hun land en familie. Honderden van hen stierven er, aan ziekte, ondervoeding en geweld, en werden in naamloze graven begraven. Het gebouw dat bekendstaat als de Quod, de achthoekige gevangenis vlak bij de aanlegsteiger, was jarenlang een vakantieverblijf.",
  "Voor de Noongar heet het eiland Wadjemup. De begraafplaats is nu een beschermde plek met een gedenkteken, en het eiland vertelt beide verhalen. Als je vandaag fietst, kom je langs allebei: de quokka's én de plek waar de mannen begraven liggen."
 ],
 bron:"Rottnest Island Authority, Wadjemup Aboriginal Burial Ground; Western Australian Museum, Willem de Vlamingh"},

27:{t:"Het schip dat verging",
 tekst:[
  "Ruim tweehonderd kilometer ten noorden van de Pinnacles liggen voor de kust de Houtman Abrolhos, een groep lage koraaleilanden. In de nacht van 4 juni 1629 liep daar het VOC-schip Batavia vast, op weg naar Java met ruim driehonderd mensen en een lading zilver. De meesten haalden de eilandjes, maar daar was geen zoet water.",
  "Commandeur Francisco Pelsaert ging met de kapitein en een groep mannen in een sloep op zoek naar water, en zeilde uiteindelijk helemaal naar Batavia om hulp te halen. Een tocht van bijna drieduizend kilometer, in een open boot, die hij overleefde. Achter op de eilanden nam onderkoopman Jeronimus Cornelisz de macht over. Hij had al aan boord een muiterij beraamd. Met een groep volgelingen vermoordde hij de weken daarop zo'n 110 tot 125 mannen, vrouwen en kinderen, om de voorraden te sparen en zijn macht te vestigen.",
  "Een groep soldaten onder Wiebbe Hayes overleefde op een ander eiland, vond er water en verdedigde zich. Toen Pelsaert na drie maanden terugkwam, konden ze hem waarschuwen. Cornelisz en de leiders werden op de eilanden opgehangen. Twee jongere muiters, Wouter Loos en Jan Pelgrom, werden aan de kust van het vasteland achtergelaten. Het waren de eerste Europeanen die in Australië bleven wonen. Wat er van hen werd, weet niemand.",
  "Het wrak werd in 1963 gevonden. Een deel van de romp en de stenen poort die het schip als ballast meevoerde, staan nu in het Shipwreck Galleries-museum in Fremantle. In Lelystad ligt een replica van het schip, tussen 1985 en 1995 gebouwd met zeventiende-eeuwse technieken."
 ],
 bron:"Western Australian Museum, Batavia (1629); Henrietta Drake-Brockman, Voyage to Disaster; Batavialand, Lelystad"},

28:{t:"Een woord van vijf letters",
 tekst:[
  "Op 27 mei 1967 stemden de Australiërs in een referendum over twee zinnen in de grondwet. De ene sloot Aboriginal Australiërs uit van de volkstelling, de andere verbood de landelijke regering wetten voor hen te maken. Ruim 90 procent stemde voor schrappen, de grootste meerderheid ooit bij een Australisch referendum. Het werd een symbool: voor velen het moment dat Aboriginal Australiërs eindelijk als volwaardig deel van het land werden gezien.",
  "Daarna duurde het nog decennia voordat andere wonden ter sprake kwamen. Tot ver in de twintigste eeuw haalde de overheid Aboriginal kinderen weg bij hun ouders om ze in tehuizen of bij blanke gezinnen op te voeden. Een onderzoek uit 1997, Bringing Them Home, schatte dat het om tienduizenden kinderen ging. Zij worden de Stolen Generations genoemd.",
  "Op 13 februari 2008 bood premier Kevin Rudd in het parlement in Canberra namens de regering zijn excuses aan, in een toespraak die het hele land live volgde. Het kernwoord was ‘sorry’, en hij herhaalde het drie keer. In scholen, op pleinen en in kantoren keken mensen mee, en velen huilden.",
  "Het gesprek is niet af. In 2023 stemden de Australiërs in een nieuw referendum over een adviesorgaan van Aboriginal en Torres Strait Islander-vertegenwoordigers in de grondwet, de Voice. Een ruime meerderheid stemde tegen: de een vond het verdeeldheid zaaien, de ander vond het te weinig of de verkeerde weg. Op de vlucht naar huis heb je tijd om terug te denken aan wat je onderweg zag en hoorde."
 ],
 bron:"National Museum of Australia, Defining Moments: 1967 referendum en National Apology; Australian Human Rights Commission, Bringing Them Home (1997); Australian Electoral Commission"},

29:{t:"Een bord in het Rijksmuseum",
 tekst:[
  "Je bent thuis, maar een stukje Australië ligt hier om de hoek. In het Rijksmuseum in Amsterdam hangt een gedeukt tinnen bord, iets groter dan een dienblad. Het is het oudste Europese voorwerp dat in Australië is achtergelaten.",
  "In oktober 1616 kwam VOC-schipper Dirk Hartog met de Eendracht, op weg naar Batavia, uit de koers en stuitte op de westkust van Australië, bij een eiland in Shark Bay. Hij ging aan land, vond niets wat hem interesseerde, en liet een bord achter waarin hij de datum, zijn naam en die van zijn schip had gekrast. Hij spijkerde het op een paal op de klif en voer door. Het eiland heet nu Dirk Hartog Island.",
  "Tachtig jaar later, in 1697, kwam Willem de Vlamingh langs, op dezelfde reis waarop hij Rottnest en de zwarte zwanen vond. Hij vond het bord van Hartog, half verweerd, nam het mee en zette er een nieuw bord neer met beide teksten. Het origineel van Hartog kwam via Batavia in Amsterdam terecht en hangt nu in het Rijksmuseum. Het bord van De Vlamingh werd in 1818 door een Franse expeditie meegenomen naar Parijs. In 1947 gaf Frankrijk het terug aan Australië, en sinds 1950 is het in West-Australië. Het ligt nu in het museum in Fremantle.",
  "Zo hangen er twee borden aan twee kanten van de wereld, aan elkaar verbonden door dezelfde kust. Als je de komende tijd in Amsterdam bent: loop even binnen in het Rijksmuseum. Na deze reis kijk je er anders naar."
 ],
 bron:"Rijksmuseum, Bord van Dirk Hartog (1616); Western Australian Museum, Vlamingh Plate"}

};
