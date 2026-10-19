# Зарубежные полные фильмы 2023–2024

Добавлены три полнометражных фильма с оригинальной английской озвучкой и настоящими постерами:

| Фильм | Год выпуска | Источник полного просмотра | Постер / метаданные |
|---|---:|---|---|
| The Manifestation | 2024 | [Movie Central](https://www.youtube.com/watch?v=pPpqd-A4TRA) | [Vision Films](https://visionfilms.net/film-detail?id=a9b484ca-bbb0-ee11-829d-0e4a64f8a357), [пресс-релиз](https://www.prnewswire.com/news-releases/vision-films-announces-release-of-the-manifestation-a-psychological-thriller-available-march-19th-302070511.html) |
| Sirona | 2023 | [Movie Central](https://www.youtube.com/watch?v=XF33FZh5CeU) | [Cranked Up Films](https://crankedupfilms.com/sirona) |
| The Hive | 2023 | [Movie Central](https://www.youtube.com/watch?v=FUbbbwIUI6Q) | [Пресс-релиз Buffalo 8 с постером](https://www.indieactivity.com/the-hive-sci-fi-home-invasion-thriller-breaks-into-home-video-oct-27/) |

В описаниях источников указаны лицензирующие компании: Vision Films, Good Deed Entertainment и Buffalo 8. Проверен канал Movie Central `UCGBzBkV-MinlBvHBzZawfLQ`, длительность полных видео (85, 104 и 87 минут после округления), статус YouTube `OK` и разрешение `playableInEmbed: true`. Год выпуска берётся из сведений о самом фильме, а не из рекламного заголовка видео «2024». Длительность относится к выбранной версии с возможными заставками.

Обложки сохранены локально, визуально проверены; добавлена поддержка PNG-постера Sirona в проверке URL сайта и SQL. Все фильмы помечены «Английский» и «На английском», русская озвучка не заявлена. Описания написаны для CineMax, актёры добавлены для поиска. Оценки CineMax не выдумывались.

Миграция `202610190011_recent_licensed_movies.sql` добавляет записи без дублей. Повторное применение проверяется в PostgreSQL-тесте. После неё в каталоге 50 опубликованных фильмов, 18 с полным просмотром, из них четыре короткометражных Blender. Порядок ранее закреплённых 11 фильмов сохраняется.

Проверка метаданных и разрешения на встраивание не заменяет просмотр от начала до конца. Доступность видео и субтитров зависит от YouTube и региона. Копии видео в Supabase не хранятся; используется официальный встроенный плеер лицензированного канала. Частные видео, трейлеры и источник с запретом на встраивание исключены.
