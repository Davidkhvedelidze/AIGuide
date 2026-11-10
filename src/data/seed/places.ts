import type { Place } from '@/data/types';

/**
 * Starter content for Tbilisi. Every statement in `content` is backed by an entry in `facts`.
 *
 * All entries are `verified: false`: the facts were checked against the linked pages when
 * this file was written, but a person has not signed them off yet. Run `npm run content:review`
 * to approve them. Photos are intentionally empty until `content:import` adds real,
 * licensed ones. Coordinates marked "approx." should be replaced by the import script.
 */
const WIKI = 'https://en.wikipedia.org/wiki/';

export const SEED_PLACES: Place[] = [
  {
    id: 'narikala',
    slug: 'narikala-fortress',
    lat: 41.68778,
    lng: 44.80861,
    category: 'landmark',
    period: '4th century',
    verified: false,
    photoUrl: null,
    photoCredit: null,
    audioUrl: {},
    facts: [
      { text: 'The fortress was built in the 4th century; the earliest written accounts date to the reign of King Varaz-Bakur (c. 364).', source: `${WIKI}Narikala` },
      { text: 'The Umayyads expanded it in the 7th century, and King David the Builder (1089–1125) expanded it later.', source: `${WIKI}Narikala` },
      { text: 'The Mongols renamed it "Narin Qala", meaning "Little Fortress".', source: `${WIKI}Narikala` },
      { text: 'An earthquake in 1827 damaged parts of the fortress, which were then demolished.', source: `${WIKI}Narikala` },
      { text: 'The St Nicholas church inside the walls was newly built in 1996–1997, replacing a 13th-century church destroyed by fire.', source: `${WIKI}Narikala` },
    ],
    content: {
      en: {
        name: 'Narikala Fortress',
        summary: 'A hilltop fortress that has watched over Tbilisi since the 4th century.',
        story:
          'You are looking at the oldest witness to Tbilisi’s story. Narikala was built in the 4th century, and the earliest written accounts of it come from the reign of King Varaz-Bakur, around the year 364. ' +
          'Every power that held the city left its mark here. The Umayyads expanded the walls in the 7th century, and King David the Builder, who ruled from 1089 to 1125, enlarged the fortress again. ' +
          'Even its name is a trace of conquest: the Mongols called it Narin Qala, the Little Fortress, and the name stayed. ' +
          'What you see today is only part of what once stood here. In 1827 an earthquake damaged the fortress, and the broken sections were demolished. ' +
          'Inside the walls stands the church of St Nicholas. It looks old, but it was built in 1996 and 1997, on the place of a 13th-century church that was lost to fire.',
        highlights: ['Panoramic views over the old town', 'St Nicholas church inside the walls', 'Sixteen centuries of layered history'],
      },
      ka: {
        name: 'ნარიყალა',
        summary: 'ციხესიმაგრე, რომელიც IV საუკუნიდან გადაჰყურებს თბილისს.',
        story:
          'თქვენ წინაშეა თბილისის ისტორიის უძველესი მოწმე. ნარიყალა IV საუკუნეში აშენდა, ხოლო მის შესახებ ყველაზე ადრეული წერილობითი ცნობები მეფე ვარაზ-ბაკურის დროს, დაახლოებით 364 წელს უკავშირდება. ' +
          'ქალაქის ყველა მფლობელმა აქ თავისი კვალი დატოვა. VII საუკუნეში ციხე ომაიანებმა გააფართოვეს, მოგვიანებით კი დავით აღმაშენებელმა, რომელიც 1089–1125 წლებში მეფობდა. ' +
          'სახელიც დაპყრობის კვალია: მონღოლებმა მას „ნარინ ყალა“, ანუ პატარა ციხე უწოდეს. ' +
          '1827 წელს მიწისძვრამ ციხე დააზიანა და დანგრეული ნაწილები აიღეს. ' +
          'გალავნის შიგნით წმინდა ნიკოლოზის ეკლესია დგას. ის 1996–1997 წლებში აშენდა იმ XIII საუკუნის ეკლესიის ადგილას, რომელიც ხანძარმა გაანადგურა.',
        highlights: ['ხედი ძველ თბილისზე', 'წმინდა ნიკოლოზის ეკლესია', 'თექვსმეტი საუკუნის ისტორია'],
      },
    },
  },
  {
    id: 'metekhi',
    slug: 'metekhi-church',
    lat: 41.69,
    lng: 44.81111,
    category: 'church',
    period: '13th century',
    verified: false,
    photoUrl: null,
    photoCredit: null,
    audioUrl: {},
    facts: [
      { text: 'The current church was built c. 1278–1284, in the 13th century, under King Demetrius II.', source: `${WIKI}Metekhi` },
      { text: 'It is dedicated to the Assumption.', source: `${WIKI}Metekhi` },
      { text: 'According to traditional accounts King Vakhtang I Gorgasali erected a church and a fort here that also served as a royal residence; they did not survive the Mongol invasion of 1235.', source: `${WIKI}Metekhi` },
      { text: 'The equestrian statue of King Vakhtang Gorgasali by sculptor Elguja Amashukeli was erected in front of the church in 1961.', source: `${WIKI}Metekhi` },
      { text: 'Under Russian rule from 1801 the church became a barracks; a jail built on the site of the citadel in 1819 operated until 1938; later in the Soviet period the church was used as a theatre.', source: `${WIKI}Metekhi` },
    ],
    content: {
      en: {
        name: 'Metekhi Church',
        summary: 'A 13th-century church on the cliff above the Mtkvari, beside the statue of the city’s founder.',
        story:
          'This cliff above the river is where Tbilisi’s kings once lived. According to traditional accounts, King Vakhtang Gorgasali built a church and a fort here that also served as his residence. ' +
          'None of that survived the Mongol invasion of 1235. The church in front of you came afterwards: it was built between about 1278 and 1284, in the 13th century, under King Demetrius the Second, and it is dedicated to the Assumption. ' +
          'Its later life was far from sacred. Under Russian rule, from 1801, the church was turned into a barracks. A jail was built on the site of the old citadel in 1819 and kept working until 1938. Later in the Soviet period the church itself was used as a theatre. ' +
          'The horseman beside it is King Vakhtang Gorgasali. The statue is the work of sculptor Elguja Amashukeli and has stood here since 1961.',
        highlights: ['Statue of King Vakhtang Gorgasali', 'Clifftop view of the old town and the river', 'A church that was once a barracks and a theatre'],
      },
      ka: {
        name: 'მეტეხის ტაძარი',
        summary: 'XIII საუკუნის ტაძარი მტკვრის კლდეზე, ქალაქის დამაარსებლის ძეგლის გვერდით.',
        story:
          'მტკვრის ამ კლდეზე ოდესღაც თბილისის მეფეები ცხოვრობდნენ. გადმოცემის მიხედვით, ვახტანგ გორგასალმა აქ ეკლესია და ციხე ააგო, რომელიც სამეფო რეზიდენციაც იყო. ' +
          'ამ ნაგებობებმა 1235 წლის მონღოლთა შემოსევას ვერ გაუძლო. დღევანდელი ტაძარი მოგვიანებით, დაახლოებით 1278–1284 წლებში, მეფე დემეტრე II-ის დროს აშენდა და ღვთისმშობლის მიძინების სახელობისაა. ' +
          'რუსეთის მმართველობისას, 1801 წლიდან, ტაძარი ყაზარმად აქციეს. ციტადელის ადგილას 1819 წელს აგებული ციხე 1938 წლამდე მოქმედებდა, საბჭოთა პერიოდში კი ტაძარში თეატრი იყო. ' +
          'გვერდით მდგარი მხედარი ვახტანგ გორგასალია. ძეგლის ავტორი ელგუჯა ამაშუკელია და ის აქ 1961 წლიდან დგას.',
        highlights: ['ვახტანგ გორგასლის ძეგლი', 'ხედი ძველ ქალაქსა და მტკვარზე', 'ტაძარი, რომელიც ყაზარმაც იყო და თეატრიც'],
      },
    },
  },
  {
    id: 'bridge-of-peace',
    slug: 'bridge-of-peace',
    lat: 41.6929,
    lng: 44.8082,
    category: 'landmark',
    period: '2010',
    verified: false,
    photoUrl: null,
    photoCredit: null,
    audioUrl: {},
    facts: [
      { text: 'The pedestrian bridge opened on 6 May 2010.', source: `${WIKI}Bridge_of_Peace` },
      { text: 'It was designed by architect Michele De Lucchi, with lighting by Philippe Martinaud.', source: `${WIKI}Bridge_of_Peace` },
      { text: 'It is 150 metres long and made of steel and glass.', source: `${WIKI}Bridge_of_Peace` },
      { text: 'It crosses the Kura (Mtkvari) river and connects Rike Park with Old Tbilisi.', source: `${WIKI}Bridge_of_Peace` },
      { text: 'The structure was built in Italy and transported to Tbilisi in 200 trucks.', source: `${WIKI}Bridge_of_Peace` },
    ],
    content: {
      en: {
        name: 'Bridge of Peace',
        summary: 'A 150-metre steel and glass footbridge linking Old Tbilisi with Rike Park.',
        story:
          'In a city of old stone, this bridge is deliberately new. The Bridge of Peace opened on the sixth of May 2010 and is for pedestrians only. ' +
          'It stretches 150 metres across the Mtkvari, which is also known as the Kura, and connects Old Tbilisi on one bank with Rike Park on the other. ' +
          'The bridge was designed by the architect Michele De Lucchi, and its lighting is the work of Philippe Martinaud. Come back after dark to see why the lighting designer gets equal credit. ' +
          'The curved canopy above you is steel and glass, and none of it was made here. The structure was built in Italy and then carried to Tbilisi in 200 trucks, to be assembled over the river. ' +
          'Walk to the middle and turn around slowly: from here you can see the old town and the park on the opposite bank in one view.',
        highlights: ['Best seen lit up after dark', 'Views of both river banks', 'The easiest walk between the old town and Rike Park'],
      },
      ka: {
        name: 'მშვიდობის ხიდი',
        summary: '150-მეტრიანი ფოლადისა და მინის საფეხმავლო ხიდი ძველ თბილისსა და რიყის პარკს შორის.',
        story:
          'ძველი ქვის ქალაქში ეს ხიდი განზრახ ახალია. მშვიდობის ხიდი 2010 წლის 6 მაისს გაიხსნა და მხოლოდ ფეხით მოსიარულეებისთვისაა. ' +
          'მისი სიგრძე 150 მეტრია. ხიდი მტკვარზეა გადებული და ძველ თბილისს რიყის პარკთან აკავშირებს. ' +
          'პროექტის ავტორი არქიტექტორი მიკელე დე ლუკია, განათება კი ფილიპ მარტინოს ეკუთვნის. სიბნელის შემდეგ დაბრუნდით და ნახავთ, რატომ იხსენიებენ განათების ავტორს არქიტექტორის გვერდით. ' +
          'თქვენ ზემოთ მოხრილი გადახურვა ფოლადისა და მინისგანაა. კონსტრუქცია იტალიაში დამზადდა და თბილისში 200 სატვირთო მანქანით ჩამოიტანეს. ' +
          'შუა ხიდზე გაჩერდით: აქედან ერთდროულად ჩანს ძველი ქალაქიც და მოპირდაპირე ნაპირის პარკიც.',
        highlights: ['ყველაზე ლამაზია ღამით', 'ხედი მტკვრის ორივე ნაპირზე', 'უმოკლესი გზა ძველი ქალაქიდან რიყემდე'],
      },
    },
  },
  {
    id: 'kartlis-deda',
    slug: 'kartlis-deda',
    lat: 41.688056,
    lng: 44.804583,
    category: 'landmark',
    period: '1958',
    verified: false,
    photoUrl: null,
    photoCredit: null,
    audioUrl: {},
    facts: [
      { text: 'The statue was erected on Sololaki Hill in 1958, the year Tbilisi celebrated its 1500th anniversary.', source: `${WIKI}Kartlis_Deda` },
      { text: 'It is the work of sculptor Elguja Amashukeli.', source: `${WIKI}Kartlis_Deda` },
      { text: 'The statue is 20 metres tall and made of aluminium; the original 1958 statue was wooden and was covered in aluminium in 1963.', source: `${WIKI}Kartlis_Deda` },
      { text: 'She holds a bowl of wine in her left hand for those who come as friends and a sword in her right hand for those who come as enemies.', source: `${WIKI}Kartlis_Deda` },
    ],
    content: {
      en: {
        name: 'Kartlis Deda (Mother of Georgia)',
        summary: 'The 20-metre figure on Sololaki Hill who offers wine to friends and a sword to enemies.',
        story:
          'Tbilisi has a face, and this is it. Kartlis Deda, the Mother of Georgia, was raised on Sololaki Hill in 1958, the year the city celebrated its 1500th anniversary. ' +
          'She is the work of the sculptor Elguja Amashukeli, the same artist who made the horseman beside Metekhi Church. ' +
          'She stands 20 metres tall. The first statue of 1958 was made of wood, and in 1963 it was covered in aluminium. ' +
          'Look at her hands, because they explain how Georgians like to see themselves. In her left hand she holds a bowl of wine, for those who come as friends. In her right hand she holds a sword, for those who come as enemies. ' +
          'Hospitality first, but not without limits: that is the message she has been sending across the city ever since.',
        highlights: ['A symbol of Georgian hospitality and defiance', 'Walkable from Narikala along the ridge', 'Wide views over the city'],
      },
      ka: {
        name: 'ქართლის დედა',
        summary: '20-მეტრიანი ქანდაკება სოლოლაკის ქედზე: მეგობარს ღვინით ხვდება, მტერს ხმლით.',
        story:
          'თბილისს სახე აქვს და ეს სწორედ ის არის. ქართლის დედა სოლოლაკის ქედზე 1958 წელს დადგეს, როცა ქალაქი 1500 წლის იუბილეს აღნიშნავდა. ' +
          'ქანდაკების ავტორი ელგუჯა ამაშუკელია, იგივე მოქანდაკე, რომელმაც მეტეხთან მდგარი ვახტანგ გორგასლის ძეგლი შექმნა. ' +
          'ქანდაკების სიმაღლე 20 მეტრია. 1958 წლის პირველი ვერსია ხისგან იყო დამზადებული და 1963 წელს ალუმინით დაიფარა. ' +
          'დააკვირდით ხელებს. მარცხენა ხელში ღვინის თასი უჭირავს მათთვის, ვინც მეგობრად მოდის, მარჯვენაში კი ხმალი მათთვის, ვინც მტრად მოდის. ' +
          'ჯერ სტუმართმოყვარეობა, მაგრამ არა უსაზღვროდ: ამ სათქმელს ის მას შემდეგ მთელ ქალაქს გადასცემს.',
        highlights: ['ქართული სტუმართმოყვარეობის სიმბოლო', 'ნარიყალადან ფეხით მისადგომი', 'ფართო ხედი ქალაქზე'],
      },
    },
  },
  {
    id: 'anchiskhati',
    slug: 'anchiskhati-basilica',
    lat: 41.69556,
    lng: 44.80694,
    category: 'church',
    period: '6th century',
    verified: false,
    photoUrl: null,
    photoCredit: null,
    audioUrl: {},
    facts: [
      { text: 'According to old Georgian annals the church was built in the 6th century by King Dachi of Iberia (c. 522–534).', source: `${WIKI}Anchiskhati_Basilica` },
      { text: 'It is the oldest surviving church in Tbilisi.', source: `${WIKI}Anchiskhati_Basilica` },
      { text: 'It was originally dedicated to the Virgin Mary.', source: `${WIKI}Anchiskhati_Basilica` },
      { text: 'It was renamed Anchiskhati in 1675, when the icon of the Saviour made by goldsmith Beka Opizari was moved to Tbilisi to protect it from an Ottoman invasion; the icon is now in the Art Museum of Georgia.', source: `${WIKI}Anchiskhati_Basilica` },
      { text: 'In the Soviet period services stopped and the building became a handicrafts museum and later an art studio; it returned to religious use in 1991.', source: `${WIKI}Anchiskhati_Basilica` },
    ],
    content: {
      en: {
        name: 'Anchiskhati Basilica',
        summary: 'The oldest surviving church in Tbilisi, built in the 6th century.',
        story:
          'It is easy to walk past this plain stone building, and that would be a mistake. Anchiskhati is the oldest surviving church in Tbilisi. ' +
          'According to the old Georgian annals it was built in the 6th century by King Dachi of Iberia, who reigned from about 522 to 534, and it was first dedicated to the Virgin Mary. ' +
          'Its present name arrived more than a thousand years later. In 1675 a precious icon of the Saviour, the work of the goldsmith Beka Opizari, was brought to Tbilisi to keep it safe from an Ottoman invasion. The icon was called Anchiskhati, and the church took its name. ' +
          'You will not find the icon inside today; it is kept in the Art Museum of Georgia. ' +
          'In the Soviet period services here stopped. The building became a handicrafts museum and later an art studio, and it returned to religious use in 1991.',
        highlights: ['The oldest surviving church in the city', 'Named after a famous icon', 'A quiet stop in the old town'],
      },
      ka: {
        name: 'ანჩისხატის ბაზილიკა',
        summary: 'თბილისში შემორჩენილი უძველესი ეკლესია, აგებული VI საუკუნეში.',
        story:
          'ამ უბრალო ქვის შენობას ადვილად ჩაუვლით, თუმცა ეს შეცდომა იქნება. ანჩისხატი თბილისში შემორჩენილი უძველესი ეკლესიაა. ' +
          'ძველი ქართული მატიანეების მიხედვით, ის VI საუკუნეში ააგო იბერიის მეფე დაჩიმ, რომელიც დაახლოებით 522–534 წლებში მეფობდა. თავდაპირველად ტაძარი ღვთისმშობლის სახელობის იყო. ' +
          'დღევანდელი სახელი ათას წელზე მეტი ხნის შემდეგ გაჩნდა. 1675 წელს ოსმალთა შემოსევისგან დასაცავად თბილისში ჩამოაბრძანეს მაცხოვრის ხატი, რომელიც ოქრომჭედელ ბექა ოპიზარის ნახელავია. ხატს ანჩისხატი ერქვა და ეკლესიამაც ეს სახელი მიიღო. ' +
          'დღეს ხატი საქართველოს ხელოვნების მუზეუმში ინახება. ' +
          'საბჭოთა პერიოდში აქ წირვა-ლოცვა შეწყდა, შენობაში ხელოსნობის მუზეუმი, შემდეგ კი სამხატვრო სახელოსნო იყო. ღვთისმსახურება 1991 წელს აღდგა.',
        highlights: ['ქალაქის უძველესი შემორჩენილი ეკლესია', 'სახელი ცნობილი ხატისგან მოდის', 'მშვიდი ადგილი ძველ ქალაქში'],
      },
    },
  },
  {
    id: 'sameba',
    slug: 'holy-trinity-cathedral',
    lat: 41.6975, // approx.
    lng: 44.8166, // approx.
    category: 'church',
    period: '1995–2004',
    verified: false,
    photoUrl: null,
    photoCredit: null,
    audioUrl: {},
    facts: [
      { text: 'The cathedral was built from 1995 to 2004; the foundation was laid on 23 November 1995.', source: `${WIKI}Holy_Trinity_Cathedral_of_Tbilisi` },
      { text: 'It was consecrated on 23 November 2004, St George’s Day.', source: `${WIKI}Holy_Trinity_Cathedral_of_Tbilisi` },
      { text: 'The architect was Archil Mindiashvili, whose design won a contest.', source: `${WIKI}Holy_Trinity_Cathedral_of_Tbilisi` },
      { text: 'It is 86.1 metres high to the top of the cross.', source: `${WIKI}Holy_Trinity_Cathedral_of_Tbilisi` },
      { text: 'It stands on Elia Hill in the Avlabari neighbourhood, above the left bank of the Kura (Mtkvari).', source: `${WIKI}Holy_Trinity_Cathedral_of_Tbilisi` },
      { text: 'It is the main cathedral of the Georgian Orthodox Church.', source: `${WIKI}Holy_Trinity_Cathedral_of_Tbilisi` },
    ],
    content: {
      en: {
        name: 'Holy Trinity Cathedral (Sameba)',
        summary: 'The main cathedral of the Georgian Orthodox Church, completed in 2004 on Elia Hill.',
        story:
          'Almost everything else you visit in Tbilisi is old. This cathedral is the exception, and it was built to be seen from everywhere. ' +
          'Sameba, the Holy Trinity Cathedral, stands on Elia Hill in the Avlabari neighbourhood, above the left bank of the Mtkvari. ' +
          'Its foundation was laid on the twenty-third of November 1995, and construction continued until 2004. It was consecrated exactly nine years after the first stone, on the twenty-third of November 2004, which is St George’s Day. ' +
          'The design is by the architect Archil Mindiashvili, who won a contest for the commission. ' +
          'From the ground to the top of the cross the cathedral rises 86.1 metres, which is why it keeps appearing as you move around the city. ' +
          'Today it is the main cathedral of the Georgian Orthodox Church.',
        highlights: ['Visible from most of central Tbilisi', 'The seat of the Georgian Orthodox Church', 'Large grounds with city views'],
      },
      ka: {
        name: 'სამების საკათედრო ტაძარი',
        summary: 'საქართველოს მართლმადიდებელი ეკლესიის მთავარი ტაძარი, დასრულებული 2004 წელს ელიას მთაზე.',
        story:
          'თბილისში თითქმის ყველაფერი, რასაც ნახულობთ, ძველია. ეს ტაძარი გამონაკლისია და ისე აშენდა, რომ ყველა მხრიდან ჩანდეს. ' +
          'სამება ავლაბარში, ელიას მთაზე დგას, მტკვრის მარცხენა ნაპირის თავზე. ' +
          'საძირკველი 1995 წლის 23 ნოემბერს ჩაეყარა და მშენებლობა 2004 წლამდე გაგრძელდა. ტაძარი ზუსტად ცხრა წლის შემდეგ, 2004 წლის 23 ნოემბერს, გიორგობას აკურთხეს. ' +
          'პროექტის ავტორი არქიტექტორი არჩილ მინდიაშვილია, რომელმაც კონკურსში გაიმარჯვა. ' +
          'მიწიდან ჯვრის წვერამდე ტაძრის სიმაღლე 86,1 მეტრია, ამიტომაც ის ქალაქის ბევრი წერტილიდან მოჩანს. ' +
          'დღეს ის საქართველოს მართლმადიდებელი ეკლესიის მთავარი ტაძარია.',
        highlights: ['ჩანს ცენტრალური თბილისის უმეტესი ნაწილიდან', 'საქართველოს ეკლესიის მთავარი ტაძარი', 'ვრცელი ეზო ქალაქის ხედით'],
      },
    },
  },
  {
    id: 'sioni',
    slug: 'sioni-cathedral',
    lat: 41.6913, // approx.
    lng: 44.8076, // approx.
    category: 'church',
    period: '12th century',
    verified: false,
    photoUrl: null,
    photoCredit: null,
    audioUrl: {},
    facts: [
      { text: 'The cathedral is dedicated to the Dormition of the Theotokos and named after Mount Zion in Jerusalem.', source: 'https://www.wikiwand.com/en/articles/Tbilisi_Sioni_Cathedral' },
      { text: 'According to medieval annals construction began in the 5th century under King Vakhtang Gorgasali.', source: 'https://www.wikiwand.com/en/articles/Tbilisi_Sioni_Cathedral' },
      { text: 'The present structure dates largely from King David the Builder’s rebuilding in 1112, in the 12th century.', source: 'https://www.wikiwand.com/en/articles/Tbilisi_Sioni_Cathedral' },
      { text: 'It keeps the Grapevine cross, which tradition credits to Saint Nino.', source: 'https://www.wikiwand.com/en/articles/Tbilisi_Sioni_Cathedral' },
      { text: 'It was the main Georgian Orthodox cathedral until 2004, when the Holy Trinity Cathedral was consecrated.', source: 'https://www.wikiwand.com/en/articles/Tbilisi_Sioni_Cathedral' },
    ],
    content: {
      en: {
        name: 'Sioni Cathedral',
        summary: 'Home of Saint Nino’s Grapevine cross, and the country’s main cathedral until 2004.',
        story:
          'For centuries this was the most important church in Georgia. Sioni is dedicated to the Dormition of the Theotokos, and it takes its name from Mount Zion in Jerusalem. ' +
          'Medieval annals say that building began here in the 5th century, under King Vakhtang Gorgasali. ' +
          'The church was rebuilt more than once. What stands in front of you dates largely from the rebuilding ordered by King David the Builder in 1112, in the 12th century. ' +
          'Inside is the reason many Georgians come here: the Grapevine cross, which tradition credits to Saint Nino. ' +
          'Sioni remained the main cathedral of the Georgian Orthodox Church until 2004. In that year the Holy Trinity Cathedral was consecrated and took over the role.',
        highlights: ['The Grapevine cross of Saint Nino', 'Main cathedral of Georgia until 2004', 'In the heart of the old town'],
      },
      ka: {
        name: 'სიონის საკათედრო ტაძარი',
        summary: 'წმინდა ნინოს ჯვრის სავანე და ქვეყნის მთავარი ტაძარი 2004 წლამდე.',
        story:
          'საუკუნეების განმავლობაში ეს საქართველოს უმთავრესი ეკლესია იყო. სიონი ღვთისმშობლის მიძინების სახელობისაა, სახელი კი იერუსალიმის სიონის მთისგან მოდის. ' +
          'შუა საუკუნეების მატიანეების მიხედვით, მშენებლობა V საუკუნეში, ვახტანგ გორგასლის დროს დაიწყო. ' +
          'ტაძარი არაერთხელ გადაკეთდა. ის, რასაც ახლა ხედავთ, ძირითადად 1112 წელს, დავით აღმაშენებლის მიერ ჩატარებულ აღდგენას უკავშირდება. ' +
          'შიგნით ინახება ის, რის გამოც აქ ბევრი ქართველი მოდის: ვაზის ჯვარი, რომელსაც გადმოცემა წმინდა ნინოს მიაწერს. ' +
          'სიონი საქართველოს მართლმადიდებელი ეკლესიის მთავარი ტაძარი 2004 წლამდე იყო. იმ წელს სამების ტაძარი აკურთხეს და ეს როლი მას გადაეცა.',
        highlights: ['წმინდა ნინოს ვაზის ჯვარი', 'ქვეყნის მთავარი ტაძარი 2004 წლამდე', 'ძველი ქალაქის შუაგულში'],
      },
    },
  },
  {
    id: 'abanotubani',
    slug: 'abanotubani-sulfur-baths',
    lat: 41.6882, // approx.
    lng: 44.811, // approx.
    category: 'hidden_gem',
    period: '5th century legend',
    verified: false,
    photoUrl: null,
    photoCredit: null,
    audioUrl: {},
    facts: [
      { text: 'According to legend, in the 5th century King Vakhtang Gorgasali’s falcon and the pheasant it was hunting fell into a hot spring here; impressed by the hot water, the king built a city nearby.', source: 'https://www.orexca.com/georgia/tbilisi/baths.htm' },
      { text: 'The name "Tbilisi" is said to mean "warm location".', source: 'https://www.orexca.com/georgia/tbilisi/baths.htm' },
      { text: 'The sulfur springs reach 40–50 degrees Celsius.', source: 'https://www.orexca.com/georgia/tbilisi/baths.htm' },
      { text: 'Alexander Pushkin and Alexandre Dumas both visited and praised the baths; Pushkin called them luxurious.', source: 'https://www.orexca.com/georgia/tbilisi/baths.htm' },
    ],
    content: {
      en: {
        name: 'Abanotubani Sulfur Baths',
        summary: 'The hot springs that, according to legend, are the reason Tbilisi exists.',
        story:
          'You are standing in the bath district, and according to legend this is where Tbilisi began. ' +
          'The story goes that in the 5th century King Vakhtang Gorgasali was hunting here when his falcon and the pheasant it was chasing fell into a hot spring. ' +
          'The king was so impressed by the hot water that he decided to build a city nearby. Even the name remembers it: Tbilisi is said to mean warm location. ' +
          'The springs are still hot today. The sulfur water reaches 40 to 50 degrees Celsius. ' +
          'Travellers have been writing about the experience for a long time. Alexander Pushkin and Alexandre Dumas both visited and praised the baths, and Pushkin called them luxurious. ' +
          'If you have an hour, do what they did and go inside.',
        highlights: ['The legendary birthplace of the city', 'Baths praised by Pushkin and Dumas', 'Natural sulfur water at 40–50°C'],
      },
      ka: {
        name: 'აბანოთუბანი',
        summary: 'ცხელი წყაროები, რომელთა გამოც, ლეგენდის მიხედვით, თბილისი დაარსდა.',
        story:
          'თქვენ აბანოების უბანში დგახართ და, ლეგენდის მიხედვით, თბილისი სწორედ აქ დაიწყო. ' +
          'გადმოცემით, V საუკუნეში მეფე ვახტანგ გორგასალი აქ ნადირობდა, როცა მისი შევარდენი და ხოხობი, რომელსაც ის მისდევდა, ცხელ წყაროში ჩაცვივდნენ. ' +
          'ცხელმა წყალმა მეფე ისე გააოცა, რომ იქვე ქალაქის აშენება გადაწყვიტა. ეს ამბავი სახელშიც შემორჩა: თბილისი თბილ ადგილს ნიშნავს. ' +
          'წყაროები დღესაც ცხელია. გოგირდის წყლის ტემპერატურა 40–50 გრადუსს აღწევს. ' +
          'აქ ალექსანდრე პუშკინი და ალექსანდრე დიუმაც ყოფილან და აბანოები ორივეს მოსწონებია, პუშკინმა მათ მდიდრული უწოდა. ' +
          'თუ ერთი საათი გაქვთ, მათ მიბაძეთ და შიგნით შედით.',
        highlights: ['ქალაქის ლეგენდარული დასაბამი', 'აბანოები, რომლებიც პუშკინსა და დიუმას მოსწონდათ', 'ბუნებრივი გოგირდის წყალი, 40–50°C'],
      },
    },
  },
];
