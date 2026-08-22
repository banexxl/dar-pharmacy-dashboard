-- ============================================================
-- Seed data for categories hierarchy
-- Uses subqueries to resolve FKs by value — no hardcoded IDs.
-- ============================================================

-- ─── MAIN CATEGORIES ────────────────────────────────────────────────────────────
INSERT INTO main_categories (label, value) VALUES
  ('Apoteka', 'apoteka'),
  ('Bebi pelene', 'bebi-pelene'),
  ('Bebi prirodna kozmetika', 'bebi-prirodna-kozmetika'),
  ('Biljne tinkture', 'biljne-tinkture'),
  ('Čišćenje organizma', 'ciscenje-organizma'),
  ('Domaci prirodni melemi', 'domaci-prirodni-melemi'),
  ('Guščija mast', 'guscija-mast'),
  ('Homeopatija', 'homeopatija'),
  ('Imunitet za decu', 'imunitet-za-decu'),
  ('Kolagen', 'kolagen'),
  ('Ledene Kocke za imunitet', 'ledene-kocke-za-imunitet'),
  ('Mast od Jazavca', 'mast-od-jazavca'),
  ('Prirodna kozmetika', 'prirodna-kozmetika'),
  ('Prirodni imunitet', 'prirodni-imunitet'),
  ('Proizvodi za žene', 'proizvodi-za-zene'),
  ('Ruska apoteka', 'ruska-apoteka'),
  ('Suplemania', 'suplemania'),
  ('Ulja za masažu', 'ulja-za-masazu'),
  ('Zao prirodna šminka', 'zao-prirodna-sminka');

-- ─── MID CATEGORIES (all under "Apoteka") ──────────────────────────────────────
INSERT INTO mid_categories (label, value, main_category_id) VALUES
  ('Alergije', 'alergije', (SELECT id FROM main_categories WHERE value = 'apoteka')),
  ('Anemija', 'anemija', (SELECT id FROM main_categories WHERE value = 'apoteka')),
  ('Bol', 'bol', (SELECT id FROM main_categories WHERE value = 'apoteka')),
  ('Hemoroidi', 'hemoroidi', (SELECT id FROM main_categories WHERE value = 'apoteka')),
  ('Holesterol i trigliceridi', 'holesterol-i-trigliceridi', (SELECT id FROM main_categories WHERE value = 'apoteka')),
  ('Imunitet, prehlada', 'imunitet-prehlada', (SELECT id FROM main_categories WHERE value = 'apoteka')),
  ('Kosa, koža i nokti', 'kosa-koza-i-nokti', (SELECT id FROM main_categories WHERE value = 'apoteka')),
  ('Kosti i zglobovi', 'kosti-i-zglobovi', (SELECT id FROM main_categories WHERE value = 'apoteka')),
  ('Mršavljenje, celulit', 'mrsavljenje-celulit', (SELECT id FROM main_categories WHERE value = 'apoteka')),
  ('Posebna ishrana', 'posebna-ishrana', (SELECT id FROM main_categories WHERE value = 'apoteka')),
  ('Putna apoteka', 'putna-apoteka', (SELECT id FROM main_categories WHERE value = 'apoteka')),
  ('Stomačne tegobe', 'stomacne-tekobe', (SELECT id FROM main_categories WHERE value = 'apoteka')),
  ('Zdravo srce i cirkulacija', 'zdravo-srce-i-cirkulacija', (SELECT id FROM main_categories WHERE value = 'apoteka')),
  ('Vitamini i minerali', 'vitamini-i-minerali', (SELECT id FROM main_categories WHERE value = 'apoteka')),
  ('Preparati za primenu na koži', 'preparati-za-primenu-na-kozi', (SELECT id FROM main_categories WHERE value = 'apoteka')),
  ('Oči i uši', 'oci-i-usi', (SELECT id FROM main_categories WHERE value = 'apoteka')),
  ('Prva pomoć', 'prva-pomoc', (SELECT id FROM main_categories WHERE value = 'apoteka')),
  ('Energija i umor', 'energija-i-umor', (SELECT id FROM main_categories WHERE value = 'apoteka')),
  ('Sokovi', 'sokovi', (SELECT id FROM main_categories WHERE value = 'apoteka')),
  ('Antioksidansi i detoksikacija', 'antioksidansi-i-detoksikacija', (SELECT id FROM main_categories WHERE value = 'apoteka')),
  ('Biljne kapi, biljna i eterična ulja', 'biljne-kapi-biljna-i-etericna-ulja', (SELECT id FROM main_categories WHERE value = 'apoteka')),
  ('Bubrezi i mokraćni putevi', 'bubrezi-i-mokracni-putevi', (SELECT id FROM main_categories WHERE value = 'apoteka')),
  ('Čajevi', 'cajevi', (SELECT id FROM main_categories WHERE value = 'apoteka')),
  ('Dijabetes i insulinska resistencija', 'dijabetes-i-insulinska-resistencija', (SELECT id FROM main_categories WHERE value = 'apoteka')),
  ('Jetra i žuč', 'jetra-i-zuc', (SELECT id FROM main_categories WHERE value = 'apoteka')),
  ('Kašalj', 'kasalj', (SELECT id FROM main_categories WHERE value = 'apoteka')),
  ('PMS', 'pms', (SELECT id FROM main_categories WHERE value = 'apoteka')),
  ('Menopauza', 'menopauza', (SELECT id FROM main_categories WHERE value = 'apoteka')),
  ('Odvikavanje od alkohola', 'odvikavanje-od-alkohola', (SELECT id FROM main_categories WHERE value = 'apoteka')),
  ('Pamćenje i koncentracija', 'pamcenje-i-koncentracija', (SELECT id FROM main_categories WHERE value = 'apoteka')),
  ('Poremećaj fertiliteta', 'poremecaj-fertiliteta', (SELECT id FROM main_categories WHERE value = 'apoteka')),
  ('Prostata i potencija', 'prostata-i-potencija', (SELECT id FROM main_categories WHERE value = 'apoteka')),
  ('Stres, depresija, nesanica', 'stres-depresija-nesanica', (SELECT id FROM main_categories WHERE value = 'apoteka')),
  ('Dozatori i sekači za lekove', 'dozatori-i-sekaci-za-lekove', (SELECT id FROM main_categories WHERE value = 'apoteka'));

