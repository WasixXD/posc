CREATE TABLE deck(
    deck_id serial primary key,
    name varchar(50) not null,

    total_questions int default  0,
    correctness_percent real default 0
);

CREATE TABLE tag (
    tag_id serial primary key,
    deck_id int references deck (deck_id),
    name varchar(50) not null
);

CREATE TABLE performance (
    tag_id int references tag (tag_id) primary key,
    errors int default 0,
    corrects int default 0
);

CREATE TABLE question (
    q_id serial primary key,
    deck_id int references deck (deck_id),
    tag_id int references tag (tag_id),

    question text not null default '/',
    correct char not null default 'A'
);



