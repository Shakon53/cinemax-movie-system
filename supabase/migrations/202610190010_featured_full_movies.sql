-- User-selected full movies lead the default catalog, before pagination.
begin;
alter table public.movies add column if not exists "catalogPriority" integer not null default 0;
update public.movies m set "catalogPriority"=p.priority from (values
('Иван Васильевич меняет профессию',1973,11),
('Операция "Ы" и другие приключения Шурика',1965,10),
('Бриллиантовая рука',1968,9),
('Кавказская пленница, или Новые приключения Шурика',1966,8),
('Любовь и голуби',1984,7),
('Хитровка. Знак четырёх',2023,6),
('Решение о ликвидации',2018,5),
('Анна Каренина. История Вронского',2017,4),
('Сдается дом со всеми неудобствами',2016,3),
('Дорога на Берлин',2015,2),
('Владивосток',2021,1)
) as p(title,year,priority) where m.title=p.title and m."releaseYear"=p.year;
commit;