-- ─── SUB CATEGORIES ─────────────────────────────────────────────────────────────

-- Alergije
INSERT INTO sub_categories (label, value, mid_category_id) VALUES
  ('Kapsule i tablete', 'kapsule-i-tablete', (SELECT id FROM mid_categories WHERE value = 'alergije')),
  ('Sprejevi za nos', 'sprejevi-za-nos', (SELECT id FROM mid_categories WHERE value = 'alergije')),
  ('Irigacioni set', 'irigacioni-set', (SELECT id FROM mid_categories WHERE value = 'alergije')),
  ('Masti i gelovi', 'masti-gelovi', (SELECT id FROM mid_categories WHERE value = 'alergije'));

-- Anemija
INSERT INTO sub_categories (label, value, mid_category_id) VALUES
  ('Folna kiselina i vitamini', 'folna-kiselina-i-vitamini', (SELECT id FROM mid_categories WHERE value = 'anemija')),
  ('Biljni preparati', 'biljni-preparati', (SELECT id FROM mid_categories WHERE value = 'anemija')),
  ('Preparati gvožđa', 'preparati-gvozdja', (SELECT id FROM mid_categories WHERE value = 'anemija'));

-- Bol
INSERT INTO sub_categories (label, value, mid_category_id) VALUES
  ('Bol u grlu', 'bol-u-grlu', (SELECT id FROM mid_categories WHERE value = 'bol')),
  ('Menstrualni bolovi', 'menstrualni-bolovi', (SELECT id FROM mid_categories WHERE value = 'bol')),
  ('Bolovi u zglobovima i mišićima', 'bolovi-u-zglobovima-i-misicima', (SELECT id FROM mid_categories WHERE value = 'bol'));

-- Hemoroidi
INSERT INTO sub_categories (label, value, mid_category_id) VALUES
  ('Oralni preparati', 'oralni-preparati', (SELECT id FROM mid_categories WHERE value = 'hemoroidi')),
  ('Lokalna primena', 'lokalna-primena', (SELECT id FROM mid_categories WHERE value = 'hemoroidi')),
  ('Platforma', 'platforma', (SELECT id FROM mid_categories WHERE value = 'hemoroidi'));

-- Holesterol i trigliceridi
INSERT INTO sub_categories (label, value, mid_category_id) VALUES
  ('Omega masne kiseline', 'omega-masne-kiseline', (SELECT id FROM mid_categories WHERE value = 'holesterol-i-trigliceridi')),
  ('Ostalo', 'ostalo', (SELECT id FROM mid_categories WHERE value = 'holesterol-i-trigliceridi'));

