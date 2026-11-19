# Rakan Shop — Jordanian Arabic seed catalog

The seed script contains **120 product names: 20 per category**. Product names are intentionally single-word Arabic labels. It submits these Arabic names to Azure Translator (`ar` → `en`), stores the original Jordanian Arabic in `nameAr`, and stores the returned English translation in `name`. Category names follow the same flow.

## خضرة — 20 products

بندورة، خيار، بطاطا، كوسا، باذنجان، بصل، جزر، زهرة، فليفلة، ثوم، ملفوف، خس، سبانخ، ملوخية، بامية، فجل، لفت، بقدونس، نعنع، بازيلا

## فواكه — 20 products

تفاح، موز، فراولة، برتقال، كلمنتينا، ليمون، عنب، بطيخ، رمان، تين، مشمش، خوخ، دراق، كرز، إجاص، كيوي، مانجا، جوافة، أفوكادو، تمر

## لحوم — 20 products

غنم، عجل، دجاج، حبش، مفروم، كفتة، كباب، ريش، موزات، كبدة، قلوب، قوانص، صدور، أفخاذ، أجنحة، شاورما، نقانق، سجق، ستيك، فيليه

## ألبان — 20 products

حليب، لبن، لبنة، شنينة، جميد، نابلسية، عكاوي، حلوم، قريشة، زبدة، قشطة، كريمة، موزاريلا، شيدر، بارميزان، فيتا، بيض، زبادي، سمنة، جبنة

## عصاير — 20 products

برتقال، ليمون، رمان، تفاح، جزر، مانجا، فراولة، موز، جوافة، أناناس، شمام، بطيخ، كيوي، خوخ، عنب، كرز، تمرهندي، أفوكادو، قصب، مشمش

## تموين — 20 products

رز، سكر، ملح، طحين، عدس، حمص، فاصوليا، برغل، فريكة، معكرونة، شعيرية، زيت، زيتون، زعتر، سماق، طحينية، دبس، قهوة، شاي، مربى

## Important translation note

Azure Translator uses the general Arabic language code (`ar`); it is not a dedicated Jordanian dialect model. The input vocabulary is Jordanian/local Arabic, but translation quality for colloquial dialect terms must be checked against the English `name` values after seeding. The original submitted Arabic remains unchanged in `nameAr`.
