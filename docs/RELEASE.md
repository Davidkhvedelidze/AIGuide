# Release checklist

## Before the first TestFlight / internal testing build

- [ ] Bundle identifier, icons and splash set (SETUP step 1)
- [ ] `npm run typecheck && npm run lint && npm test && npm run content:validate` all pass
- [ ] Scan evaluation meets the bars in `docs/PRD.md`
- [ ] At least 30 places reviewed and published, each with a real, credited photo
- [ ] Every audio file listened to end to end, in both languages
- [ ] Privacy policy and terms hosted at a public URL; `EXPO_PUBLIC_PRIVACY_URL` and `EXPO_PUBLIC_SUPPORT_EMAIL` set
- [ ] Delete account works end to end (required by both stores)
- [ ] Purchases tested in sandbox, including restore and expiry
- [ ] Tested on a small phone (iPhone SE size) and with the largest system font size
- [ ] Tested with VoiceOver and TalkBack on the scan, place and player screens
- [ ] Tested with camera denied, location denied, airplane mode

```bash
eas build --profile preview --platform all
eas build --profile production --platform all
eas submit --profile production --platform all
```

## You must do these in the store consoles

- Apple: App Privacy answers (camera photos are sent for recognition and not stored; coarse location is used to find nearby places; email if the user signs in; purchase history), age rating, subscription group and review screenshot, export compliance.
- Google: Data safety form (same facts), content rating, target audience, subscription products.
- Both: screenshots made from the real app (not the mockups), support URL, privacy URL.

## Store listing drafts

**Name:** to be decided (see PRD, open decisions)

**Subtitle (EN):** Point, scan, hear the story

**Description (EN)**

Stand in front of a landmark in Tbilisi, point your camera, and hear its story in about a minute.

- Recognises landmarks around you using your camera and location
- Short audio guides you can listen to while you walk, with a full transcript
- Stories written from checked facts, with sources you can open
- A map of what is worth seeing within walking distance
- Save places and group them into collections
- English and Georgian

Free: a few scans every day. Pro: unlimited scans.

**Subtitle (KA):** მიუშვირე, დაასკანერე, მოუსმინე

**Description (KA)**

დადექი თბილისის ღირსშესანიშნაობის წინ, მიუშვირე კამერა და დაახლოებით ერთ წუთში მოისმინე მისი ამბავი.

- ამოიცნობს შენ გარშემო მდებარე ობიექტებს კამერითა და მდებარეობით
- მოკლე აუდიო გიდები, რომლებსაც სიარულისას მოუსმენ, სრული ტექსტით
- ამბები დაწერილია გადამოწმებული ფაქტებიდან, წყაროების მითითებით
- რუკა იმ ადგილებით, რომლებიც ფეხით სავალ მანძილზეა
- შეინახე ადგილები და დააჯგუფე კოლექციებად
- ქართულად და ინგლისურად

უფასოდ: რამდენიმე სკანი ყოველდღე. Pro: შეუზღუდავი სკანები.

Only list features that are in the build you submit.