-- Imunitet, prehlada
INSERT INTO sub_categories (label, value, mid_category_id) VALUES
  ('Deca', 'deca', (SELECT id FROM mid_categories WHERE value = 'imunitet-prehlada')),
  ('Vitamini i minerali', 'vitemini-i-minerali', (SELECT id FROM mid_categories WHERE value = 'imunitet-prehlada')),
  ('Sprejevi za nos', 'sprejevi-za-nos', (SELECT id FROM mid_categories WHERE value = 'imunitet-prehlada')),
  ('Sprejevi za grlo', 'sprejevi-za-grlo', (SELECT id FROM mid_categories WHERE value = 'imunitet-prehlada')),
  ('Irigacioni set', 'irigacioni-set', (SELECT id FROM mid_categories WHERE value = 'imunitet-prehlada')),
  ('Masti i gelovi', 'masti-gelovi', (SELECT id FROM mid_categories WHERE value = 'imunitet-prehlada')),
  ('Biljne kapi', 'biljne-kapi', (SELECT id FROM mid_categories WHERE value = 'imunitet-prehlada')),
  ('Med, matični mleč i propolis', 'med-maticni-mlec-i-propolis', (SELECT id FROM mid_categories WHERE value = 'imunitet-prehlada')),
  ('Pastile za grlo', 'pastile-za-grlo', (SELECT id FROM mid_categories WHERE value = 'imunitet-prehlada')),
  ('Aloja, ehinacea, noni, aronija', 'aloja-ehinacea-noni-aronija', (SELECT id FROM mid_categories WHERE value = 'imunitet-prehlada')),
  ('Probiotici', 'probiotici', (SELECT id FROM mid_categories WHERE value = 'imunitet-prehlada')),
  ('Omega masne kiseline', 'omega-masne-kiseline', (SELECT id FROM mid_categories WHERE value = 'imunitet-prehlada')),
  ('Ostalo', 'ostalo', (SELECT id FROM mid_categories WHERE value = 'imunitet-prehlada'));

-- Kosa, koža i nokti
INSERT INTO sub_categories (label, value, mid_category_id) VALUES
  ('Oralni preparati', 'oralni-preparati', (SELECT id FROM mid_categories WHERE value = 'kosa-koza-i-nokti')),
  ('Lokalna primena', 'lokalna-primena', (SELECT id FROM mid_categories WHERE value = 'kosa-koza-i-nokti'));

-- Kosti i zglobovi
INSERT INTO sub_categories (label, value, mid_category_id) VALUES
  ('Oralni preparati', 'oralni-preparati', (SELECT id FROM mid_categories WHERE value = 'kosti-i-zglobovi')),
  ('Primena na koži', 'primena-na-kozi', (SELECT id FROM mid_categories WHERE value = 'kosti-i-zglobovi'));

-- Mršavljenje, celulit
INSERT INTO sub_categories (label, value, mid_category_id) VALUES
  ('Oralni preparati', 'oralni-preparati', (SELECT id FROM mid_categories WHERE value = 'mrsavljenje-celulit')),
  ('Primena na koži', 'primena-na-kozi', (SELECT id FROM mid_categories WHERE value = 'mrsavljenje-celulit'));

-- Posebna ishrana
INSERT INTO sub_categories (label, value, mid_category_id) VALUES
  ('Kaše', 'kase', (SELECT id FROM mid_categories WHERE value = 'posebna-ishrana')),
  ('Šejkovi', 'sejkovi', (SELECT id FROM mid_categories WHERE value = 'posebna-ishrana')),
  ('Sportisti', 'sportisti', (SELECT id FROM mid_categories WHERE value = 'posebna-ishrana')),
  ('Zaslađivači', 'zasladjivaci', (SELECT id FROM mid_categories WHERE value = 'posebna-ishrana')),
  ('Bombone', 'bombone', (SELECT id FROM mid_categories WHERE value = 'posebna-ishrana'));

-- Putna apoteka
INSERT INTO sub_categories (label, value, mid_category_id) VALUES
  ('Dehidratacija', 'dehidratacija', (SELECT id FROM mid_categories WHERE value = 'putna-apoteka')),
  ('Dijareja', 'dijareja', (SELECT id FROM mid_categories WHERE value = 'putna-apoteka')),
  ('Mučnina', 'mucnina', (SELECT id FROM mid_categories WHERE value = 'putna-apoteka')),
  ('Auto-apoteka', 'auto-apoteka', (SELECT id FROM mid_categories WHERE value = 'putna-apoteka'));

