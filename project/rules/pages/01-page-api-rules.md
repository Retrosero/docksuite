# Page API Rules

1. Listeleme için önce GET /api/resource/{DocType} kullan.
2. Tek kayıt için GET /api/resource/{DocType}/{name} kullan.
3. Filtreleme ve sayfalamayı standart query parametreleriyle yap.
4. Özel endpoint ancak standart resource API yetmezse düşünülür.
5. Response modelleri TypeScript tipleriyle eşleştirilmelidir.