-- Stomačne tegobe
INSERT INTO sub_categories (label, value, mid_category_id) VALUES
  ('Nadutost i gasovi', 'nadutost-i-gasovi', (SELECT id FROM mid_categories WHERE value = 'stomacne-tekobe')),
  ('Zatvor', 'zatvor', (SELECT id FROM mid_categories WHERE value = 'stomacne-tekobe')),
  ('Dijareja', 'dijareja', (SELECT id FROM mid_categories WHERE value = 'stomacne-tekobe')),
  ('Iritabilni kolon', 'iritabilni-kolon', (SELECT id FROM mid_categories WHERE value = 'stomacne-tekobe')),
  ('Otežano varenje i gorušica', 'otezano-varenje-i-gorusica', (SELECT id FROM mid_categories WHERE value = 'stomacne-tekobe'));

-- Zdravo srce i cirkulacija
INSERT INTO sub_categories (label, value, mid_category_id) VALUES
  ('Oralni preparati', 'oralni-preparati', (SELECT id FROM mid_categories WHERE value = 'zdravo-srce-i-cirkulacija')),
  ('Primena na koži', 'primena-na-kozi', (SELECT id FROM mid_categories WHERE value = 'zdravo-srce-i-cirkulacija'));

-- Vitamini i minerali
INSERT INTO sub_categories (label, value, mid_category_id) VALUES
  ('Vitamin A', 'vitamin-a', (SELECT id FROM mid_categories WHERE value = 'vitamini-i-minerali')),
  ('Vitamin B', 'vitamin-b', (SELECT id FROM mid_categories WHERE value = 'vitamini-i-minerali')),
  ('Vitamin C', 'vitamin-c', (SELECT id FROM mid_categories WHERE value = 'vitamini-i-minerali')),
  ('Vitamin D', 'vitamin-d', (SELECT id FROM mid_categories WHERE value = 'vitamini-i-minerali')),
  ('Vitamin K', 'vitamin-k', (SELECT id FROM mid_categories WHERE value = 'vitamini-i-minerali')),
  ('Cink', 'cink', (SELECT id FROM mid_categories WHERE value = 'vitamini-i-minerali')),
  ('Kalijum', 'kalijum', (SELECT id FROM mid_categories WHERE value = 'vitamini-i-minerali')),
  ('Kalcijum', 'kalcijum', (SELECT id FROM mid_categories WHERE value = 'vitamini-i-minerali')),
  ('Hrom', 'hrom', (SELECT id FROM mid_categories WHERE value = 'vitamini-i-minerali')),
  ('Magnezijum', 'magnezijum', (SELECT id FROM mid_categories WHERE value = 'vitamini-i-minerali')),
  ('Selen', 'selen', (SELECT id FROM mid_categories WHERE value = 'vitamini-i-minerali')),
  ('Gvožđe', 'gvozdje', (SELECT id FROM mid_categories WHERE value = 'vitamini-i-minerali')),
  ('Bakar', 'bakar', (SELECT id FROM mid_categories WHERE value = 'vitamini-i-minerali')),
  ('Bor', 'bor', (SELECT id FROM mid_categories WHERE value = 'vitamini-i-minerali')),
  ('Fluor', 'fluor', (SELECT id FROM mid_categories WHERE value = 'vitamini-i-minerali')),
  ('Fosfor', 'fosfor', (SELECT id FROM mid_categories WHERE value = 'vitamini-i-minerali')),
  ('Kompleksi vitamina i minerala', 'kompleksi-vitamina-i-minerala', (SELECT id FROM mid_categories WHERE value = 'vitamini-i-minerali')),
  ('Riblja ulja', 'riblja-ulja', (SELECT id FROM mid_categories WHERE value = 'vitamini-i-minerali')),
  ('Deca', 'deca', (SELECT id FROM mid_categories WHERE value = 'vitamini-i-minerali')),
  ('Sportisti', 'sportisiti', (SELECT id FROM mid_categories WHERE value = 'vitamini-i-minerali')),
  ('Trudnice', 'trudnice', (SELECT id FROM mid_categories WHERE value = 'vitamini-i-minerali')),
  ('Stariji', 'stariji', (SELECT id FROM mid_categories WHERE value = 'vitamini-i-minerali'));

-- Preparati za primenu na koži
INSERT INTO sub_categories (label, value, mid_category_id) VALUES
  ('Iritacije', 'iritacije', (SELECT id FROM mid_categories WHERE value = 'preparati-za-primenu-na-kozi')),
  ('Ožiljci i strije', 'oziljci-i-strije', (SELECT id FROM mid_categories WHERE value = 'preparati-za-primenu-na-kozi')),
  ('Hemoroidi', 'hemoroidi', (SELECT id FROM mid_categories WHERE value = 'preparati-za-primenu-na-kozi')),
  ('Problemi sa cirkulacijom', 'problemi-sa-cirkulacijom', (SELECT id FROM mid_categories WHERE value = 'preparati-za-primenu-na-kozi')),
  ('Intimna nega', 'intimna-nega', (SELECT id FROM mid_categories WHERE value = 'preparati-za-primenu-na-kozi')),
  ('Opekotine', 'opekotine', (SELECT id FROM mid_categories WHERE value = 'preparati-za-primenu-na-kozi')),
  ('Sportske povrede', 'sportske-povrede', (SELECT id FROM mid_categories WHERE value = 'preparati-za-primenu-na-kozi')),
  ('Reuma', 'reuma', (SELECT id FROM mid_categories WHERE value = 'preparati-za-primenu-na-kozi')),
  ('Antiseptici', 'antiseptici', (SELECT id FROM mid_categories WHERE value = 'preparati-za-primenu-na-kozi')),
  ('Gljivice', 'gljivice', (SELECT id FROM mid_categories WHERE value = 'preparati-za-primenu-na-kozi')),
  ('Rozacea', 'rozacea', (SELECT id FROM mid_categories WHERE value = 'preparati-za-primenu-na-kozi')),
  ('Vitiligo', 'vitiligo', (SELECT id FROM mid_categories WHERE value = 'preparati-za-primenu-na-kozi')),
  ('Boginje', 'boginje', (SELECT id FROM mid_categories WHERE value = 'preparati-za-primenu-na-kozi')),
  ('Herpes', 'herpes', (SELECT id FROM mid_categories WHERE value = 'preparati-za-primenu-na-kozi')),
  ('Seboreični dermatitis', 'seboreicni-dermatitis', (SELECT id FROM mid_categories WHERE value = 'preparati-za-primenu-na-kozi')),
  ('Žuljevi, kurje oči, bradavice', 'zuljevi-kurje-oci-bradavice', (SELECT id FROM mid_categories WHERE value = 'preparati-za-primenu-na-kozi')),
  ('Ekcem, psorijaza', 'ekcem-psorijaza', (SELECT id FROM mid_categories WHERE value = 'preparati-za-primenu-na-kozi')),
  ('Suva, atopijska koža', 'suva-atopijska-koza', (SELECT id FROM mid_categories WHERE value = 'preparati-za-primenu-na-kozi')),
  ('Lokalni anestetici', 'lokalni-anestetici', (SELECT id FROM mid_categories WHERE value = 'preparati-za-primenu-na-kozi')),
  ('Površinske rane', 'povrsinske-rane', (SELECT id FROM mid_categories WHERE value = 'preparati-za-primenu-na-kozi'));

-- Oči i uši
INSERT INTO sub_categories (label, value, mid_category_id) VALUES
  ('Tablete, kapsule, rastvori', 'tablete-kapsule-rastvori', (SELECT id FROM mid_categories WHERE value = 'oci-i-usi')),
  ('Higijena i nega', 'higijena-nega', (SELECT id FROM mid_categories WHERE value = 'oci-i-usi')),
  ('Kapi', 'kapi', (SELECT id FROM mid_categories WHERE value = 'oci-i-usi')),
  ('Masti', 'masti', (SELECT id FROM mid_categories WHERE value = 'oci-i-usi')),
  ('Naočare', 'naocare', (SELECT id FROM mid_categories WHERE value = 'oci-i-usi')),
  ('Tečnosti i kutije za sočiva', 'tecnosti-i-kutije-za-sociva', (SELECT id FROM mid_categories WHERE value = 'oci-i-usi')),
  ('Čepovi za uši', 'cepovi-za-usi', (SELECT id FROM mid_categories WHERE value = 'oci-i-usi')),
  ('Sprejevi', 'sprejevi', (SELECT id FROM mid_categories WHERE value = 'oci-i-usi'));
